"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { House, Wallet, History, Zap, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { Typography } from "./ui/typography";

interface SideBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SideBar({ isOpen, onToggle }: SideBarProps) {
  const pathname = usePathname();
  const { isAdmin } = useUser();

  const nav = [
    { name: "Dashboard", href: "/dashboard", icon: House },
    { name: "Escrow", href: "/escrow", icon: Wallet },
    { name: "Transactions", href: "/transactions", icon: History },
    // Only show Integrations for admin users
    ...(isAdmin ? [{ name: "Integrations", href: "/integrations", icon: Zap }] : []),
  ];

  return (
    <div className={`w-full h-screen bg-[#1C1D1D]/80 border border-[#2A2B2B] shadow-lg flex flex-col relative rounded-[12px] transition-all duration-300`}>
      {/* Logo Section */}
      <div className="px-3 py-4 flex items-center justify-center gap-2">
        {!isOpen && (
          <motion.div
            className="flex items-center gap-1"
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src="/logo.svg"
              alt="Logo"
              width={40}
              height={40}
              priority
              className="object-contain"
            />
          </motion.div>
        )}
        {isOpen && (
          <Image
            src="/safesplit-logo.svg"
            alt="SplitSafe Logo"
            width={160}
            height={40}
            priority
            className="object-contain"
          />
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-4 space-y-2 flex flex-col">
        {nav.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg py-2 text-sm transition-colors flex items-center gap-2 h-10 ${isActive
                ? "bg-[#FEB64D] !text-[#0D0D0D] font-semibold px-4"
                : "hover:bg-[#2d2e2e] text-white px-3"
                }`}
              style={{ minHeight: '40px' }}
              title={link.name}
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <Icon size={20} className={`${isActive ? 'text-black' : 'text-white'} flex-shrink-0`} />
              </span>
              <Typography variant="small">{link.name}</Typography>
            </Link>
          );
        })}
      </div>

      {/* Collapse Button */}
      <div className="absolute top-6 right-[-12px] transition-all duration-300">
        <button
          onClick={onToggle}
          className="w-6 h-6 bg-[#343737] border border-[#2A2B2B] rounded-lg flex items-center justify-center hover:bg-[#404040] transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} className={`text-white transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>
    </div>
  );
}