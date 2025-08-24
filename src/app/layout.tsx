"use client"

import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { Provider } from 'react-redux'
import { store } from '../lib/redux/store'
import ClientLayout from '@/components/ClientLayout'
import DocumentTitle from '@/components/DocumentTitle'

// Add crypto polyfill for Internet Computer
if (typeof window !== 'undefined' && !window.crypto) {
  import('crypto').then(({ webcrypto }) => {
    (window as unknown as { crypto: typeof webcrypto }).crypto = webcrypto
  })
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress hydration warnings caused by browser extensions
              const originalError = console.error;
              console.error = (...args) => {
                if (args[0]?.includes?.('Hydration failed') || 
                    args[0]?.includes?.('Warning: Text content did not match') ||
                    args[0]?.includes?.('message channel closed') ||
                    args[0]?.includes?.('asynchronous response')) {
                  return;
                }
                originalError.apply(console, args);
              };

              // Suppress unhandled promise rejections for message channel errors
              window.addEventListener('unhandledrejection', (event) => {
                if (event.reason?.message?.includes?.('message channel closed') ||
                    event.reason?.message?.includes?.('asynchronous response')) {
                  event.preventDefault();
                  return;
                }
              });
            `,
          }}
        />
      </head>
      <body>
        <Provider store={store}>
          <AuthProvider>
            <DocumentTitle />
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </Provider>
        <Toaster />
      </body>
    </html>
  )
}
