"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Product, Session, SessionItem, Table } from "@/lib/types";
import {
  calcCharge,
  elapsedSeconds,
  formatDuration,
  formatMNT,
  remainingSeconds,
} from "@/lib/format";
import ReceiptModal from "./ReceiptModal";

export default function TableDetail({
  table,
  products,
  initialSession,
  initialItems,
  staffName,
}: {
  table: Table;
  products: Product[];
  initialSession: Session | null;
  initialItems: SessionItem[];
  staffName: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [session] = useState<Session | null>(initialSession);
  const [items, setItems] = useState<SessionItem[]>(initialItems);
  const [selectedProduct, setSelectedProduct] = useState<string>(
    products[0]?.id ?? ""
  );
  const [qty, setQty] = useState(1);
  const [, setTick] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [closing, setClosing] = useState(false);

  const isActive = session?.status === "active";
  const isFixed =
    session?.billing_mode === "fixed" && !!session?.planned_minutes;

  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [isActive]);

  const seconds = session ? elapsedSeconds(session.started_at) : 0;
  const tableCharge = session
    ? calcCharge(
        session.started_at,
        table.hourly_rate,
        session.billing_mode ?? "open",
        session.planned_minutes ?? null
      )
    : 0;
  const itemsTotal = useMemo(
    () => items.reduce((sum, it) => sum + (it.total_price ?? 0), 0),
    [items]
  );
  const grandTotal = tableCharge + itemsTotal;

  const remaining =
    isFixed && session
      ? remainingSeconds(session.started_at, session.planned_minutes!)
      : 0;
  const overtime = isFixed && remaining < 0;

  async function addItem() {
    if (!session || !selectedProduct) return;
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const total = product.price * qty;
    const { data, error } = await supabase
      .from("session_items")
      .insert({
        session_id: session.id,
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        unit_price: product.price,
        total_price: total,
      })
      .select()
      .single();

    if (!error && data) {
      // Агуулахаас хасах
      await supabase
        .from("products")
        .update({ stock: Math.max(0, product.stock - qty) })
        .eq("id", product.id);
      setItems((prev) => [...prev, data as SessionItem]);
      setQty(1);
    }
  }

  async function removeItem(itemId: string) {
    const { error } = await supabase
      .from("session_items")
      .delete()
      .eq("id", itemId);
    if (!error) setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function closeBill() {
    if (!session) return;
    setClosing(true);

    const endedAt = new Date().toISOString();
    const durationMinutes = Math.round(seconds / 60);

    await supabase
      .from("sessions")
      .update({
        ended_at: endedAt,
        duration_minutes: durationMinutes,
        table_charge: Math.round(tableCharge),
        items_total: Math.round(itemsTotal),
        total_amount: Math.round(grandTotal),
        status: "closed",
      })
      .eq("id", session.id);

    await supabase
      .from("tables")
      .update({
        status: "free",
        started_at: null,
        current_session_id: null,
      })
      .eq("id", table.id);

    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
      >
        ← Буцах
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-xl font-bold">
                  {table.name}
                  {table.is_vip && (
                    <span className="rounded-full bg-yellow-400/90 px-2 py-0.5 text-xs font-bold text-yellow-950">
                      ⭐ VIP
                    </span>
                  )}
                </h1>
                <p className="text-sm text-slate-400">
                  Тариф: {formatMNT(table.hourly_rate)}/цаг
                  {isFixed && ` · ${session!.planned_minutes! / 60} цагийн багц`}
                  {staffName && ` · Ажилтан: ${staffName}`}
                </p>
              </div>
              <span className="text-5xl font-black text-white/10">
                {table.number}
              </span>
            </div>

            {isActive ? (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="text-xs text-slate-400">Тоглосон цаг</div>
                  <div className="tabular mt-1 text-3xl font-bold">
                    {formatDuration(seconds)}
                  </div>
                  {isFixed && (
                    <div
                      className={`mt-1 text-sm font-semibold ${
                        overtime ? "text-rose-400" : "text-slate-300"
                      }`}
                    >
                      {overtime ? "⚠️ Хэтэрсэн " : "Үлдсэн "}
                      {formatDuration(Math.abs(remaining))}
                    </div>
                  )}
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="text-xs text-slate-400">Ширээний цэнэ</div>
                  <div className="mt-1 text-3xl font-bold text-emerald-400">
                    {formatMNT(tableCharge)}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-6 rounded-xl bg-white/5 p-4 text-sm text-slate-400">
                Энэ ширээ идэвхтэй сесстэй биш байна.
              </p>
            )}

            {overtime && (
              <div className="mt-4 rounded-xl border border-rose-800 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
                ⚠️ Захиалсан цаг дууссан. Тоолуур үргэлжилж, илүү цагийг тарифаар
                нэмж тооцож байна.
              </div>
            )}
          </div>

          {isActive && (
            <div className="card p-6">
              <h2 className="mb-4 font-semibold">Бараа нэмэх</h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatMNT(p.price)} (үлд: {p.stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-500 sm:w-20"
                />
                <button
                  onClick={addItem}
                  className="rounded-lg bg-violet-600 px-5 py-2 font-semibold text-white transition hover:bg-violet-500"
                >
                  Нэмэх
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="font-semibold">Захиалга</h2>

          {items.length === 0 ? (
            <p className="text-sm text-slate-500">Бараа нэмэгдээгүй байна.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{it.product_name}</div>
                    <div className="text-xs text-slate-400">
                      {it.quantity} × {formatMNT(it.unit_price ?? 0)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {formatMNT(it.total_price ?? 0)}
                    </span>
                    <button
                      onClick={() => removeItem(it.id)}
                      className="text-rose-400 hover:text-rose-300"
                      aria-label="Устгах"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-1 border-t border-white/5 pt-4 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Ширээ</span>
              <span>{formatMNT(tableCharge)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Бараа</span>
              <span>{formatMNT(itemsTotal)}</span>
            </div>
            <div className="flex justify-between pt-2 text-lg font-bold">
              <span>Нийт</span>
              <span className="text-emerald-400">{formatMNT(grandTotal)}</span>
            </div>
          </div>

          {isActive && (
            <button
              onClick={() => setShowReceipt(true)}
              className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-500"
            >
              Тооцоо хаах
            </button>
          )}
        </div>
      </div>

      {showReceipt && session && (
        <ReceiptModal
          table={table}
          items={items}
          seconds={seconds}
          tableCharge={tableCharge}
          itemsTotal={itemsTotal}
          grandTotal={grandTotal}
          staffName={staffName}
          closing={closing}
          onConfirm={closeBill}
          onCancel={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
