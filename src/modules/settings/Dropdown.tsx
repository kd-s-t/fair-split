'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { getAvatarUrl, truncatePrincipal } from '@/lib/utils';
import EditNameModal from './Modal';
import LogoutButton from './Button';
import { useAppSelector } from '@/lib/redux/store';
import type { RootState } from '@/lib/redux/store';
import { Settings, ChevronDown } from 'lucide-react';


export default function ProfileDropdown({ principalId }: { principalId: string }) {
  const [showSettings, setShowSettings] = useState(false);
  const displayName = useAppSelector((state: RootState) => state.user.name);





  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-3 focus:outline-none cursor-pointer hover:opacity-80 transition-opacity min-w-0">
            <div className="relative w-12 h-12 overflow-hidden rounded-full flex-shrink-0 bg-[#D9D9D9]">
              <Image
                src={getAvatarUrl()}
                alt={'User avatar'}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white text-[19px] leading-[19px] font-normal">
                {displayName && displayName.trim() !== '' ? displayName : 'User'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white rotate-90" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-[#222222] border-[#303434] text-white">
          
          {/* User Info Section */}
          <DropdownMenuLabel className="px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 overflow-hidden rounded-full">
                <Image
                  src={getAvatarUrl()}
                  alt={'User avatar'}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">
                  {displayName && displayName.trim() !== '' ? displayName : 'Anonymous'}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {truncatePrincipal(principalId)}
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-gray-700" />



          <DropdownMenuItem 
            onClick={() => setShowSettings(true)}
            className="px-3 py-2 cursor-pointer hover:bg-gray-700"
          >
            <div className="flex items-center gap-2">
              <Settings size={16} />
              <span>Settings</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-700" />

          {/* Logout */}
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