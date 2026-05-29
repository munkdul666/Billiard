export default function PopularProducts({
  items,
}: {
  items: { name: string; qty: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.qty));
  const colors = ["bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-sky-500", "bg-rose-500"];

  return (
    <div className="card p-6">
      <h2 className="mb-4 font-semibold">Их зарагдсан бараа</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Өгөгдөл алга.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((it, i) => (
            <li key={it.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-slate-500">{i + 1}</span>
                  {it.name}
                </span>
                <span className="text-slate-400">{it.qty} ш</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${colors[i % colors.length]}`}
                  style={{ width: `${(it.qty / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
