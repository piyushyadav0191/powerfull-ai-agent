
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center mb-8">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to AI Agent Chat</h1>
      <p className="text-gray-600 text-center max-w-2xl mb-8">
        Experience the next generation of AI assistance with our powerful chatbot. Get instant help,
        smart recommendations, and access to advanced tools all in one place.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Badge variant="default" className="px-4 py-2">
          Realtime Responses
        </Badge>
        <Badge variant="destructive" className="px-4 py-2">
          Smart Assistance
        </Badge>
        <Badge variant="outline" className="px-4 py-2">
          Powerful Tools
        </Badge>
      </div>
    </div>
  );
}
