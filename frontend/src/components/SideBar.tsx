'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const nav = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Escrow', href: '/escrow' },
    { name: 'History', href: '/history' },
  ]

  return (
    <aside className="h-screen w-64 border-r border-gray-200 flex flex-col text-sm">
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

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {nav.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-2 text-sm transition-colors flex items-center gap-2 ${pathname.startsWith(link.href)
              ? 'bg-slate-900 text-white'
              : 'hover:bg-slate-100 text-slate-800'
              }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
