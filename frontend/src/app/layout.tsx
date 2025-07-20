import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/auth-context'

export const metadata = {
  title: 'Fair Split',
  description: 'Split bills on-chain with ease.',
  icons: {
    icon: '/split.png',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
