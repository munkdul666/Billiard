"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconTables,
  IconCalendar,
  IconStaff,
  IconTransactions,
  IconInventory,
  IconReports,
  IconSettings,
} from "./icons";

const NAV = [
  { href: "/", label: "Хяналтын самбар", Icon: IconDashboard },
  { href: "/tables", label: "Ширээнүүд", Icon: IconTables },
  { href: "/reservations", label: "Захиалга", Icon: IconCalendar },
  { href: "/staff", label: "Ажилтан", Icon: IconStaff },
  { href: "/transactions", label: "Гүйлгээ", Icon: IconTransactions },
  { href: "/products", label: "Агуулах", Icon: IconInventory },
  { href: "/reports", label: "Тайлан", Icon: IconReports },
  { href: "/settings", label: "Тохиргоо", Icon: IconSettings },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-[#0d0e1a] p-4 lg:flex">
      <div className="mb-8 flex items-center gap-3 px-2 pt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xl">
          🎱
        </div>
        <div>
          <div className="text-sm font-bold leading-tight">BILLIARD</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Management System
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-white/5 bg-gradient-to-br from-violet-600/20 to-indigo-600/10 p-4 text-center">
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-violet-600/40 text-lg">
          ⭐
        </div>
        <div className="text-sm font-semibold">VIP ширээ идэвхтэй</div>
        <div className="mt-1 text-xs text-slate-400">
          Премиум тариф settings-с тохируулна
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-white/5 px-2 pt-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold">
          {email.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-medium">{email}</div>
          <div className="text-[10px] text-slate-500">Админ</div>
        </div>
      </div>
    </aside>
  );
}
