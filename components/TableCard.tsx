"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, Table } from "@/lib/types";
import {
  calcCharge,
  elapsedSeconds,
  formatDuration,
  formatMNT,
  remainingSeconds,
} from "@/lib/format";
import PoolTableSVG from "./PoolTableSVG";

const STATUS = {
  free: { label: "Чөлөөтэй", text: "text-emerald-400", felt: "#15803d" },
  occupied: { label: "Тоглож байна", text: "text-violet-400", felt: "#166534" },
  reserved: { label: "Захиалгатай", text: "text-rose-400", felt: "#7f1d1d" },
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

  const [session, setSession] = useState<Session | null>(null);
  const [, setTick] = useState(0);

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
  const isFixed = session?.billing_mode === "fixed" && !!session?.planned_minutes;
  const remaining = isFixed
    ? remainingSeconds(table.started_at!, session!.planned_minutes!)
    : 0;
  const overtime = isFixed && remaining < 0;

  return (
    <div className="card overflow-hidden p-4 transition hover:border-violet-500/30">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{table.name}</h3>
            {table.is_vip && (
              <span className="rounded-md bg-yellow-400/90 px-1.5 py-0.5 text-[10px] font-bold text-yellow-950">
                ⭐ VIP
              </span>
            )}
          </div>
          <div className={`text-xs font-medium ${status.text}`}>
            ● {status.label}
          </div>
        </div>
        <span className="text-2xl font-black text-white/10">{table.number}</span>
      </div>

      <div className="relative mb-3 overflow-hidden rounded-xl">
        <PoolTableSVG className="h-28 w-full" felt={status.felt} />
        {isOccupied && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-1.5">
            <span className="tabular text-sm font-bold text-white">
              {formatDuration(seconds)}
            </span>
          </div>
        )}
      </div>

      {isOccupied ? (
        <div className="space-y-1 text-sm">
          {isFixed && (
            <div className={overtime ? "text-rose-400" : "text-slate-300"}>
              {overtime ? "⚠️ Хэтэрсэн " : "Үлдсэн "}
              <span className="font-semibold">
                {formatDuration(Math.abs(remaining))}
              </span>
              <span className="ml-1 text-xs text-slate-500">
                ({session!.planned_minutes! / 60}ц багц)
              </span>
            </div>
          )}
          <div className="text-slate-400">
            Тооцоо:{" "}
            <span className="font-semibold text-emerald-400">
              {formatMNT(charge)}
            </span>
          </div>
          <button
            onClick={onOpen}
            className="mt-2 w-full rounded-lg bg-violet-600 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Дэлгэрэнгүй / Дуусгах
          </button>
        </div>
      ) : (
        <div className="text-sm">
          <div className="text-slate-400">
            {formatMNT(table.hourly_rate)}
            <span className="text-slate-500"> /цаг</span>
          </div>
          <button
            onClick={onStart}
            className="mt-2 w-full rounded-lg border border-violet-500/40 bg-violet-600/10 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-600/20"
          >
            Эхлүүлэх
          </button>
        </div>
      )}
    </div>
  );
}
