'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AuthClient } from '@dfinity/auth-client';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/lib/redux/userSlice';
import { setTransactions } from '@/lib/redux/transactionsSlice';

export default function LogoutButton() {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      const client = await AuthClient.create();
      await client.logout();
      dispatch(clearUser());
      dispatch(setTransactions([]));
    } catch (error) {
      // Optionally, show a toast or notification here
      console.error('Logout failed:', error);
    }
  };
  return <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>;
}
