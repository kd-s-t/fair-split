'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { LogIn, LogOut } from 'lucide-react'
import { Principal } from '@dfinity/principal'
import { AuthClient } from '@dfinity/auth-client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)
  const [principal, setPrincipal] = useState<Principal | null>(null)
  const router = useRouter()

  useEffect(() => {
    AuthClient.create().then(client => {
      setAuthClient(client)
      client.isAuthenticated().then(async (authenticated) => {
        if (authenticated) {
          const identity = client.getIdentity()
          const principal = identity.getPrincipal()
          setPrincipal(principal)
          router.push('/dashboard')
        }
      })
    })
  }, [])

  const login = async () => {
    if (!authClient) return
    await authClient.login({
      identityProvider: process.env.NEXT_PUBLIC_ICP_PROVIDER || 'https://identity.ic0.app/#authorize',
      onSuccess: async () => {
        const identity = authClient.getIdentity()
        const principal = identity.getPrincipal()
        setPrincipal(principal)
        router.push('/dashboard')
      },
    })
  }

  const logout = async () => {
    if (!authClient) return
    await authClient.logout()
    setPrincipal(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-950 to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-xl p-8 space-y-6"
      >
        <div className="flex justify-center">
          <Image
            src="/split.png"
            alt="SplitDApp Logo"
            width={150}
            height={64}
          />
        </div>
        <h1 className="text-2xl font-bold text-center">SafeSplit Authentication</h1>

        {principal ? (
          <>
            <p className="text-center break-all">Principal: {principal.toText()}</p>
            <Button onClick={logout} variant="default" className="w-full">
              <LogOut className="cursor-pointer mr-2 h-4 w-4" /> Logout
            </Button>
          </>
        ) : (
          <Button onClick={login} className="w-full">
            <LogIn className="cursor-pointer mr-2 h-4 w-4" /> Login with Internet Identity
          </Button>
        )}
      </motion.div>
    </div>
  )
}
