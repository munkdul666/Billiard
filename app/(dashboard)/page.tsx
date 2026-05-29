import { createClient } from "@/lib/supabase/server";
import TablesGrid from "@/components/TablesGrid";
import type { Table } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tables")
    .select("*")
    .order("number", { ascending: true });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Ширээнүүд</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Ширээ дээр дарж тоглолт эхлүүлэх, тооцоо хийх боломжтой.
      </p>
      <TablesGrid initialTables={(data ?? []) as Table[]} />
    </div>
  );
}
