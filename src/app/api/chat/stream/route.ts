import { SSE_DATA_PREFIX, SSE_LINE_DELIMITER } from "@/lib/constant";
import { getConvexClient } from "@/lib/convex";
import { ChatRequestBody, StreamMessage, StreamMessageType } from "@/lib/type";
import { auth } from "@clerk/nextjs/server";
import { api } from "../../../../../convex/_generated/api";

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
      } catch (error) {
        return new Response(JSON.stringify({ error: error }), { status: 500 });
      }
    })();

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}
