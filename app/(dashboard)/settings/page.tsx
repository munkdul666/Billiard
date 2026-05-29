import { createClient } from "@/lib/supabase/server";
import TableSettings from "@/components/TableSettings";
import type { Table } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("tables").select("*").order("number");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Тохиргоо</h1>
        <p className="text-sm text-slate-400">
          Ширээ бүрийн нэр, цагийн тариф, VIP төлөвийг тохируулна.
        </p>
      </div>
      <TableSettings initialTables={(data ?? []) as Table[]} />
    </div>
  );
}
