"use client";

import Sidebar from "@/components/sidebar";
import Header from "@/components/ui/header";
import NavigationProvider from "@/lib/nav.provider";
import { Authenticated } from "convex/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <div className="flex  h-screen">
        <Authenticated>
          <Sidebar />
        </Authenticated>
        <main className="flex-1">
          <Header />
          {children}
        </main>
      </div>
    </NavigationProvider>
  );
}
