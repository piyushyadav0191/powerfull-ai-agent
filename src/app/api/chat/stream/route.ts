import { SSE_DATA_PREFIX, SSE_LINE_DELIMITER } from "@/lib/constant";
import { getConvexClient } from "@/lib/convex";
import { ChatRequestBody, StreamMessage, StreamMessageType } from "@/lib/type";
import { auth } from "@clerk/nextjs/server";
import { api } from "../../../../../convex/_generated/api";
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { submitQuestion } from "@/lib/langgraph";

function sendSSEMessage(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder();
  return writer.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  );
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    const { chatId, messages, newMessage } =
      (await req.json()) as ChatRequestBody;

    const convex = getConvexClient();

    const stream = new TransformStream({}, { highWaterMark: 1024 });
    const writer = stream.writable.getWriter();

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

    (async () => {
      try {
        await sendSSEMessage(writer, { type: StreamMessageType.Connected });

        await convex.mutation(api.messages.send, {
          chatId,
          content: newMessage,
        });

        const langchainMessages = [
          ...messages.map((msg) =>
            msg.role === "user"
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content)
          ),
          new HumanMessage(newMessage),
        ];

        try {
          const eventStream = await submitQuestion(langchainMessages, chatId);

          for await (const event of eventStream) {
            if (event.event === "on_chat_model_stream") {
              const token = event.data.chunk;

              if (token) {
                const text = token.content.at(0)?.["text"];
                if (text) {
                  await sendSSEMessage(writer, {
                    type: StreamMessageType.Token,
                    token: text,
                  });
                }
              }
            } else if (event.event === "on_tool_start") {
                await sendSSEMessage(writer, {
                    type: StreamMessageType.ToolStart,
                    tool: event.name || "unknown",
                    input: event.data.input,
                })
            } else if (event.event === "on_tool_end") {
                const toolMsg = new ToolMessage(event.data.output)
                await sendSSEMessage(writer, {
                    type: StreamMessageType.ToolEnd,
                    tool: toolMsg.lc_kwargs.name || "unknown",
                    output: event.data.output,
                })
            }

            await sendSSEMessage(writer, { type: StreamMessageType.Done });
          }
        } catch (streamError) {
          console.error("Stream error", streamError);
          await sendSSEMessage(writer, {
            type: StreamMessageType.Error,
            error:
              streamError instanceof Error
                ? streamError.message
                : "Stream processing failed",
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({ error: error }), { status: 500 });
      }
    })();

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}
