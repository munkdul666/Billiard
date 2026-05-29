"use client";

import { useMemo, useState } from "react";
import type { Session, Staff, Table } from "@/lib/types";
import { formatMNT, formatDuration } from "@/lib/format";

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function TransactionsClient({
  sessions,
  staff,
  tables,
}: {
  sessions: Session[];
  staff: Staff[];
  tables: Table[];
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tableId, setTableId] = useState("");
  const [staffId, setStaffId] = useState("");

  const nameOfTable = (id: string) =>
    tables.find((t) => t.id === id)?.name ?? "Ширээ";
  const nameOfStaff = (id: string | null) =>
    staff.find((s) => s.id === id)?.name ?? "Тодорхойгүй";

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (!s.ended_at) return false;
      const day = ymd(new Date(s.ended_at));
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (tableId && s.table_id !== tableId) return false;
      if (staffId && (s.staff_id ?? "") !== staffId) return false;
      return true;
    });
  }, [sessions, from, to, tableId, staffId]);

  const total = filtered.reduce((s, x) => s + (x.total_amount ?? 0), 0);

  function reset() {
    setFrom("");
    setTo("");
    setTableId("");
    setStaffId("");
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="mb-1 block text-xs text-slate-400">Эхлэх</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500 [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Дуусах</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500 [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Ширээ</label>
          <select
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
          >
            <option value="">Бүгд</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Ажилтан</label>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
          >
            <option value="">Бүгд</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={reset}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
        >
          Цэвэрлэх
        </button>
        <div className="ml-auto text-right">
          <div className="text-xs text-slate-400">
            {filtered.length} гүйлгээ
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {formatMNT(total)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="px-6 py-3">Огноо</th>
                <th className="px-6 py-3">Ширээ</th>
                <th className="px-6 py-3">Ажилтан</th>
                <th className="px-6 py-3">Үргэлжлэл</th>
                <th className="px-6 py-3 text-right">Ширээ</th>
                <th className="px-6 py-3 text-right">Бараа</th>
                <th className="px-6 py-3 text-right">Нийт</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Гүйлгээ олдсонгүй.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-t border-white/5">
                    <td className="px-6 py-3 text-slate-400">
                      {s.ended_at
                        ? new Date(s.ended_at).toLocaleString("mn-MN")
                        : "-"}
                    </td>
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
