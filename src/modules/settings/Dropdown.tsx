'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { getAvatarUrl } from '@/lib/utils';
import EditNameModal from './Modal';
import LogoutButton from './Button';
import { useAppSelector } from '@/lib/redux/store';
import type { RootState } from '@/lib/redux/store';
import { ChevronDown, User, Wallet } from 'lucide-react';

// Wallet Modal Component
const WalletModal = ({ isOpen, onClose, principalId }: { isOpen: boolean; onClose: () => void; principalId: string }) => {


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(principalId);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#212121] border border-[#303333] rounded-xl w-[540px] max-w-[90vw] max-h-[90vh] overflow-hidden shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-[#303333]">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Wallet</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <p className="text-[#A1A1A1] text-sm mt-2">
            This is your wallet-linked Principal ID. You can copy it for reference or use in transactions.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Wallet address</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="bg-[#2B2B2B] border border-[#424444] rounded-md p-3">
                    <input
                      type="text"
                      value={principalId}
                      readOnly
                      className="w-full bg-transparent text-white placeholder-[#A1A1A1] outline-none"
                      placeholder="Your wallet address"
                    />
                  </div>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-3 border border-[#7A7A7A] rounded-md hover:bg-[#3A3A3A] transition-colors bg-[#2A2A2A]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="5.33" y="5.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5"/>
                    <rect x="1.33" y="1.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#303333] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#FEB64D] text-[#0D0D0D] px-4 py-2 rounded-md hover:bg-[#FEB64D]/90 transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M0.67 2L14.67 2L14.67 14" stroke="currentColor" strokeWidth="2"/>
              <path d="M0.67 4L14.67 4L14.67 9.33" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Done</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5.33 3.33L10.67 8L5.33 12.67" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ProfileDropdown({ principalId }: { principalId: string }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
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
        <DropdownMenuContent className="w-56 bg-[#212121] border border-[#303333] text-white rounded-xl shadow-lg">
          
          {/* My Account Section */}
          <DropdownMenuLabel className="px-2 py-1.5">
            <div className="text-sm font-medium text-white">
              My Account
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-[#424444] mx-1" />

          {/* Edit Profile */}
          <DropdownMenuItem 
            onClick={() => setShowSettings(true)}
            className="px-2 py-1.5 cursor-pointer hover:bg-[#2A2A2A] rounded"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <User size={16} className="text-[#FEB64D]" />
                <span className="text-sm text-white">Edit profile</span>
              </div>
              <span className="text-xs text-gray-400">⇧⌘P</span>
            </div>
          </DropdownMenuItem>

          {/* Wallet */}
          <DropdownMenuItem 
            onClick={() => setShowWallet(true)}
            className="px-2 py-1.5 cursor-pointer hover:bg-[#2A2A2A] rounded"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Wallet size={16} className="text-[#FEB64D]" />
                <span className="text-sm text-white">Wallet</span>
              </div>
              <span className="text-xs text-gray-400">⌘W</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-[#424444] mx-1" />

          {/* Logout */}
          <LogoutButton />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Profile Modal */}
      <EditNameModal
        open={showSettings}
        principalId={principalId}
        onClose={() => setShowSettings(false)}
        onNameSaved={() => setShowSettings(false)}
      />

      {/* Wallet Modal */}
      <WalletModal
        isOpen={showWallet}
        onClose={() => setShowWallet(false)}
        principalId={principalId}
      />
    </>
  );
}