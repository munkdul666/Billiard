import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import Sidebar from "@/components/Sidebar";
import { IconBell, IconSearch } from "@/components/icons";

const MOBILE_NAV = [
  { href: "/", label: "Самбар" },
  { href: "/tables", label: "Ширээ" },
  { href: "/products", label: "Агуулах" },
  { href: "/reports", label: "Тайлан" },
];

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
  const email = user.email ?? "admin";

  return (
    <div className="flex min-h-screen">
      <Sidebar email={email} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0a0b14]/80 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="text-xl">🎱</span>
              <span className="font-bold">BILLIARD</span>
            </div>

            <div className="hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-slate-400 md:flex">
              <IconSearch className="h-4 w-4" />
              <span>Хайх…</span>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative rounded-xl border border-white/5 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                <IconBell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold">
                  3
                </span>
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold">
                {email.charAt(0).toUpperCase()}
              </div>
              <LogoutButton />
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="flex gap-1 overflow-x-auto border-t border-white/5 px-3 py-2 lg:hidden">
            {MOBILE_NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
