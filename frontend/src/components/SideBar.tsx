'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { History, House, Wallet } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const nav = [
    { name: 'Dashboard', href: '/dashboard', icon: <House size={16} /> },
    { name: 'Escrow', href: '/escrow', icon: <Wallet size={16} /> },
    { name: 'History', href: '/history', icon: <History size={16} /> },
  ]

  return (
    <aside className="h-screen w-48 flex flex-col text-sm bg-[#222222] m-4 rounded-xl">
      <div className="p-4 flex items-center gap-2">
        <Image
          src="/split.png"
          alt="Logo"
          width={24}
          height={24}
        />
        <div>
          <div className="font-semibold text-base">SplitSafe</div>
          <div className="text-xs text-gray-500">Enterprise</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-3">
        {nav.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-white rounded-md px-4 py-3 text-sm transition-colors flex items-center gap-2 ${pathname.startsWith(link.href)
              ? 'bg-[#FEB64D] !text-[#0D0D0D] font-semibold'
              : 'hover:bg[] text-slate-800'
              }`}
          >
            {link.icon} {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
