"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, Table } from "@/lib/types";
import { generateTableColor } from "@/lib/colors";
import {
  calcCharge,
  elapsedSeconds,
  formatDuration,
  formatMNT,
  remainingSeconds,
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
  const supabase = createClient();
  const isOccupied = table.status === "occupied" && !!table.started_at;
  const status = STATUS[table.status] ?? STATUS.free;
  const gradient = generateTableColor(table.number);

  const [session, setSession] = useState<Session | null>(null);
  const [, setTick] = useState(0);

  // Идэвхтэй сессийн горим (open/fixed)-ийг авах
  useEffect(() => {
    let active = true;
    if (isOccupied && table.current_session_id) {
      supabase
        .from("sessions")
        .select("*")
        .eq("id", table.current_session_id)
        .single()
        .then(({ data }) => {
          if (active) setSession(data as Session | null);
        });
    } else {
      setSession(null);
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOccupied, table.current_session_id]);

  // Тоолуурыг секунд тутам шинэчлэх
  useEffect(() => {
    if (!isOccupied) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isOccupied]);

  const seconds = isOccupied ? elapsedSeconds(table.started_at!) : 0;
  const charge = isOccupied
    ? calcCharge(
        table.started_at!,
        table.hourly_rate,
        session?.billing_mode ?? "open",
        session?.planned_minutes ?? null
      )
    : 0;

  const isFixed = session?.billing_mode === "fixed" && session?.planned_minutes;
  const remaining = isFixed
    ? remainingSeconds(table.started_at!, session!.planned_minutes!)
    : 0;
  const overtime = isFixed && remaining < 0;

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
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium">
              {status.dot} {status.label}
            </span>
            {table.is_vip && (
              <span className="rounded-full bg-yellow-400/90 px-2.5 py-0.5 text-xs font-bold text-yellow-950">
                ⭐ VIP
              </span>
            )}
          </div>
        </div>

        <div className="mt-1 text-sm text-white/70">{table.name}</div>

        {isOccupied ? (
          <div className="mt-4 space-y-1">
            <div className="tabular text-3xl font-bold">
              {formatDuration(seconds)}
            </div>
            {isFixed && (
              <div
                className={`text-sm font-semibold ${
                  overtime ? "text-red-200" : "text-white/90"
                }`}
              >
                {overtime ? "⚠️ Хэтэрсэн: " : "Үлдсэн: "}
                {formatDuration(Math.abs(remaining))}
                <span className="ml-1 text-xs font-normal text-white/60">
                  ({session!.planned_minutes! / 60}ц багц)
                </span>
              </div>
            )}
            <div className="text-sm text-white/80">
              Тооцоо: <span className="font-semibold">{formatMNT(charge)}</span>
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
