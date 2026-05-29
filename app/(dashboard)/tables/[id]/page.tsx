import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TableDetail from "@/components/TableDetail";
import type { Product, Session, SessionItem, Table } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TableDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: table } = await supabase
    .from("tables")
    .select("*")
    .eq("id", id)
    .single();

  if (!table) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true });

  let session: Session | null = null;
  let items: SessionItem[] = [];

  if (table.current_session_id) {
    const { data: s } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", table.current_session_id)
      .single();
    session = s as Session | null;

    if (session) {
      const { data: it } = await supabase
        .from("session_items")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true });
      items = (it ?? []) as SessionItem[];
    }
  }

  return (
    <TableDetail
      table={table as Table}
      products={(products ?? []) as Product[]}
      initialSession={session}
      initialItems={items}
    />
  );
}
