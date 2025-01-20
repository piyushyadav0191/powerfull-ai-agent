"use client";

import { useState } from "react";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

interface ChatInterfaceProps {
  chatId: Id<"chats">;
  initialMessages: Doc<"messages">[];
}

const ChatInterface = ({ chatId, initialMessages }: ChatInterfaceProps) => {

    const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
       
    };

  return <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
    <section className="flex-1"></section>

    <footer className="border-t bg-white p-4">
        <form className="max-w-4xl mx-auto relative" onSubmit={handleSubmit}>
            <div className="relative flex items-center">
                <input type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:border-transparent pr-12 bg-gray-50 placeholder:text-gray-500"
                disabled={loading}
                />
                <Button type="submit" className={`absolute right-1.5 rounded-xl h-9 w-9 p-0 items-center justify-center transition-all ${
                    input.trim() ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                }`}>

                    <ArrowRight />
                </Button>
            </div>
        </form>
    </footer>
  </main>;
};

export default ChatInterface;
