import { NavigationContext } from "@/lib/nav.provider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ChatRow } from "./chat.row";

export default function Sidebar() {
  const router = useRouter();
  const { closeMobileNav, isMobileNavOpen } = use(NavigationContext);

  const chats = useQuery(api.chats.getChats);
  const createChat = useMutation(api.chats.createChat);
  const deleteChat = useMutation(api.chats.deleteChat);

  const handleClick = () => {
    // router.push("/chat");
    closeMobileNav();
  };

  const handleNewChat = async () => {
    try {
      const chatId = await createChat({ title: "New Chat" });
      router.push(`/dashboard/chat/${chatId}`);
      closeMobileNav();
    } catch (error) {
      console.error("Failed to create chat", error);
    }
  };

  const handleDeleteChat = async (id: Id<"chats">) => {
    try {
      await deleteChat({ id });

      if (window.location.pathname.includes(id)) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base styles
          "fixed md:sticky top-0 left-0 h-full w-72 bg-gray-50/80 border-r",
          "flex flex-col overflow-hidden z-50",
          // Mobile styles
          "transition-transform duration-300 ease-in-out",
          "md:transform-none",
          // Mobile nav state
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
          // Responsive adjustments
          "mt-24 md:mt-0"
        )}
      >
        {/* New Chat Button Section */}
        <div className="p-4 border-b">
          <button
            onClick={handleNewChat}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg",
              "bg-blue-500 hover:bg-blue-600",
              "text-white font-medium",
              "flex items-center justify-center",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
          >
            <Plus className="w-5 h-5 mr-2" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat List Section */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {/* Chat list will go here */}
            {chats?.map((chat) => (
              <ChatRow key={chat._id} chat={chat} onDelete={handleDeleteChat} />
            ))}
          </nav>
        </div>

        {/* Optional: Footer Section */}
        <div className="p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-500">copyrite@piyush</div>
        </div>
      </aside>
    </>
  );
}
