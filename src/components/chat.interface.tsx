"use client";

import { useEffect, useRef, useState } from "react";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { ChatRequestBody, StreamMessageType } from "@/lib/type";
import { createSSEParser } from "@/lib/createSSEparser";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../convex/_generated/api";
import MessageBubble from "./message.bubble";

interface ChatInterfaceProps {
  chatId: Id<"chats">;
  initialMessages: Doc<"messages">[];
}

const ChatInterface = ({ chatId, initialMessages }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [streamedResponse, setStreamedResponse] = useState<string>("");
  const [currentTool, setCurrentTool] = useState<{
    name: string;
    input: unknown;
  } | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const formatToolOutput = (output: unknown): string => {
    if (typeof output === "string") {
      return output;
    }

    return JSON.stringify(output, null, 2);
  };

  const formatTerminalOutput = (
    tool: string,
    input: unknown,
    output: unknown
  ) => {
    const terminalHtml = `<div class="bg-[#1e1e1e] text-white p-4 rounded-xl font-mono my-2 overflow-x-auto whitespace-normal max-w-[600px] mb-2">
    <div class="flex items-center gap-1.5 border-b border-gray-700 pb-2">
    <span class="text-red-500">⬤</span>
    <span class="text-yellow-500">⬤</span>
    <span class="text-green-500">⬤</span>
    <span class="text-gray-400 ml-1 text-sm">~/${tool}</span>
    </div>
    <div class="text-gray-400">Input</div>
    <pre class="text-yellow-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(input)}</pre>
    <div class="text-gray-400 mt-2">Output</div>
    <pre class="text-green-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(output)}</pre>
    </div>
    `;
    return `---START---\n${terminalHtml}\n---END---\n`;
  };

  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: string) => Promise<void>
  ) => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        await onChunk(chunk);
      }
    } catch (error) {
      console.error(error);
    } finally {
      reader.releaseLock();
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    setInput("");
    setStreamedResponse("");
    setCurrentTool(null);
    setLoading(true);

    const optimisticUserMessage: Doc<"messages"> = {
      _id: `temp_${Date.now()}`,
      chatId,
      content: trimmedInput,
      role: "user",
      createdAt: Date.now(),
    } as Doc<"messages">;

    setMessages((prev) => [...prev, optimisticUserMessage]);

    let fullResponse = "";

    try {
      const requestBody: ChatRequestBody = {
        messages: messages.map((msg) => ({
          content: msg.content,
          role: msg.role,
        })),
        newMessage: trimmedInput,
        chatId,
      };

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.body) {
        throw new Error("Response body is not readable");
      }

      if (!response.ok) {
        throw new Error("Response is not ok");
      }

      // handling streaming

      const parser = createSSEParser();
      const reader = response.body.getReader();

      await processStream(reader, async (chunk) => {
        const messages = parser.parse(chunk);
        for (const message of messages) {
          switch (message.type) {
            case StreamMessageType.Token:
              if ("token" in message) {
                fullResponse += message.token;
                setStreamedResponse(fullResponse);
              }
              break;

            case StreamMessageType.ToolStart:
              if ("tool" in message) {
                setCurrentTool({
                  name: message.tool,
                  input: message.input,
                });

                // format terminal output
                fullResponse += formatTerminalOutput(
                  message.tool,
                  message.input,
                  "Processing..."
                );
                setStreamedResponse(fullResponse);
              }
              break;

            case StreamMessageType.ToolEnd:
              if ("tool" in message && currentTool) {
                const lastTerminalIndex = fullResponse.lastIndexOf(
                  `<div class="bg-[#1e1e1e]`
                );
                if (lastTerminalIndex !== -1) {
                  fullResponse += formatTerminalOutput(
                    message.tool,
                    currentTool.input,
                    message.output
                  );
                  setStreamedResponse(fullResponse);
                }
                setCurrentTool(null);
              }
              break;

            case StreamMessageType.Error:
              if ("error" in message) {
                throw new Error(message.error);
              }
              break;

            case StreamMessageType.Done:
              const assistanrMessage: Doc<"messages"> = {
                _id: `temp_assistant_${Date.now()}`,
                chatId,
                content: fullResponse,
                role: "assistant",
                createdAt: Date.now(),
              } as Doc<"messages">;

              const convex = getConvexClient();
              await convex.mutation(api.messages.store, {
                chatId,
                content: fullResponse,
                role: "assistant",
              });

              setMessages((prev) => [...prev, assistanrMessage]);
              setStreamedResponse("");
              return;
          }
        }
      });
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== optimisticUserMessage._id)
      );

      setStreamedResponse("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
      <section className="flex-1 overflow-y-auto bg-gray-50 p-2 md:p-0">
        <div className="max-w-4xl mx-auto p-4 space-y-5">
          {messages.map((message: Doc<"messages">) => (
            <MessageBubble key={message._id} content={message.content} isUser={message.role === "user"}  />
         
          ))}

          {streamedResponse && <MessageBubble content={streamedResponse} />}

          {loading && streamedResponse && (
              <div className="flex justify-start animate-in fade-in-0">
                <div className="rounded-2xl px-4 py-3 bg-white text-gray-900 rounded-bl-none shadow-sm ring-1 ring-inset ring-gray-200">
                <div className="flex items-center gap-1.5">
                {[0.3, 0.15, 0].map((delay, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `-${delay}s` }}
                  />
                ))}
                </div>
                </div>
              </div>
          )}

          <div ref={messageEndRef} />
        </div>
      </section>

      <footer className="border-t bg-white p-4">
        <form className="max-w-4xl mx-auto relative" onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:border-transparent pr-12 bg-gray-50 placeholder:text-gray-500"
              disabled={loading}
            />
            <Button
              type="submit"
              className={`absolute right-1.5 rounded-xl h-9 w-9 p-0 items-center justify-center transition-all ${
                input.trim()
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <ArrowRight />
            </Button>
          </div>
        </form>
      </footer>
    </main>
  );
};

export default ChatInterface;
