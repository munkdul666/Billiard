import { createClient } from "@/lib/supabase/server";
import TransactionsClient from "@/components/TransactionsClient";
import type { Session, Staff, Table } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 90 * 86400000).toISOString();

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
        <h1 className="text-2xl font-bold">Гүйлгээ</h1>
        <p className="text-sm text-slate-400">
          Бүх хаагдсан тооцооны түүх. Огноо, ширээ, ажилтнаар шүүнэ.
        </p>
      </div>
      <TransactionsClient
        sessions={(sData ?? []) as Session[]}
        staff={(stData ?? []) as Staff[]}
        tables={(tData ?? []) as Table[]}
      />
    </div>
  );
}
