import { createClient } from "@/lib/supabase/server";
import TablesGrid from "@/components/TablesGrid";
import StatCard from "@/components/StatCard";
import RevenueChart from "@/components/RevenueChart";
import PopularProducts from "@/components/PopularProducts";
import LiveStatus, { type Activity } from "@/components/LiveStatus";
import LowStockAlert from "@/components/LowStockAlert";
import { formatMNT } from "@/lib/format";
import type { Product, Session, SessionItem, Table } from "@/lib/types";

export const dynamic = "force-dynamic";

const LOW_STOCK = 5;
const MAX_BARS = 30;

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default async function HomePage() {
  const supabase = await createClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [
    { data: tablesData },
    { data: closedSessions },
    { data: recentItems },
    { data: productsData },
  ] = await Promise.all([
    supabase.from("tables").select("*").order("number"),
    supabase
      .from("sessions")
      .select("*")
      .eq("status", "closed")
      .order("ended_at", { ascending: false }),
    supabase
      .from("session_items")
      .select("*")
      .gte("created_at", monthAgo),
    supabase.from("products").select("*").eq("is_active", true),
  ]);

  const tables = (tablesData ?? []) as Table[];
  const sessions = (closedSessions ?? []) as Session[];
  const items = (recentItems ?? []) as SessionItem[];
  const products = (productsData ?? []) as Product[];

  const lowStock = products
    .filter((p) => p.stock < LOW_STOCK)
    .sort((a, b) => a.stock - b.stock);

  const todayRevenue = sessions
    .filter((s) => s.ended_at && new Date(s.ended_at) >= startOfToday)
    .reduce((sum, s) => sum + (s.total_amount ?? 0), 0);

  const weekAgoMs = Date.now() - 7 * 86400000;
  const weekSessions = sessions.filter(
    (s) => s.ended_at && new Date(s.ended_at).getTime() >= weekAgoMs
  );
  const weekTotal = weekSessions.reduce((s, x) => s + (x.total_amount ?? 0), 0);

  const activeCount = tables.filter((t) => t.status === "occupied").length;

  // Орлогын график — ашиглаж эхэлснээс хойш өдрөөр
  const dayMap = new Map<string, number>();
  for (const s of sessions) {
    if (!s.ended_at) continue;
    const key = ymd(new Date(s.ended_at));
    dayMap.set(key, (dayMap.get(key) ?? 0) + (s.total_amount ?? 0));
  }
  let firstDay: Date;
  if (sessions.length > 0) {
    const earliest = sessions.reduce((min, s) => {
      const t = new Date(s.ended_at ?? s.started_at).getTime();
      return t < min ? t : min;
    }, Date.now());
    firstDay = new Date(earliest);
  } else {
    firstDay = new Date();
  }
  firstDay.setHours(0, 0, 0, 0);
  const totalDays =
    Math.floor((startOfToday.getTime() - firstDay.getTime()) / 86400000) + 1;
  const nDays = Math.min(MAX_BARS, Math.max(1, totalDays));
  const chart: { label: string; value: number }[] = [];
  for (let i = nDays - 1; i >= 0; i--) {
    const d = new Date(startOfToday.getTime() - i * 86400000);
    chart.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      value: dayMap.get(ymd(d)) ?? 0,
    });
  }

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

  // Шууд төлөв
  const activity: Activity[] = sessions.slice(0, 6).map((s) => {
    const t = tables.find((x) => x.id === s.table_id);
    return {
      id: s.id,
      table: t?.name ?? "Ширээ",
      kind: "closed" as const,
      amount: s.total_amount,
      at: s.ended_at ?? s.started_at,
    };
  });

  const soldCount = items.reduce((s, i) => s + (i.quantity ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Тавтай морил 👋</h1>
        <p className="text-sm text-slate-400">
          Өнөөдөр баранд юу болж байгаа товч мэдээлэл.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Өнөөдрийн орлого" value={formatMNT(todayRevenue)} sub="хаагдсан тооцоонууд" accent="violet" icon="💰" />
        <StatCard label="Идэвхтэй ширээ" value={`${activeCount} / ${tables.length}`} sub={`${Math.round((activeCount / Math.max(1, tables.length)) * 100)}% дүүргэлт`} accent="emerald" icon="🎱" />
        <StatCard label="7 хоногийн орлого" value={formatMNT(weekTotal)} sub={`${weekSessions.length} тоглолт`} accent="amber" icon="📈" />
        <StatCard label="Бараа зарагдсан" value={`${soldCount} ш`} sub="сүүлийн 30 хоног" accent="sky" icon="🍺" />
      </div>

      <LowStockAlert items={lowStock} />

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Ширээний харагдац</h2>
          <span className="text-xs text-slate-500">{tables.length} ширээ</span>
        </div>
        <TablesGrid initialTables={tables} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LiveStatus items={activity} />
        <PopularProducts items={popular} />
      </div>

      {/* Орлогын график — хамгийн доор, эхэлснээс хойш өдрөөр */}
      <RevenueChart data={chart} />
    </div>
  );
}
