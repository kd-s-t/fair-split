'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { getAvatarUrl, truncatePrincipal } from '@/lib/utils';
import EditNameModal from './Modal';
import LogoutButton from './Button';
import { useAppSelector } from '@/lib/redux/store';
import type { RootState } from '@/lib/redux/store';
import { useAuth } from '@/contexts/auth-context';
import { Bitcoin, Settings, User, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfileDropdown({ principalId }: { principalId: string }) {
  const [showSettings, setShowSettings] = useState(false);
  const [bitcoinAddress, setBitcoinAddress] = useState<string | null>(null);
  const [isLoadingBitcoin, setIsLoadingBitcoin] = useState(true);
  const displayName = useAppSelector((state: RootState) => state.user.name);
  const icpBalance = useAppSelector((state: RootState) => state.user.icpBalance);
  const { principal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadBitcoinAddress = async () => {
      if (!principal) {
        setIsLoadingBitcoin(false);
        return;
      }
      
      const maxRetries = 3;
      let retryCount = 0;
      
      const attemptLoad = async (): Promise<void> => {
        try {
          console.log('Loading Bitcoin address for principal:', principal.toText());
          // Use anonymous actor for query operations (getBitcoinAddress is a query method)
          const { createSplitDappActorAnonymous } = await import('@/lib/icp/splitDapp');
          const actor = await createSplitDappActorAnonymous();
          const address = await actor.getBitcoinAddress(principal);
          setBitcoinAddress(address ? String(address) : null);
        } catch (error) {
          console.error(`Failed to load Bitcoin address (attempt ${retryCount + 1}):`, error);
          
          // Retry for network or temporary errors
          if (retryCount < maxRetries - 1) {
            retryCount++;
            console.log(`Retrying Bitcoin address load (${retryCount}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            return attemptLoad();
          }
          
          // Set to null on final error to show "Not Set" status
          setBitcoinAddress(null);
        } finally {
          if (retryCount >= maxRetries - 1) {
            setIsLoadingBitcoin(false);
          }
        }
      };

      attemptLoad();
    };

    loadBitcoinAddress();
  }, [principal]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 focus:outline-none cursor-pointer hover:bg-gray-800 rounded-lg px-2 py-1 transition-colors">
            <div className="relative w-8 h-8 overflow-hidden rounded-full">
              <Image
                src={getAvatarUrl()}
                alt={'User avatar'}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-white">
                {displayName && displayName.trim() !== '' ? displayName : truncatePrincipal(principalId)}
              </span>
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

          {/* Balance Section */}
          <DropdownMenuItem className="px-3 py-2 cursor-default">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-blue-400" />
                <span className="text-sm">ICP Balance</span>
              </div>
              <span className="text-sm font-medium text-blue-400">
                {icpBalance ? `${icpBalance} ICP` : 'Loading...'}
              </span>
            </div>
          </DropdownMenuItem>

          {/* Bitcoin Address Status */}
          <DropdownMenuItem className="px-3 py-2 cursor-default">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Bitcoin size={16} className="text-yellow-400" />
                <span className="text-sm">Bitcoin Address</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                bitcoinAddress 
                  ? 'bg-green-600 text-white' 
                  : 'bg-yellow-600 text-white'
              }`}>
                {isLoadingBitcoin ? 'Loading...' : bitcoinAddress ? 'Set' : 'Not Set'}
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-700" />

          {/* Navigation Items */}
          <DropdownMenuItem 
            onClick={() => handleNavigate('/dashboard')}
            className="px-3 py-2 cursor-pointer hover:bg-gray-700"
          >
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>Dashboard</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => handleNavigate('/integrations')}
            className="px-3 py-2 cursor-pointer hover:bg-gray-700"
          >
            <div className="flex items-center gap-2">
              <Bitcoin size={16} />
              <span>Bitcoin Setup</span>
            </div>
          </DropdownMenuItem>

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