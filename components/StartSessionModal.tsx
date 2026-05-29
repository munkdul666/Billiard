"use client";

import { useState } from "react";
import type { Table } from "@/lib/types";
import { formatMNT } from "@/lib/format";

export type StartChoice = {
  billingMode: "open" | "fixed";
  plannedMinutes: number | null;
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
  const [choice, setChoice] = useState<StartChoice>({
    billingMode: "open",
    plannedMinutes: null,
  });

  const options: { label: string; sub: string; value: StartChoice }[] = [
    {
      label: "Нээлттэй цаг",
      sub: "Тоолуур ажиллаж, өнгөрсөн цагаар тооцно",
      value: { billingMode: "open", plannedMinutes: null },
    },
    {
      label: "1 цаг",
      sub: formatMNT(table.hourly_rate),
      value: { billingMode: "fixed", plannedMinutes: 60 },
    },
    {
      label: "2 цаг",
      sub: formatMNT(table.hourly_rate * 2),
      value: { billingMode: "fixed", plannedMinutes: 120 },
    },
  ];

  function isSelected(v: StartChoice) {
    return (
      v.billingMode === choice.billingMode &&
      v.plannedMinutes === choice.plannedMinutes
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="text-lg font-bold">
          {table.name}
          {table.is_vip && (
            <span className="ml-2 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-300">
              VIP
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          Тариф: {formatMNT(table.hourly_rate)}/цаг. Цагийн горимоо сонго:
        </p>

        <div className="mt-4 space-y-2">
          {options.map((o) => (
            <button
              key={o.label}
              onClick={() => setChoice(o.value)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                isSelected(o.value)
                  ? "border-green-500 bg-green-600/15"
                  : "border-neutral-700 bg-neutral-800 hover:border-neutral-600"
              }`}
            >
              <span className="font-semibold">{o.label}</span>
              <span className="text-sm text-neutral-400">{o.sub}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onCancel}
            disabled={starting}
            className="flex-1 rounded-lg border border-neutral-700 py-2.5 font-semibold text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
          >
            Болих
          </button>
          <button
            onClick={() => onConfirm(choice)}
            disabled={starting}
            className="flex-1 rounded-lg bg-green-600 py-2.5 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
          >
            {starting ? "Эхлүүлж байна…" : "Эхлүүлэх"}
          </button>
        </div>
      </div>
    </div>
  );
}
