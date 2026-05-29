import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import { formatMNT, formatDuration } from "@/lib/format";
import type { Session, Table } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [{ data: sData }, { data: tData }] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("status", "closed")
      .order("ended_at", { ascending: false })
      .limit(100),
    supabase.from("tables").select("*"),
  ]);

  const sessions = (sData ?? []) as Session[];
  const tables = (tData ?? []) as Table[];
  const nameOf = (id: string) =>
    tables.find((t) => t.id === id)?.name ?? "Ширээ";

  const todays = sessions.filter(
    (s) => s.ended_at && new Date(s.ended_at) >= startOfToday
  );
  const todayRevenue = todays.reduce((s, x) => s + (x.total_amount ?? 0), 0);
  const todayTableCharge = todays.reduce((s, x) => s + (x.table_charge ?? 0), 0);
  const todayItems = todays.reduce((s, x) => s + (x.items_total ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Тайлан</h1>
        <p className="text-sm text-slate-400">Орлого, тоглолтын дэлгэрэнгүй.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Өнөөдрийн орлого"
          value={formatMNT(todayRevenue)}
          sub={`${todays.length} тоглолт`}
          accent="violet"
          icon="💰"
        />
        <StatCard
          label="Ширээний орлого"
          value={formatMNT(todayTableCharge)}
          sub="өнөөдөр"
          accent="emerald"
          icon="🎱"
        />
        <StatCard
          label="Барааны орлого"
          value={formatMNT(todayItems)}
          sub="өнөөдөр"
          accent="amber"
          icon="🍺"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4 font-semibold">
          Сүүлийн тоглолтууд
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="px-6 py-3">Ширээ</th>
                <th className="px-6 py-3">Эхэлсэн</th>
                <th className="px-6 py-3">Үргэлжлэл</th>
                <th className="px-6 py-3 text-right">Ширээ</th>
                <th className="px-6 py-3 text-right">Бараа</th>
                <th className="px-6 py-3 text-right">Нийт</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Хаагдсан тоглолт алга.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="border-t border-white/5">
                    <td className="px-6 py-3 font-medium">
                      {nameOf(s.table_id)}
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      {s.started_at
                        ? new Date(s.started_at).toLocaleString("mn-MN")
                        : "-"}
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      {formatDuration((s.duration_minutes ?? 0) * 60)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {formatMNT(s.table_charge ?? 0)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {formatMNT(s.items_total ?? 0)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-emerald-400">
                      {formatMNT(s.total_amount ?? 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
