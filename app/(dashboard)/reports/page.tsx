import { createClient } from "@/lib/supabase/server";
import ReportsClient from "@/components/ReportsClient";
import type { Session, Staff, Table } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 60 * 86400000).toISOString();

  const [{ data: sData }, { data: stData }, { data: tData }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select("*")
        .eq("status", "closed")
        .gte("ended_at", since)
        .order("ended_at", { ascending: false }),
      supabase.from("staff").select("*"),
      supabase.from("tables").select("*"),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Өдрийн тайлан</h1>
        <p className="text-sm text-slate-400">
          Өдөр сонгож тухайн өдрийн орлого, ажилтны гүйцэтгэлийг харна.
        </p>
      </div>
      <ReportsClient
        sessions={(sData ?? []) as Session[]}
        staff={(stData ?? []) as Staff[]}
        tables={(tData ?? []) as Table[]}
      />
    </div>
  );
}
