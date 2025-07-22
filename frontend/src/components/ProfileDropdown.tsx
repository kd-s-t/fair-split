'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Principal } from '@dfinity/principal';
import { getAvatarUrl, truncatePrincipal } from '@/lib/utils';
import EditNameModal from './SettingsModal';
import LogoutButton from './LogoutButton';

export default function ProfileDropdown({ principalId }: { principalId: string }) {
  const [showSettings, setShowSettings] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const fetchName = async () => {
      if (!principalId) return;
      const actor = await import('@/lib/icp/splitDapp').then(m => m.createSplitDappActor());
      const result = await (await actor).getName(Principal.fromText(principalId));
      if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'string') {
        setDisplayName(result[0]);
      } else if (typeof result === 'object' && result !== null && 0 in result && typeof result[0] === 'string') {
        setDisplayName(result[0]);
      } else {
        setDisplayName(null);
      }
    };
    fetchName();
  }, [principalId, showSettings]);

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
        name={displayName || undefined}
        onNameSaved={() => setShowSettings(false)}
      />
    </>
  );
}