'use client'

import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/Header'
import Sidebar from '@/components/SideBar'
import * as React from "react";
import { Provider } from 'react-redux';
import { store } from '../lib/redux/store';

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={`w-full caption-bottom text-sm ${className || ""}`} {...props} />;
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={className} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${className || ""}`} {...props} />;
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`p-4 align-middle ${className || ""}`} {...props} />;
}

function LayoutShell({ children }: { children: ReactNode }) {
  const { principal } = useAuth()
  // console.log("principal", principal.toText())
  if (!principal) {
    return <>{children}</>
  }
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header
          title="Create new escrow"
          subtitle="Configure your secure Bitcoin transaction"
          user={{
            principalId: principal.toText(),
          }}
        />
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  )
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
