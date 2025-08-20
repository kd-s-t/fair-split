"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { House, Wallet, History, Zap, ChevronLeft } from "lucide-react";

interface SideBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SideBar({ isOpen, onToggle }: SideBarProps) {
  const pathname = usePathname();

  const nav = [
    { name: "Dashboard", href: "/dashboard", icon: <House size={20} className="text-white flex-shrink-0" /> },
    { name: "Escrow", href: "/escrow", icon: <Wallet size={20} className="text-white flex-shrink-0" /> },
    { name: "Transactions", href: "/transactions", icon: <History size={20} className="text-white flex-shrink-0" /> },
    { name: "Integrations", href: "/integrations", icon: <Zap size={20} className="text-white flex-shrink-0" /> },
  ];

  return (
    <div className={`${isOpen ? 'w-[210px]' : 'w-[60px]'} h-screen bg-[#1C1D1D]/80 border border-[#2A2B2B] shadow-lg flex flex-col relative rounded-[12px] transition-all duration-300`}>
      {/* Logo Section */}
      <div className="px-3 py-4 flex items-center justify-center gap-2">
        {!isOpen && (
          <Image
            src="/logo.svg"
            alt="Logo"
            width={50}
            height={50}
            priority
            className="object-contain"
          />
        )}
        {isOpen && (
          <div className="flex items-center gap-1">
            <span className="text-[#FEB64D] font-semibold text-lg">SplitSafe</span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-4 space-y-2 flex flex-col">
        {nav.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg py-2 text-sm transition-colors flex items-center gap-4 h-10 ${isActive
                  ? "bg-[#FEB64D] !text-[#0D0D0D] font-semibold px-4"
                  : "hover:bg-[#FEB64D]/20 text-white px-3"
                }`}
              style={{ minHeight: '40px' }}
              title={isOpen ? link.name : link.name}
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">{link.icon}</span> {isOpen && link.name}
            </Link>
          );
        })}
      </div>

      {/* Collapse Button */}
      <div className={`absolute top-6 transition-all duration-300 ${isOpen ? 'left-[195px]' : 'left-[45px]'}`}>
        <button 
          onClick={onToggle}
          className="w-6 h-6 bg-[#343737] border border-[#2A2B2B] rounded-lg flex items-center justify-center hover:bg-[#404040] transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
}
