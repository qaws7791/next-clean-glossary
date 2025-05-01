"use client";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ThemeProvider attribute="class">{children}</ThemeProvider>
    </HeroUIProvider>
  );
}
