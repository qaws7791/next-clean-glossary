"use client";
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
} from "@heroui/react";
import { trpc } from "@/lib/trpc/client";

interface TermTableProps {
  id: string;
}

export default function TermTable({ id }: TermTableProps) {
  const [page, setPage] = useState(1);
  const { data: terms } = trpc.term.list.useQuery({
    glossaryId: id,
    page,
    pageSize: 10,
  });

  return (
    <Table
      aria-label="Example table with client side pagination"
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="secondary"
            page={terms?.currentPage || 1}
            total={terms?.totalPages || 1}
            onChange={(page) => setPage(page)}
          />
        </div>
      }
      className="flex-1"
      classNames={{
        wrapper: "min-h-[222px] flex-1",
      }}
    >
      <TableHeader>
        <TableColumn key="term">Term</TableColumn>
        <TableColumn key="definition">Definition</TableColumn>
      </TableHeader>
      <TableBody items={terms?.data || []}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
