import { createClient } from "@/lib/supabase/server";
import TablesGrid from "@/components/TablesGrid";
import StatCard from "@/components/StatCard";
import RevenueChart from "@/components/RevenueChart";
import PopularProducts from "@/components/PopularProducts";
import LiveStatus, { type Activity } from "@/components/LiveStatus";
import { formatMNT } from "@/lib/format";
import type { Session, SessionItem, Table } from "@/lib/types";

export const dynamic = "force-dynamic";

const DAY_LABELS = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];

export default async function HomePage() {
  const supabase = await createClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 6 * 86400000);
  weekAgo.setHours(0, 0, 0, 0);

  const [{ data: tablesData }, { data: weekSessions }, { data: weekItems }] =
    await Promise.all([
      supabase.from("tables").select("*").order("number"),
      supabase
        .from("sessions")
        .select("*")
        .eq("status", "closed")
        .gte("ended_at", weekAgo.toISOString()),
      supabase
        .from("session_items")
        .select("*")
        .gte("created_at", weekAgo.toISOString()),
    ]);

  const tables = (tablesData ?? []) as Table[];
  const sessions = (weekSessions ?? []) as Session[];
  const items = (weekItems ?? []) as SessionItem[];

  // Өнөөдрийн орлого
  const todayRevenue = sessions
    .filter((s) => s.ended_at && new Date(s.ended_at) >= startOfToday)
    .reduce((sum, s) => sum + (s.total_amount ?? 0), 0);

  const activeCount = tables.filter((t) => t.status === "occupied").length;

  // 7 хоногийн орлого графикт
  const buckets = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekAgo.getTime() + i * 86400000);
    buckets.set(d.toDateString(), 0);
  }
  for (const s of sessions) {
    if (!s.ended_at) continue;
    const key = new Date(s.ended_at).toDateString();
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + (s.total_amount ?? 0));
  }
  const chart = Array.from(buckets.entries()).map(([key, value]) => ({
    label: DAY_LABELS[new Date(key).getDay()],
    value,
  }));

  // Их зарагдсан бараа
  const prodMap = new Map<string, number>();
  for (const it of items) {
    const name = it.product_name ?? "?";
    prodMap.set(name, (prodMap.get(name) ?? 0) + (it.quantity ?? 0));
  }
  const popular = Array.from(prodMap.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Шууд төлөв (сүүлийн идэвх)
  const activity: Activity[] = sessions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.ended_at ?? b.started_at).getTime() -
        new Date(a.ended_at ?? a.started_at).getTime()
    )
    .slice(0, 6)
    .map((s) => {
      const t = tables.find((x) => x.id === s.table_id);
      return {
        id: s.id,
        table: t?.name ?? "Ширээ",
        kind: "closed" as const,
        amount: s.total_amount,
        at: s.ended_at ?? s.started_at,
      };
    });

  const weekTotal = sessions.reduce((s, x) => s + (x.total_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Тавтай морил 👋</h1>
        <p className="text-sm text-slate-400">
          Өнөөдөр баранд юу болж байгаа товч мэдээлэл.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Өнөөдрийн орлого"
          value={formatMNT(todayRevenue)}
          sub="хаагдсан тооцоонууд"
          accent="violet"
          icon="💰"
        />
        <StatCard
          label="Идэвхтэй ширээ"
          value={`${activeCount} / ${tables.length}`}
          sub={`${Math.round((activeCount / Math.max(1, tables.length)) * 100)}% дүүргэлт`}
          accent="emerald"
          icon="🎱"
        />
        <StatCard
          label="7 хоногийн орлого"
          value={formatMNT(weekTotal)}
          sub={`${sessions.length} тоглолт`}
          accent="amber"
          icon="📈"
        />
        <StatCard
          label="Бараа зарагдсан"
          value={`${items.reduce((s, i) => s + (i.quantity ?? 0), 0)} ш`}
          sub="сүүлийн 7 хоног"
          accent="sky"
          icon="🍺"
        />
      </div>

      {/* Table overview */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Ширээний харагдац</h2>
          <span className="text-xs text-slate-500">{tables.length} ширээ</span>
        </div>
        <TablesGrid initialTables={tables} />
      </div>

      {/* Bottom widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={chart} />
        </div>
        <LiveStatus items={activity} />
      </div>

      <PopularProducts items={popular} />
    </div>
  );
}
