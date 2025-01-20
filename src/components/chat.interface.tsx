"use client";

import { useEffect, useRef, useState } from "react";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { ChatRequestBody, StreamMessageType } from "@/lib/type";
import { createSSEParser } from "@/lib/createSSEparser";

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

  const processStream = async (reader: ReadableStreamDefaultReader<Uint8Array>, onChunk: (chunk: string) => Promise<void>) => {

      try {
        while(true){
            const {done, value} = await reader.read()
            if(done) break
            const chunk = new TextDecoder().decode(value)
            await onChunk(chunk)
        }
      } catch (error) {
          console.error(error); 
      } finally {
        reader.releaseLock()
      }

  }


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
    } as Doc<"messages">

    setMessages((prev) => [...prev, optimisticUserMessage]);

    let fullResponse = ""

    try {
        const requestBody: ChatRequestBody = {
            messages: messages.map((msg) => ({
                content: msg.content,
                role: msg.role,
            })),
            newMessage: trimmedInput,
            chatId
        }

        const response = await fetch("/api/chat/stream", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if(!response.body) {
            throw new Error("Response body is not readable");
        }

        if(!response.ok) {
            throw new Error("Response is not ok");
        }

        // handling streaming

        const parser = createSSEParser()
        const reader = response.body.getReader()

        await processStream(reader, async (chunk) => {
          const messages = parser.parse(chunk)
          for (const message of messages){
            switch(message.type){
              case StreamMessageType.Token:
                if("token" in message){
                  fullResponse += message.token
                  setStreamedResponse(fullResponse)
                }
                break

                case StreamMessageType.ToolStart:
                  if("tool" in message){
                    setCurrentTool({
                      name: message.tool,
                      input: message.input
                    })

                    // format terminal output
                  }
            }
          }
        })


    } catch (error) {
        console.error(error);
        setMessages((prev) => prev.filter((msg) => msg._id !== optimisticUserMessage._id));

        setStreamedResponse("An error occurred. Please try again.");
        
    }finally{
        setLoading(false);
    }

  };

  return (
    <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
      <section className="flex-1">
        <div>

            {messages.map((message) => (
                <div key={message._id} className="flex justify-end">
                <div className="max-w-[calc(100%-theme(spacing.4))] bg-blue-500 text-white rounded-xl p-4 mb-2">
                    {message.content}
                </div>
                </div>
            ))}

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
