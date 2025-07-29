'use client'

import ProfileDropdown from '@/modules/settings/Dropdown'
import TransactionNotificationDropdown from '@/modules/notifications/NotificationDropdown'
import { Typography } from '@/components/ui/typography'
import { motion } from 'framer-motion'

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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col">
          <Typography variant="h3">{title}</Typography>
          {subtitle && (
            <Typography variant="muted">{subtitle}</Typography>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center gap-4"
      >
        <TransactionNotificationDropdown principalId={user?.principalId ?? ''} />
        <ProfileDropdown principalId={user?.principalId ?? ''} />
      </motion.div>
    </header>
  )
}