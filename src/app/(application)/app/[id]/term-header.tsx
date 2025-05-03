"use client";

import AddTermModal from "@/components/add-term-modal";
import { Input } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
interface TermHeaderProps {
  glossaryId: string;
}

export default function TermHeader({ glossaryId }: TermHeaderProps) {
  const [filterValue, setFilterValue] = useState<string>("");

  return (
    <div className="flex flex-row items-center justify-between w-full py-4 gap-4">
      <Input
        isClearable
        className="w-full sm:max-w-[44%]"
        placeholder="Search by name..."
        startContent={<Icon icon="ic:sharp-search" width="24" height="24" />}
        value={filterValue}
        onClear={() => {
          setFilterValue("");
        }}
        onValueChange={setFilterValue}
      />
      <AddTermModal glossaryId={glossaryId} />
    </div>
  );
}
