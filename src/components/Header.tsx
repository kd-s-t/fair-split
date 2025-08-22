'use client'

import ProfileDropdown from '@/modules/settings/Dropdown'
import TransactionNotificationDropdown from '@/modules/notifications/NotificationDropdown'
import { Typography } from '@/components/ui/typography'
import TransactionStatusBadge from '@/components/TransactionStatusBadge'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import { useUser } from '@/hooks/useUser'

export default function Header() {

  const { principal } = useUser()
  const title = useSelector((state: RootState) => state.layout.title)
  const subtitle = useSelector((state: RootState) => state.layout.subtitle)
  const transactionStatus = useSelector((state: RootState) => state.layout.transactionStatus)

  return (
    <header className="h-[55px] pl-[16px] pr-[16px] mt-[16px] flex items-center justify-between text-foreground min-w-0 overflow-hidden">
      {/* Title Bar */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-4">
          <Typography variant="h3" className="text-white text-[30px] leading-[30px] font-normal">
            {title}
          </Typography>
          {transactionStatus && <TransactionStatusBadge status={transactionStatus} />}
        </div>
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
            <TransactionNotificationDropdown principalId={principal ?? ''} />
          </div>
        </div>

        {/* Profile */}
        <ProfileDropdown principalId={principal ?? ''} />
      </div>
    </header>
  )
}