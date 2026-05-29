import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎱</span>
              <span className="text-lg font-bold">Billiard Bar</span>
            </Link>
            <nav className="hidden gap-4 text-sm sm:flex">
              <Link
                href="/"
                className="text-neutral-300 transition hover:text-white"
              >
                Ширээнүүд
              </Link>
              <Link
                href="/products"
                className="text-neutral-300 transition hover:text-white"
              >
                Бараа
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-400 sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>

        {/* Гар утсан дээрх navigation */}
        <nav className="flex gap-4 border-t border-neutral-800 px-4 py-2 text-sm sm:hidden">
          <Link href="/" className="text-neutral-300">
            Ширээнүүд
          </Link>
          <Link href="/products" className="text-neutral-300">
            Бараа
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
