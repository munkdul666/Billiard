export default function ComingSoon({
  title,
  icon,
  desc,
}: {
  title: string;
  icon: string;
  desc: string;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="card flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/10 text-3xl">
          {icon}
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-slate-400">{desc}</p>
        <span className="mt-2 rounded-full bg-violet-600/15 px-3 py-1 text-xs font-medium text-violet-300">
          Удахгүй нэмэгдэнэ
        </span>
      </div>
    </div>
  );
}
