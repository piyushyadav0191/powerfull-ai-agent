import { MenuIcon } from "lucide-react";
import { Button } from "./button";
import { UserButton } from "@clerk/nextjs";
import { use } from "react";
import { NavigationContext } from "@/lib/nav.provider";

export default function Header() {
  const { setIsMobileNavOpen } = use(NavigationContext);

  return (
    <header className="border-b border-gray-200/50 bg-white/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => setIsMobileNavOpen(true)}
            className="md:hidden text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <div className="font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Chat with an AI Agent
          </div>
        </div>
        <div className="flex-items-center">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox:
                  "h-8 w-9 ring-2 ring-gray-200/50 ring-offset-2 rounded-full transition-shadow hover:ring-gray-200/50",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
