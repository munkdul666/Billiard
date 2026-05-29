"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Table } from "@/lib/types";
import { formatMNT } from "@/lib/format";

export default function TableSettings({
  initialTables,
}: {
  initialTables: Table[];
}) {
  const supabase = createClient();
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  function update(id: string, patch: Partial<Table>) {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  async function save(t: Table) {
    setSavingId(t.id);
    setSavedId(null);
    await supabase
      .from("tables")
      .update({
        name: t.name,
        hourly_rate: Number(t.hourly_rate) || 0,
        is_vip: t.is_vip,
      })
      .eq("id", t.id);
    setSavingId(null);
    setSavedId(t.id);
    setTimeout(() => setSavedId((s) => (s === t.id ? null : s)), 2000);
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-white/5 px-6 py-4 font-semibold">
        Ширээний тариф
      </div>
      <div className="divide-y divide-white/5">
        {tables.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 font-bold">
              {t.number}
            </div>

            <input
              value={t.name}
              onChange={(e) => update(t.id, { name: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500 sm:w-48"
              placeholder="Нэр"
            />

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={500}
                value={t.hourly_rate}
                onChange={(e) =>
                  update(t.id, { hourly_rate: Number(e.target.value) })
                }
                className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
              <span className="text-xs text-slate-500">₮/цаг</span>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={t.is_vip}
                onChange={(e) => update(t.id, { is_vip: e.target.checked })}
                className="h-4 w-4 accent-yellow-500"
              />
              <span className={t.is_vip ? "text-yellow-300" : "text-slate-400"}>
                ⭐ VIP
              </span>
            </label>

            <div className="sm:ml-auto">
              <button
                onClick={() => save(t)}
                disabled={savingId === t.id}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
              >
                {savingId === t.id
                  ? "Хадгалж…"
                  : savedId === t.id
                    ? "✓ Хадгалсан"
                    : "Хадгалах"}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 px-6 py-3 text-xs text-slate-500">
        Жишээ: {formatMNT(5000)}/цаг — жирийн, {formatMNT(15000)}/цаг — VIP.
      </div>
    </div>
  );
}
