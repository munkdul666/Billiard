import { createClient } from "@/lib/supabase/server";
import TablesGrid from "@/components/TablesGrid";
import type { Table } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("tables").select("*").order("number");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ширээнүүд</h1>
        <p className="text-sm text-slate-400">
          Ширээ дээр дарж тоглолт эхлүүлэх, тооцоо хийх.
        </p>
      </div>
      <TablesGrid initialTables={(data ?? []) as Table[]} />
    </div>
  );
}
