'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/lib/redux/userSlice';
import { setTransactions } from '@/lib/redux/transactionsSlice';
import { setTitle, setSubtitle, setActivePage } from '@/lib/redux/store';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      // Clear user data
      dispatch(clearUser());
      dispatch(setTransactions([]));
      dispatch(setTitle(''));
      dispatch(setSubtitle(''));
      dispatch(setActivePage('dashboard'));
      
      // Additional logout logic can be added here
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <DropdownMenuItem 
      onClick={handleLogout}
      className="px-2 py-1.5 cursor-pointer hover:bg-[#2A2A2A] rounded"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <LogOut size={16} className="text-[#FEB64D]" />
          <span className="text-sm text-white">Log out</span>
        </div>
        <span className="text-xs text-gray-400">⇧⌘Q</span>
      </div>
    </DropdownMenuItem>
  );
}
