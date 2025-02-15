"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef, flexRender, HeaderContext } from "@tanstack/react-table";

interface TableSkeletonProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  rows?: number;
}

export function TableSkeleton<TData, TValue>({
  columns,
  rows = 8,
}: TableSkeletonProps<TData, TValue>) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        {/* Table Header (Always Visible) */}
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            {columns.map((col, index) => (
              <TableHead
                key={index}
                className="h-10 px-4 text-xs font-medium text-gray-500 first:pl-6 last:pr-6"
              >
                {typeof col.header === "function"
                  ? flexRender(col.header, {} as HeaderContext<TData, TValue>) // ✅ Fix: Pass a correctly typed context
                  : col.header}{" "}
                {/* ✅ Handle string headers */}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* Table Body (Skeleton Rows) */}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="border-gray-100">
              {columns.map((_, colIndex) => (
                <TableCell
                  key={colIndex}
                  className="px-4 py-3 text-xs text-gray-600 first:pl-6 last:pr-6"
                >
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
