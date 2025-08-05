'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { useDispatch } from 'react-redux'
import { clearUser } from '../lib/redux/userSlice'

interface AuthContextType {
  principal: Principal | null
  authClient: AuthClient | null
  updatePrincipal: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  principal: null,
  authClient: null,
  updatePrincipal: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)
  const [principal, setPrincipal] = useState<Principal | null>(null)
  const dispatch = useDispatch()

  const updatePrincipal = async (client: AuthClient) => {
    const isAuthenticated = await client.isAuthenticated()
    
    if (!isAuthenticated) {
      await client.logout()
      setPrincipal(null)
      dispatch(clearUser())
      return
    }

    const identity = client.getIdentity()
    const principalObj = identity.getPrincipal()
    setPrincipal(principalObj)
  }

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client)
      await updatePrincipal(client)
    })
  }, [dispatch])

  // Listen for authentication changes
  useEffect(() => {
    if (!authClient) return

    const checkAuth = async () => {
      await updatePrincipal(authClient)
    }

    // Check auth state every 2 seconds
    const interval = setInterval(checkAuth, 2000)
    
    return () => clearInterval(interval)
  }, [authClient, dispatch])

  const handleUpdatePrincipal = async () => {
    if (authClient) {
      await updatePrincipal(authClient)
    }
  }

  return (
    <AuthContext.Provider value={{ principal, authClient, updatePrincipal: handleUpdatePrincipal }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
