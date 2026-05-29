"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Staff, Table } from "@/lib/types";
import { formatMNT } from "@/lib/format";

export type StartChoice = {
  billingMode: "open" | "fixed";
  plannedMinutes: number | null;
  staffId: string | null;
};

export default function StartSessionModal({
  table,
  starting,
  onConfirm,
  onCancel,
}: {
  table: Table;
  starting: boolean;
  onConfirm: (choice: StartChoice) => void;
  onCancel: () => void;
}) {
  const supabase = createClient();
  const [billingMode, setBillingMode] = useState<"open" | "fixed">("open");
  const [plannedMinutes, setPlannedMinutes] = useState<number | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [shiftStaff, setShiftStaff] = useState<Staff[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("staff")
      .select("*")
      .eq("on_shift", true)
      .eq("is_active", true)
      .then(({ data }) => {
        if (!active) return;
        const list = (data ?? []) as Staff[];
        setShiftStaff(list);
        if (list.length === 1) setStaffId(list[0].id);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const options = [
    { label: "Нээлттэй цаг", sub: "Өнгөрсөн цагаар", mode: "open" as const, mins: null },
    { label: "1 цаг", sub: formatMNT(table.hourly_rate), mode: "fixed" as const, mins: 60 },
    { label: "2 цаг", sub: formatMNT(table.hourly_rate * 2), mode: "fixed" as const, mins: 120 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="card w-full max-w-sm border-white/10 p-6">
        <h2 className="text-lg font-bold">
          {table.name}
          {table.is_vip && (
            <span className="ml-2 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-300">
              ⭐ VIP
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Тариф: {formatMNT(table.hourly_rate)}/цаг
        </p>

        <div className="mt-4 space-y-2">
          {options.map((o) => {
            const sel = billingMode === o.mode && plannedMinutes === o.mins;
            return (
              <button
                key={o.label}
                onClick={() => {
                  setBillingMode(o.mode);
                  setPlannedMinutes(o.mins);
                }}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  sel
                    ? "border-violet-500 bg-violet-600/15"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <span className="font-semibold">{o.label}</span>
                <span className="text-sm text-slate-400">{o.sub}</span>
              </button>
            );
          })}
        </div>

        {shiftStaff.length > 0 && (
          <div className="mt-4">
            <label className="mb-1 block text-xs text-slate-400">
              Ээлжийн ажилтан
            </label>
            <select
              value={staffId ?? ""}
              onChange={(e) => setStaffId(e.target.value || null)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
            >
              <option value="">— Сонгохгүй —</option>
              {shiftStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            onClick={onCancel}
            disabled={starting}
            className="flex-1 rounded-lg border border-white/10 py-2.5 font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            Болих
          </button>
          <button
            onClick={() => onConfirm({ billingMode, plannedMinutes, staffId })}
            disabled={starting}
            className="flex-1 rounded-lg bg-violet-600 py-2.5 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {starting ? "Эхлүүлж байна…" : "Эхлүүлэх"}
          </button>
        </div>
      </div>
    </div>
  );
}
