'use client'

import ProfileDropdown from '@/modules/settings/Dropdown'
import TransactionNotificationDropdown from '@/modules/notifications/NotificationDropdown'
import { Typography } from '@/components/ui/typography'


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
    <header className="h-14 px-6 flex items-center justify-between text-foreground min-w-0 overflow-hidden">
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex flex-col min-w-0">
          <Typography variant="h3" className="truncate">{title}</Typography>
          {subtitle && (
            <Typography variant="muted" className="truncate">{subtitle}</Typography>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
        <TransactionNotificationDropdown principalId={user?.principalId ?? ''} />
        <ProfileDropdown principalId={user?.principalId ?? ''} />
      </div>
    </header>
  )
}