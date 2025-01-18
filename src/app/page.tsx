import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

const features = [
  {
    title: "Fast",
    description:
      "Real-time streamed responses from AI agents, ensuring you get the most up-to-date information and insights.",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    title: "Smart",
    description:
      "Intelligent task management with AI-powered suggestions and automated workflows.",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h6m2 0a2 2 0 104 0v-4a2 2 0 10-4 0m-6 8a2 2 0 104 0v-4a2 2 0 10-4 0"
        />
      </svg>
    ),
  },
  {
    title: "Efficient",
    description: "Streamlined workflows with AI-driven task completion .",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h6m2 0a2 2 0 104 0v-4a2 2 0 10-4 0m-6 8a2 2 0 104 0v-4a2 2 0 10-4 0"
        />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50/50 flex items-center justify-center">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_bottom,rgba(255,255,255,0.15),rgba(255,255,255,0))]" />
      <section className="w-full px-4 py-9 mx-auto max-w-7xl sm:px-8 lg:px-8 flex flex-col items-center space-y-10 text-center">
        <header className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Your AI-Powered <span className="text-blue-600">Productivity</span>{" "}
            Partner
          </h1>
          <p className="text-xl text-gray-500">
            Streamline your workflow with our AI-powered tools.
          </p>
        </header>
        <SignedIn>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Get Started
          </Link>
        </SignedIn>
        <SignedOut>
          <SignInButton
            mode="modal"
            fallbackRedirectUrl={"/dashboard"}
            forceRedirectUrl={"/dashboard"}
          >
            <button className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95">
              <span>Get Started</span>
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </SignInButton>
        </SignedOut>
        {/* features grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-start justify-start p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
