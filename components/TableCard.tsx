"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, Table } from "@/lib/types";
import {
  calcCharge,
  elapsedSeconds,
  formatMNT,
  remainingSeconds,
} from "@/lib/format";
import PoolTableSVG from "./PoolTableSVG";

const STATUS = {
  free: { label: "Чөлөөтэй", text: "text-emerald-400", felt: "#1f7a44" },
  occupied: { label: "Тоглож байна", text: "text-violet-400", felt: "#176b3a" },
  reserved: { label: "Захиалгатай", text: "text-rose-400", felt: "#7f1d1d" },
} as const;

function hm(totalSeconds: number) {
  const s = Math.abs(Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}ц ${m}м`;
  return `${m}м`;
}

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
  const [staffName, setStaffName] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    if (isOccupied && table.current_session_id) {
      supabase
        .from("sessions")
        .select("*, staff:staff_id(name)")
        .eq("id", table.current_session_id)
        .single()
        .then(({ data }) => {
          if (!active || !data) return;
          setSession(data as unknown as Session);
          const st = (data as { staff?: { name?: string } | null }).staff;
          setStaffName(st?.name ?? null);
        });
    } else {
      setSession(null);
      setStaffName(null);
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

  const timeLabel = isFixed
    ? overtime
      ? `+${hm(remaining)} хэтэрсэн`
      : `${hm(remaining)} үлдсэн`
    : `${hm(seconds)} тоглож байна`;

  return (
    <div className="card overflow-hidden transition hover:border-violet-500/30">
      {/* Зураг */}
      <div className="relative">
        <div className="bg-[#0a0b14] p-3 pb-0">
          <PoolTableSVG className="h-32 w-full rounded-lg" felt={status.felt} />
        </div>

        {/* Дээд хаяг */}
        <div className="absolute left-4 top-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold drop-shadow">{table.name}</h3>
            {table.is_vip && (
              <span className="rounded-md bg-yellow-400/90 px-1.5 py-0.5 text-[10px] font-bold text-yellow-950">
                ⭐ VIP
              </span>
            )}
          </div>
          <div className={`text-[11px] font-semibold ${status.text} drop-shadow`}>
            ● {status.label}
          </div>
        </div>

        {isOccupied && (
          <div className="absolute inset-x-3 bottom-0 flex items-center justify-between rounded-b-lg bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-6">
            <span
              className={`text-xs font-bold ${
                overtime ? "text-rose-300" : "text-white"
              }`}
            >
              {timeLabel}
            </span>
            {staffName && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold ring-2 ring-black/40">
                {staffName.charAt(0)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4">
        {isOccupied ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500">Одоогийн тооцоо</div>
              <div className="font-bold text-emerald-400">{formatMNT(charge)}</div>
            </div>
            <button
              onClick={onOpen}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Дэлгэрэнгүй
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500">Цагийн тариф</div>
              <div className="font-bold">{formatMNT(table.hourly_rate)}</div>
            </div>
            <button
              onClick={onStart}
              className="rounded-lg border border-violet-500/40 bg-violet-600/10 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-600/20"
            >
              Эхлүүлэх
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
