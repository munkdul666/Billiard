import { formatMNT } from "@/lib/format";

export default function RevenueChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Орлогын тойм</h2>
        <span className="text-xs text-slate-500">Сүүлийн 7 хоног</span>
      </div>
      <div className="mb-4 text-2xl font-black">{formatMNT(total)}</div>
      <div className="flex h-40 items-end gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-indigo-400 transition-all"
                style={{ height: `${(d.value / max) * 100}%` }}
                title={formatMNT(d.value)}
              />
            </div>
            <span className="text-[10px] text-slate-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
