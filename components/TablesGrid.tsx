"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Table } from "@/lib/types";
import TableCard from "./TableCard";
import StartSessionModal, { type StartChoice } from "./StartSessionModal";

export default function TablesGrid({
  initialTables,
}: {
  initialTables: Table[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [startTarget, setStartTarget] = useState<Table | null>(null);
  const [starting, setStarting] = useState(false);

  // Realtime: any browser change reflects here
  useEffect(() => {
    const channel = supabase
      .channel("tables-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tables" },
        (payload) => {
          setTables((prev) => {
            const next = payload.new as Table;
            if (payload.eventType === "DELETE") {
              return prev.filter((t) => t.id !== (payload.old as Table).id);
            }
            const exists = prev.some((t) => t.id === next.id);
            const updated = exists
              ? prev.map((t) => (t.id === next.id ? next : t))
              : [...prev, next];
            return updated.sort((a, b) => a.number - b.number);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startSession(table: Table, choice: StartChoice) {
    setStarting(true);
    const now = new Date().toISOString();

    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        table_id: table.id,
        started_at: now,
        status: "active",
        billing_mode: choice.billingMode,
        planned_minutes: choice.plannedMinutes,
        staff_id: choice.staffId,
      })
      .select()
      .single();

    if (error || !session) {
      setStarting(false);
      return;
    }

    await supabase
      .from("tables")
      .update({
        status: "occupied",
        started_at: now,
        current_session_id: session.id,
      })
      .eq("id", table.id);

    setStarting(false);
    setStartTarget(null);
    router.push(`/tables/${table.id}`);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onStart={() => setStartTarget(table)}
            onOpen={() => router.push(`/tables/${table.id}`)}
          />
        ))}
      </div>

      {startTarget && (
        <StartSessionModal
          table={startTarget}
          starting={starting}
          onConfirm={(choice) => startSession(startTarget, choice)}
          onCancel={() => setStartTarget(null)}
        />
      )}
    </>
  );
}
