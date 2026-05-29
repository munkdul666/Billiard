"use client";

import { useMemo, useState } from "react";
import type { Session, Staff, Table } from "@/lib/types";
import { formatMNT, formatDuration } from "@/lib/format";
import StatCard from "./StatCard";

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function ReportsClient({
  sessions,
  staff,
  tables,
}: {
  sessions: Session[];
  staff: Staff[];
  tables: Table[];
}) {
  const [date, setDate] = useState(ymd(new Date()));

  const nameOfTable = (id: string) =>
    tables.find((t) => t.id === id)?.name ?? "Ширээ";
  const nameOfStaff = (id: string | null) =>
    staff.find((s) => s.id === id)?.name ?? "Тодорхойгүй";

  const daySessions = useMemo(
    () =>
      sessions.filter((s) => s.ended_at && ymd(new Date(s.ended_at)) === date),
    [sessions, date]
  );

  const totals = useMemo(() => {
    let revenue = 0,
      table = 0,
      items = 0;
    for (const s of daySessions) {
      revenue += s.total_amount ?? 0;
      table += s.table_charge ?? 0;
      items += s.items_total ?? 0;
    }
    return { revenue, table, items };
  }, [daySessions]);

  const byStaff = useMemo(() => {
    const m = new Map<string, { name: string; count: number; revenue: number }>();
    for (const s of daySessions) {
      const key = s.staff_id ?? "none";
      const cur = m.get(key) ?? { name: nameOfStaff(s.staff_id), count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += s.total_amount ?? 0;
      m.set(key, cur);
    }
    return Array.from(m.values()).sort((a, b) => b.revenue - a.revenue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daySessions]);

  function shift(days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(ymd(d));
  }

  const isToday = date === ymd(new Date());

  return (
    <div className="space-y-6">
      {/* Date selector */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <button
          onClick={() => shift(-1)}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
        >
          ← Өмнөх
        </button>
        <input
          type="date"
          value={date}
          max={ymd(new Date())}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500 [color-scheme:dark]"
        />
        <button
          onClick={() => shift(1)}
          disabled={isToday}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-40"
        >
          Дараах →
        </button>
        {!isToday && (
          <button
            onClick={() => setDate(ymd(new Date()))}
            className="rounded-lg bg-violet-600/20 px-3 py-2 text-sm font-medium text-violet-300 hover:bg-violet-600/30"
          >
            Өнөөдөр
          </button>
        )}
        <span className="ml-auto text-sm text-slate-400">
          {daySessions.length} тоглолт
        </span>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Нийт орлого" value={formatMNT(totals.revenue)} accent="violet" icon="💰" />
        <StatCard label="Ширээний орлого" value={formatMNT(totals.table)} accent="emerald" icon="🎱" />
        <StatCard label="Барааны орлого" value={formatMNT(totals.items)} accent="amber" icon="🍺" />
      </div>

      {/* By staff */}
      <div className="card p-6">
        <h2 className="mb-4 font-semibold">Ажилтны гүйцэтгэл</h2>
        {byStaff.length === 0 ? (
          <p className="text-sm text-slate-500">Энэ өдөр тоглолт алга.</p>
        ) : (
          <ul className="space-y-3">
            {byStaff.map((s) => (
              <li key={s.name} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.count} тоглолт</div>
                </div>
                <span className="font-semibold text-emerald-400">
                  {formatMNT(s.revenue)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sessions list */}
      <div className="card overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4 font-semibold">
          Тоглолтууд
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="px-6 py-3">Ширээ</th>
                <th className="px-6 py-3">Ажилтан</th>
                <th className="px-6 py-3">Үргэлжлэл</th>
                <th className="px-6 py-3 text-right">Ширээ</th>
                <th className="px-6 py-3 text-right">Бараа</th>
                <th className="px-6 py-3 text-right">Нийт</th>
              </tr>
            </thead>
            <tbody>
              {daySessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Тоглолт алга.
                  </td>
                </tr>
              ) : (
                daySessions.map((s) => (
                  <tr key={s.id} className="border-t border-white/5">
                    <td className="px-6 py-3 font-medium">{nameOfTable(s.table_id)}</td>
                    <td className="px-6 py-3 text-slate-400">{nameOfStaff(s.staff_id)}</td>
                    <td className="px-6 py-3 text-slate-400">
                      {formatDuration((s.duration_minutes ?? 0) * 60)}
                    </td>
                    <td className="px-6 py-3 text-right">{formatMNT(s.table_charge ?? 0)}</td>
                    <td className="px-6 py-3 text-right">{formatMNT(s.items_total ?? 0)}</td>
                    <td className="px-6 py-3 text-right font-semibold text-emerald-400">
                      {formatMNT(s.total_amount ?? 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
