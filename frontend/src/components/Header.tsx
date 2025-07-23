'use client'

import ProfileDropdown from '@/components/ProfileDropdown'
import TransactionNotificationDropdown from './TransactionNotificationDropdown'

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
    <header className="h-14 px-6 flex items-center justify-between text-foreground">
      <div className="flex flex-col">
        <h1 className="text-base font-semibold leading-tight">{title}</h1>
        {subtitle && (
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
          <>
            <TransactionNotificationDropdown principalId={user?.principalId ?? ''} />
            <ProfileDropdown principalId={user?.principalId ?? ''} />
          </>
      </div>
    </header>
  )
}