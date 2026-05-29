export default function StatCard({
  label,
  value,
  sub,
  accent = "violet",
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "violet" | "emerald" | "amber" | "sky";
  icon: string;
}) {
  const accents: Record<string, string> = {
    violet: "from-violet-500/20 to-violet-600/5 text-violet-300",
    emerald: "from-emerald-500/20 to-emerald-600/5 text-emerald-300",
    amber: "from-amber-500/20 to-amber-600/5 text-amber-300",
    sky: "from-sky-500/20 to-sky-600/5 text-sky-300",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-400">{label}</div>
          <div className="mt-2 text-3xl font-black tracking-tight">{value}</div>
          {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-xl ${accents[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
