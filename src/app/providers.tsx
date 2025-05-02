"use client";
import { TRPCProvider } from "@/lib/trpc/client";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <HeroUIProvider>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </HeroUIProvider>
    </TRPCProvider>
  );
}
