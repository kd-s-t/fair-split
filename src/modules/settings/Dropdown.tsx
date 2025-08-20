'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { getAvatarUrl } from '@/lib/utils';
import EditNameModal from './Modal';
import LogoutButton from './Button';
import { useAppSelector } from '@/lib/redux/store';
import type { RootState } from '@/lib/redux/store';
import { ChevronDown, User, Wallet } from 'lucide-react';
import { toast } from 'sonner';

// Wallet Modal Component
const WalletModal = ({ isOpen, onClose, principalId }: { isOpen: boolean; onClose: () => void; principalId: string }) => {
  const { icpBalance, ckbtcAddress, ckbtcBalance, seiAddress, seiBalance } = useAppSelector((state: RootState) => state.user);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#212121] border border-[#303333] rounded-xl w-[540px] max-w-[90vw] max-h-[90vh] overflow-hidden shadow-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-[#303333]">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Wallet</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <p className="text-[#A1A1A1] text-sm mt-2">
            Your multi-chain wallet information. You can copy addresses for reference or use in transactions.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* ICP Principal */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">ICP Principal ID</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="bg-[#2B2B2B] border border-[#424444] rounded-md p-3">
                    <input
                      type="text"
                      value={principalId}
                      readOnly
                      className="w-full bg-transparent text-white placeholder-[#A1A1A1] outline-none"
                      placeholder="Your ICP Principal ID"
                    />
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(principalId)}
                  className="px-3 py-3 border border-[#7A7A7A] rounded-md hover:bg-[#3A3A3A] transition-colors bg-[#2A2A2A] cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="5.33" y="5.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5"/>
                    <rect x="1.33" y="1.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
              {icpBalance && (
                <div className="mt-2 text-sm text-[#A1A1A1]">
                  Balance: {Number(icpBalance).toFixed(4)} ICP
                </div>
              )}
            </div>

            {/* ckBTC Address */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">cKBTC Address</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="bg-[#2B2B2B] border border-[#424444] rounded-md p-3">
                    <input
                      type="text"
                      value={ckbtcAddress || "No address generated"}
                      readOnly
                      className="w-full bg-transparent text-white placeholder-[#A1A1A1] outline-none"
                      placeholder="Your cKBTC address"
                    />
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(ckbtcAddress || "")}
                  disabled={!ckbtcAddress}
                  className="px-3 py-3 border border-[#7A7A7A] rounded-md hover:bg-[#3A3A3A] transition-colors bg-[#2A2A2A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="5.33" y="5.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5"/>
                    <rect x="1.33" y="1.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
              {ckbtcBalance && (
                <div className="mt-2 text-sm text-[#A1A1A1]">
                  Balance: {ckbtcBalance} BTC
                </div>
              )}
            </div>

            {/* SEI Address */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">SEI Address</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="bg-[#2B2B2B] border border-[#424444] rounded-md p-3">
                    <input
                      type="text"
                      value={seiAddress || "No address generated"}
                      readOnly
                      className="w-full bg-transparent text-white placeholder-[#A1A1A1] outline-none"
                      placeholder="Your SEI address"
                    />
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(seiAddress || "")}
                  disabled={!seiAddress}
                  className="px-3 py-3 border border-[#7A7A7A] rounded-md hover:bg-[#3A3A3A] transition-colors bg-[#2A2A2A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="5.33" y="5.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5"/>
                    <rect x="1.33" y="1.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
              {seiBalance && (
                <div className="mt-2 text-sm text-[#A1A1A1]">
                  Balance: {seiBalance} SEI
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#303333] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#FEB64D] text-[#0D0D0D] px-4 py-3 rounded-[6px] hover:bg-[#FEB64D]/90 transition-colors cursor-pointer h-10 font-medium"
          >
            Done
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