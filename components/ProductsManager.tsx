"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, ProductCategory } from "@/lib/types";
import { formatMNT } from "@/lib/format";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "beer", label: "Шар айраг" },
  { value: "beverage", label: "Ундаа" },
  { value: "snack", label: "Зууш" },
  { value: "other", label: "Бусад" },
];

const catLabel = (c: string) =>
  CATEGORIES.find((x) => x.value === c)?.label ?? c;

type FormState = {
  id: string | null;
  name: string;
  category: ProductCategory;
  price: string;
  stock: string;
};

const EMPTY: FormState = {
  id: null,
  name: "",
  category: "beverage",
  price: "",
  stock: "0",
};

export default function ProductsManager({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [filter, setFilter] = useState<"all" | ProductCategory>("all");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? products
        : products.filter((p) => p.category === filter),
    [products, filter]
  );

  const isEditing = form.id !== null;

  function startEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
    });
  }

  async function save() {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
    };

    if (isEditing) {
      const { data } = await supabase
        .from("products")
        .update(payload)
        .eq("id", form.id!)
        .select()
        .single();
      if (data)
        setProducts((prev) =>
          prev.map((p) => (p.id === form.id ? (data as Product) : p))
        );
    } else {
      const { data } = await supabase
        .from("products")
        .insert({ ...payload, is_active: true })
        .select()
        .single();
      if (data) setProducts((prev) => [...prev, data as Product]);
    }

    setForm(EMPTY);
    setSaving(false);
  }

  async function remove(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (form.id === id) setForm(EMPTY);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Жагсаалт */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
            Бүгд
          </FilterBtn>
          {CATEGORIES.map((c) => (
            <FilterBtn
              key={c.value}
              active={filter === c.value}
              onClick={() => setFilter(c.value)}
            >
              {c.label}
            </FilterBtn>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-left text-neutral-400">
              <tr>
                <th className="px-4 py-3">Нэр</th>
                <th className="px-4 py-3">Ангилал</th>
                <th className="px-4 py-3 text-right">Үнэ</th>
                <th className="px-4 py-3 text-right">Үлдэгдэл</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                    Бараа алга.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-neutral-800 bg-neutral-950"
                  >
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-neutral-400">
                      {catLabel(p.category)}
                    </td>
                    <td className="px-4 py-3 text-right">{formatMNT(p.price)}</td>
                    <td className="px-4 py-3 text-right text-neutral-300">
                      {p.stock}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => startEdit(p)}
                        className="mr-2 text-blue-400 hover:text-blue-300"
                      >
                        Засах
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Устгах
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Форм */}
      <div className="h-fit space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="font-semibold">
          {isEditing ? "Бараа засах" : "Шинэ бараа"}
        </h2>

        <div>
          <label className="mb-1 block text-xs text-neutral-400">Нэр</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-green-600"
            placeholder="Хайнекен"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-400">Ангилал</label>
          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as ProductCategory })
            }
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-green-600"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Үнэ (₮)</label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-green-600"
              placeholder="6000"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Үлдэгдэл</label>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-green-600"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {isEditing && (
            <button
              onClick={() => setForm(EMPTY)}
              className="flex-1 rounded-lg border border-neutral-700 py-2.5 font-semibold text-neutral-300 transition hover:bg-neutral-800"
            >
              Болих
            </button>
          )}
          <button
            onClick={save}
            disabled={saving || !form.name.trim() || !form.price}
            className="flex-1 rounded-lg bg-green-600 py-2.5 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
          >
            {saving ? "Хадгалж байна…" : isEditing ? "Хадгалах" : "Нэмэх"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-green-600 text-white"
          : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}
