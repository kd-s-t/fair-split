'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { AuthClient } from '@dfinity/auth-client';

export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    const client = await AuthClient.create();
    await client.logout();
    router.push('/');
  };
  return <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>;
}
