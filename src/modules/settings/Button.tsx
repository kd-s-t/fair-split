'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/lib/redux/userSlice';
import { setTransactions } from '@/lib/redux/transactionsSlice';
import { setTitle, setSubtitle, setActivePage } from '@/lib/redux/store';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function LogoutButton() {
  const dispatch = useDispatch();
  const { authClient } = useAuth();

  const handleLogout = async () => {
    try {
      // Logout from Internet Identity
      if (authClient) {
        await authClient.logout();
      }
      
      // Clear user data
      dispatch(clearUser());
      dispatch(setTransactions([]));
      dispatch(setTitle(''));
      dispatch(setSubtitle(''));
      dispatch(setActivePage('dashboard'));
      
      // Force page reload to clear all state
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <DropdownMenuItem 
      onClick={handleLogout}
      className="px-2 py-1.5 cursor-pointer hover:bg-[#2F2F2F] focus:bg-[#2F2F2F] data-[highlighted]:bg-[#2F2F2F] rounded"
    >
      <div className="flex items-center gap-3">
        <LogOut size={16} className="text-[#FEB64D]" />
        <span className="text-sm text-white">Log out</span>
      </div>
    </DropdownMenuItem>
  );
}
