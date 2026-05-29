"use client";

import type { SessionItem, Table } from "@/lib/types";
import { formatDuration, formatMNT } from "@/lib/format";

export default function ReceiptModal({
  table,
  items,
  seconds,
  tableCharge,
  itemsTotal,
  grandTotal,
  closing,
  onConfirm,
  onCancel,
}: {
  table: Table;
  items: SessionItem[];
  seconds: number;
  tableCharge: number;
  itemsTotal: number;
  grandTotal: number;
  closing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const now = new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white text-neutral-900 shadow-2xl">
        {/* Хэвлэгдэх хэсэг */}
        <div id="receipt" className="p-6">
          <div className="text-center">
            <div className="text-2xl">🎱</div>
            <h2 className="text-lg font-bold">Billiard Bar</h2>
            <p className="text-xs text-neutral-500">
              {now.toLocaleString("mn-MN")}
            </p>
          </div>

          <div className="my-4 border-y border-dashed border-neutral-300 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Ширээ</span>
              <span className="font-medium">{table.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Тоглосон цаг</span>
              <span className="font-medium">{formatDuration(seconds)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Ширээний цэнэ</span>
              <span className="font-medium">{formatMNT(tableCharge)}</span>
            </div>
          </div>

          {items.length > 0 && (
            <div className="mb-4 text-sm">
              <div className="mb-1 font-semibold">Бараа</div>
              <ul className="space-y-1">
                {items.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>
                      {it.product_name} × {it.quantity}
                    </span>
                    <span>{formatMNT(it.total_price ?? 0)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-1 flex justify-between border-t border-neutral-200 pt-1 text-neutral-500">
                <span>Барааны дүн</span>
                <span>{formatMNT(itemsTotal)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg bg-neutral-100 px-4 py-3">
            <span className="font-semibold">НИЙТ ДҮН</span>
            <span className="text-2xl font-black">{formatMNT(grandTotal)}</span>
          </div>

          <p className="mt-4 text-center text-xs text-neutral-400">
            Баярлалаа! Дахин ирээрэй 🎱
          </p>
        </div>

        {/* Товчнууд (хэвлэхэд харагдахгүй) */}
        <div className="flex gap-2 border-t border-neutral-200 p-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-lg border border-neutral-300 py-2.5 font-semibold text-neutral-700 transition hover:bg-neutral-100"
          >
            Хэвлэх
          </button>
          <button
            onClick={onCancel}
            disabled={closing}
            className="rounded-lg border border-neutral-300 px-4 py-2.5 font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
          >
            Болих
          </button>
          <button
            onClick={onConfirm}
            disabled={closing}
            className="flex-1 rounded-lg bg-green-600 py-2.5 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
          >
            {closing ? "Хааж байна…" : "Баталгаажуулах"}
          </button>
        </div>
      </div>

      {/* Зөвхөн receipt-ийг хэвлэх print стиль */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt,
          #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
