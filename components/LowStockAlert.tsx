import Link from "next/link";
import type { Product } from "@/lib/types";

export default function LowStockAlert({ items }: { items: Product[] }) {
  if (items.length === 0) return null;
  return (
    <div className="card border-amber-500/30 bg-amber-500/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-xl">
          ⚠️
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-amber-300">
            Агуулахын анхааруулга
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">
            {items.length} бараа дуусаж байна (5-аас бага):
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {items.map((p) => (
              <span
                key={p.id}
                className="rounded-lg bg-white/5 px-2.5 py-1 text-sm"
              >
                {p.name}{" "}
                <span className="font-semibold text-amber-300">
                  {p.stock} ш
                </span>
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/products"
          className="shrink-0 rounded-lg bg-amber-500/20 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/30"
        >
          Нөхөх
        </Link>
      </div>
    </div>
  );
}
