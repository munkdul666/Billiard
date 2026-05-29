"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Staff } from "@/lib/types";

const ROLES = ["Менежер", "Зөөгч", "Касс", "Бариста"];

type Form = { id: string | null; name: string; role: string; phone: string };
const EMPTY: Form = { id: null, name: "", role: "Зөөгч", phone: "" };

export default function StaffManager({
  initialStaff,
}: {
  initialStaff: Staff[];
}) {
  const supabase = createClient();
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const isEditing = form.id !== null;

  function startEdit(s: Staff) {
    setForm({ id: s.id, name: s.name, role: s.role, phone: s.phone ?? "" });
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      role: form.role,
      phone: form.phone.trim() || null,
    };
    if (isEditing) {
      const { data } = await supabase
        .from("staff")
        .update(payload)
        .eq("id", form.id!)
        .select()
        .single();
      if (data)
        setStaff((p) => p.map((s) => (s.id === form.id ? (data as Staff) : s)));
    } else {
      const { data } = await supabase
        .from("staff")
        .insert({ ...payload, is_active: true, on_shift: false })
        .select()
        .single();
      if (data) setStaff((p) => [...p, data as Staff]);
    }
    setForm(EMPTY);
    setSaving(false);
  }

  async function toggleShift(s: Staff) {
    const next = !s.on_shift;
    setStaff((p) =>
      p.map((x) => (x.id === s.id ? { ...x, on_shift: next } : x))
    );
    await supabase.from("staff").update({ on_shift: next }).eq("id", s.id);
  }

  async function remove(id: string) {
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (!error) {
      setStaff((p) => p.filter((s) => s.id !== id));
      if (form.id === id) setForm(EMPTY);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4 font-semibold">
          Ажилчид
        </div>
        {staff.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">
            Ажилтан алга. Баруун талаас нэмнэ үү.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {staff.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold">
                  {s.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    {s.on_shift && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        Ээлжтэй
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {s.role}
                    {s.phone ? ` · ${s.phone}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => toggleShift(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    s.on_shift
                      ? "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30"
                      : "border border-white/10 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {s.on_shift ? "Ээлж дуусгах" : "Ээлж эхлэх"}
                </button>
                <button
                  onClick={() => startEdit(s)}
                  className="text-sm text-sky-400 hover:text-sky-300"
                >
                  Засах
                </button>
                <button
                  onClick={() => remove(s.id)}
                  className="text-sm text-rose-400 hover:text-rose-300"
                >
                  Устгах
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card h-fit space-y-3 p-6">
        <h2 className="font-semibold">
          {isEditing ? "Ажилтан засах" : "Шинэ ажилтан"}
        </h2>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Нэр</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
            placeholder="Болд"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Үүрэг</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Утас</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
            placeholder="99112233"
          />
        </div>
        <div className="flex gap-2 pt-2">
          {isEditing && (
            <button
              onClick={() => setForm(EMPTY)}
              className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Болих
            </button>
          )}
          <button
            onClick={save}
            disabled={saving || !form.name.trim()}
            className="flex-1 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {saving ? "Хадгалж…" : isEditing ? "Хадгалах" : "Нэмэх"}
          </button>
        </div>
      </div>
    </div>
  );
}
