"use client";

import { useEffect, useState } from "react";
import type { Table } from "@/lib/types";
import { generateTableColor } from "@/lib/colors";
import {
  calcTableCharge,
  elapsedSeconds,
  formatDuration,
  formatMNT,
} from "@/lib/format";
import TableSVG from "./TableSVG";

const STATUS = {
  free: { label: "Чөлөөтэй", dot: "🟢", ring: "ring-green-600/40" },
  occupied: { label: "Тоглож байна", dot: "🔴", ring: "ring-red-600/50" },
  reserved: { label: "Захиалгатай", dot: "🟡", ring: "ring-yellow-500/40" },
} as const;

export default function TableCard({
  table,
  onStart,
  onOpen,
}: {
  table: Table;
  onStart: () => void;
  onOpen: () => void;
}) {
  const isOccupied = table.status === "occupied" && table.started_at;
  const status = STATUS[table.status] ?? STATUS.free;
  const gradient = generateTableColor(table.number);

  const [, setTick] = useState(0);

  // Тоглож байгаа ширээний тоолуурыг секунд тутам шинэчилнэ
  useEffect(() => {
    if (!isOccupied) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isOccupied]);

  const seconds = isOccupied ? elapsedSeconds(table.started_at!) : 0;
  const charge = isOccupied
    ? calcTableCharge(table.started_at!, table.hourly_rate)
    : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br ${gradient} p-5 shadow-lg ring-1 ${status.ring}`}
    >
      <TableSVG className="pointer-events-none absolute -right-6 -top-4 h-28 w-44 opacity-20" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="text-5xl font-black leading-none">
            {table.number}
          </div>
          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium">
            {status.dot} {status.label}
          </span>
        </div>

        <div className="mt-1 text-sm text-white/70">{table.name}</div>

        {isOccupied ? (
          <div className="mt-4 space-y-1">
            <div className="tabular text-3xl font-bold">
              {formatDuration(seconds)}
            </div>
            <div className="text-sm text-white/80">
              Одоогийн тооцоо:{" "}
              <span className="font-semibold">{formatMNT(charge)}</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-white/60">
            Цагийн тариф: {formatMNT(table.hourly_rate)}/цаг
          </div>
        )}

        <div className="mt-5 flex gap-2">
          {isOccupied ? (
            <button
              onClick={onOpen}
              className="flex-1 rounded-lg bg-white/90 py-2.5 font-semibold text-neutral-900 transition hover:bg-white"
            >
              Дэлгэрэнгүй / Дуусгах
            </button>
          ) : (
            <button
              onClick={onStart}
              className="flex-1 rounded-lg bg-white/90 py-2.5 font-semibold text-neutral-900 transition hover:bg-white"
            >
              Эхлүүлэх
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
