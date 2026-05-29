"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Имэйл эсвэл нууц үг буруу байна.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-700 to-green-900 text-3xl">
            🎱
          </div>
          <h1 className="text-2xl font-bold">Billiard Bar</h1>
          <p className="mt-1 text-sm text-neutral-400">Удирдлагын систем</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
        >
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Имэйл</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-green-600"
              placeholder="admin@billiard.mn"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-neutral-300">
              Нууц үг
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-green-600"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 py-2.5 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
          >
            {loading ? "Нэвтэрч байна…" : "Нэвтрэх"}
          </button>
        </form>
      </div>
    </div>
  );
}
