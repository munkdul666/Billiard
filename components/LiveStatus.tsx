import { formatMNT } from "@/lib/format";

export type Activity = {
  id: string;
  table: string;
  kind: "active" | "closed";
  amount: number | null;
  at: string;
};

function ago(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "саяхан";
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} цаг`;
  return `${Math.floor(h / 24)} өдөр`;
}

export default function LiveStatus({ items }: { items: Activity[] }) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Шууд төлөв</h2>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Идэвх алга.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${
                  a.kind === "active"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-slate-500/15 text-slate-400"
                }`}
              >
                {a.kind === "active" ? "▶" : "✓"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{a.table}</div>
                <div className="text-xs text-slate-500">
                  {a.kind === "active"
                    ? "Тоглолт эхэлсэн"
                    : `Хаагдсан · ${formatMNT(a.amount ?? 0)}`}
                </div>
              </div>
              <span className="whitespace-nowrap text-xs text-slate-500">
                {ago(a.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
