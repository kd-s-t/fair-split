'use client'

import ProfileDropdown from '@/modules/settings/Dropdown'
import TransactionNotificationDropdown from '@/modules/notifications/NotificationDropdown'
import { Typography } from '@/components/ui/typography'
import { Bell, ChevronDown } from 'lucide-react'

type HeaderProps = {
  title: string
  subtitle?: string
  user?: {
    name?: string
    principalId: string
  }
}

export default function Header({ title, subtitle, user }: HeaderProps) {
  return (
    <header className="h-[55px] px-6 flex items-center justify-between text-foreground min-w-0 overflow-hidden">
      {/* Title Bar */}
      <div className="flex flex-col space-y-2">
        <Typography variant="h3" className="text-white text-[30px] leading-[30px] font-normal">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="muted" className="text-[#BCBCBC] text-[17px] leading-[17px] font-normal">
            {subtitle}
          </Typography>
        )}
      </div>

      {/* Top Right - Notification and Profile */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <div className="w-12 h-12 bg-[#151717] rounded-[34px] flex items-center justify-center cursor-pointer hover:bg-[#1a1c1c] transition-colors">
            <TransactionNotificationDropdown principalId={user?.principalId ?? ''} />
          </div>
        </div>

        {/* Profile */}
        <ProfileDropdown principalId={user?.principalId ?? ''} />
      </div>
    </header>
  )
}