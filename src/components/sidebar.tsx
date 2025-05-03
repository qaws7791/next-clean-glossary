"use client";
import AddGlossaryModal from "@/components/add-glossary-modal";
import { trpc } from "@/lib/trpc/client";
import { Listbox, ListboxItem } from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

export default function Sidebar() {
  const glossary = trpc.glossary.listMine.useQuery();
  const router = useRouter();
  return (
    <div className="w-80 bg-background rounded-small border-default-200 dark:border-default-100 border-small px-1 py-2">
      <div className="flex flex-row items-center justify-between px-3">
        <span className="text-xl font-medium">Glossary</span>
        <AddGlossaryModal />
      </div>
      <div className="w-full ">
        <Listbox
          aria-label="Actions"
          onAction={(key) => {
            router.push(`/app/${key}`);
          }}
        >
          {glossary.data ? (
            glossary.data.map((item) => (
              <ListboxItem key={item.id}>{item.name}</ListboxItem>
            ))
          ) : (
            <ListboxItem>No glossary found</ListboxItem>
          )}
        </Listbox>
      </div>
    </div>
  );
}
