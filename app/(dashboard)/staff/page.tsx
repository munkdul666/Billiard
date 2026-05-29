import { createClient } from "@/lib/supabase/server";
import StaffManager from "@/components/StaffManager";
import type { Staff } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ажилтан</h1>
        <p className="text-sm text-slate-400">
          Ажилтан нэмэх, ээлжид байгааг тэмдэглэх. Ээлжтэй ажилтан тоглолт
          эхлүүлэхэд сонгогдоно.
        </p>
      </div>
      <StaffManager initialStaff={(data ?? []) as Staff[]} />
    </div>
  );
}
