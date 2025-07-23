'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { getAvatarUrl, truncatePrincipal } from '@/lib/utils';
import EditNameModal from './SettingsModal';
import LogoutButton from './LogoutButton';
import { useAppSelector } from '../lib/redux/store';
import type { RootState } from '../lib/redux/store';

export default function ProfileDropdown({ principalId }: { principalId: string }) {
  const [showSettings, setShowSettings] = useState(false);
  const displayName = useAppSelector((state: RootState) => state.user.name);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 focus:outline-none cursor-pointer">
            <div className="relative w-6 h-6 overflow-hidden rounded-full">
              <Image
                src={getAvatarUrl()}
                alt={'User avatar'}
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <span className="text-sm font-medium">
              {displayName ? displayName : truncatePrincipal(principalId)}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowSettings(true)}>
            Settings
          </DropdownMenuItem>
          <LogoutButton />
        </DropdownMenuContent>
      </DropdownMenu>
      <EditNameModal
        open={showSettings}
        principalId={principalId}
        onClose={() => setShowSettings(false)}
        onNameSaved={() => setShowSettings(false)}
      />
    </>
  );
}