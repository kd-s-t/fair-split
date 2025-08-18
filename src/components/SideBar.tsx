"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { House, Wallet, Zap } from "lucide-react";


export default function Sidebar() {
  const pathname = usePathname();

  const nav = [
    { name: "Dashboard", href: "/dashboard", icon: <House size={16} /> },
    { name: "Escrow", href: "/escrow", icon: <Wallet size={16} /> },
    { name: "Transactions", href: "/transactions", icon: <Wallet size={16} /> },
    { name: "Integrations", href: "/integrations", icon: <Zap size={16} /> },
  ];

  return (
    <aside className="h-full w-full flex flex-col text-sm bg-[#222222] p-4 rounded-xl overflow-hidden">
      <div className="w-full flex items-center justify-center mb-4">
        <Image
          src="/safesplit.svg"
          alt="Logo"
          width={160}
          height={40}
          priority
          className="object-contain w-32 h-8"
        />
      </div>

      <nav className="flex-1 overflow-y-auto space-y-2">
        {nav.map((link) => {
          const isDashboardActive =
            link.href === "/dashboard" &&
            (pathname === "/" || pathname.startsWith("/dashboard"));
          const isActive =
            isDashboardActive ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-white rounded-md px-3 py-2 text-sm transition-colors flex items-center gap-2 ${isActive
                  ? "bg-[#FEB64D] !text-[#0D0D0D] font-semibold"
                  : "hover:bg-[#FEB64D]/20 text-slate-800"
                }`}
            >
              {link.icon} {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
