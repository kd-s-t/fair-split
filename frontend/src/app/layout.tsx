'use client'

import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/Header'
import Sidebar from '@/components/SideBar'
import * as React from "react";
import { Provider } from 'react-redux';
import { store } from '../lib/redux/store';
import type { RootState } from '../lib/redux/store';
import { useAppSelector } from '../lib/redux/store';
import AuthOverlay from '@/components/AuthOverlay';

function LayoutShell({ children }: { children: ReactNode }) {
  const principal = useAppSelector((state: RootState) => state.user.principal);
  const name = useAppSelector((state: RootState) => state.user.name);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header
          title="Create new escrow"
          subtitle="Configure your secure Bitcoin transaction"
          user={{
            principalId: principal,
            name: name || undefined,
          }}
        />
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
      <AuthOverlay />
    </div>
  );
}


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <AuthProvider>
            <LayoutShell>{children}</LayoutShell>
          </AuthProvider>
        </Provider>
        <Toaster />
      </body>
    </html>
  )
}
