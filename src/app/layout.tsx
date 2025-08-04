"use client"

import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { Provider } from 'react-redux'
import { store } from '../lib/redux/store'
import ClientLayout from '@/components/ClientLayout'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </Provider>
        <Toaster />
      </body>
    </html>
  )
}
