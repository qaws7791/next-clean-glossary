"use client";
import Sidebar from "@/components/sidebar";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row h-full w-full min-h-dvh">
      <Sidebar />
      {children}
    </div>
  );
}
