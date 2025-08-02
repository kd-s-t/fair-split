"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { House, Wallet } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();

  const nav = [
    { name: "Dashboard", href: "/dashboard", icon: <House size={16} /> },
    { name: "Escrow", href: "/escrow", icon: <Wallet size={16} /> },
    { name: "Transactions", href: "/transactions", icon: <Wallet size={16} /> },
  ];

  return (
    <aside className="h-screen w-48 flex flex-col text-sm bg-[#222222] m-4 rounded-xl">
      <div className="p-4 w-full flex items-center justify-center">
        <Image
          src="/safesplit.svg"
          alt="Logo"
          width={160}
          height={40}
          priority
          className="object-contain w-40 h-10"
        />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-3">
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
              className={`text-white rounded-md px-4 py-3 text-sm transition-colors flex items-center gap-2 ${isActive
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
