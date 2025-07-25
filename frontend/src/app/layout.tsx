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
import { useAppSelector } from '../lib/redux/store';
import AuthOverlay from '@/components/AuthOverlay';
import { setBtcBalance, setUserName } from '../lib/redux/userSlice';
import { createSplitDappActor } from '@/lib/icp/splitDapp';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Principal } from '@dfinity/principal';

function BalanceAndNameSyncer() {
  const principal = useAppSelector((state: any) => state.user.principal);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!principal) return;
    (async () => {
      try {
        const actor = await createSplitDappActor();
        const principalObj = Principal.fromText(principal);
        // Fetch BTC balance
        const balance = await actor.getBalance(principalObj);
        const formatted = (Number(balance) / 1e8).toFixed(8);
        dispatch(setBtcBalance(formatted));
        // Fetch name
        const nameResult = await actor.getName(principalObj);
        if (Array.isArray(nameResult) && nameResult.length > 0) {
          dispatch(setUserName(nameResult[0]));
        } else {
          dispatch(setUserName(null));
        }
      } catch (error) {
        console.error(error)
        dispatch(setBtcBalance(null));
        dispatch(setUserName(null));
      }
    })();
  }, [principal, dispatch]);

  return null;
}

function LayoutShell({ children }: { children: ReactNode }) {
  const principal = useAppSelector((state: any) => state.user.principal);
  const name = useAppSelector((state: any) => state.user.name);

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
      <BalanceAndNameSyncer />
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
