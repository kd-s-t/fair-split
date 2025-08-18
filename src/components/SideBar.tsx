"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { House, Wallet, History, Zap, ChevronLeft } from "lucide-react";

export default function SideBar() {
  const pathname = usePathname();

  const nav = [
    { name: "Dashboard", href: "/dashboard", icon: <House size={16} /> },
    { name: "Escrow", href: "/escrow", icon: <Wallet size={16} /> },
    { name: "Transactions", href: "/transactions", icon: <History size={16} /> },
    { name: "Integrations", href: "/integrations", icon: <Zap size={16} /> },
  ];

  return (
    <div className="w-[210px] h-screen bg-[#1C1D1D]/80 border-r border-[#2A2B2B] rounded-xl shadow-lg flex flex-col relative">
      {/* Logo Section */}
      <div className="px-6 py-4 flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={24}
          height={24}
          priority
          className="object-contain"
        />
        <div className="flex items-center gap-1">
          <span className="text-[#FEB64D] font-semibold text-lg">SplitSafe</span>
          <span className="text-[#131313] font-medium text-lg">OrangeFarm</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-4 space-y-2">
        {nav.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-3 h-10 ${isActive
                  ? "bg-[#FEB64D] !text-[#0D0D0D] font-semibold"
                  : "hover:bg-[#FEB64D]/20 text-[#BCBCBC]"
                }`}
            >
              {link.icon} {link.name}
            </Link>
          );
        })}
      </div>

      {/* Collapse Button */}
      <div className="absolute top-6 right-6">
        <button className="w-6 h-6 bg-[#343737] border border-[#2A2B2B] rounded-lg flex items-center justify-center">
          <ChevronLeft size={12} className="text-white" />
        </button>
      </div>
    </div>
  );
}
