import { createClient } from "@/lib/supabase/server";
import ProductsManager from "@/components/ProductsManager";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Бараа</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Цэсний бараа нэмэх, засах, устгах.
      </p>
      <ProductsManager initialProducts={(data ?? []) as Product[]} />
    </div>
  );
}
