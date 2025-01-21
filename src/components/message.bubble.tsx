"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { BotIcon } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  isUser?: boolean;
}

const formatMessage = (content: string): string => {
  content = content.replace(/\\\\</g, "\\");

  content = content.replace(/\\</g, "\n");

  content = content.replace(/---START---\n?/g, "").replace(/\n?---END---/g, "");

  return content.trim();
};

const MessageBubble = ({ content, isUser }: MessageBubbleProps) => {
  const { user } = useUser();
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-2xl px-4 py-2.5 max-w-[85%] md:max-w-[75%] shadow-sm ring-1 ring-inset relative ${isUser ? "bg-blue-500 text-white rounded-br-none ring-blue-700" : "bg-gray-100 text-gray-800 rounded-bl-none ring-gray-200"}`}
      >
        <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
          <div dangerouslySetInnerHTML={{ __html: formatMessage(content) }} />
        </div>
        <div
          className={`aboslute bottom-0 ${isUser ? "right-0 translate-x-1/2 translate-y-1/2" : "left-0 -translate-x-1/2 translate-y-1/2"}`}
        >
          <div
            className={`w-8 h-8 rounded border-2 ${isUser ? "bg-white border-gray-100" : "bg-blue-600 border-white"} flex items-center justify-center shadow-sm`}
          >
            {isUser ? (
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.imageUrl} alt={user?.firstName!} />
                <AvatarFallback>{user?.firstName![0]}</AvatarFallback>
              </Avatar>
            ) : (
              <BotIcon className="h-5 w-5 text-white" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
