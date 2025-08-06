'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { useDispatch } from 'react-redux'
import { clearUser, setUser } from '../lib/redux/userSlice'

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

  const updatePrincipal = useCallback(async (client: AuthClient) => {
    const isAuthenticated = await client.isAuthenticated()
    
    if (!isAuthenticated) {
      // Only logout if we actually had a principal before
      if (principal) {
        await client.logout()
        setPrincipal(null)
        dispatch(clearUser())
      }
      return
    }

    const identity = client.getIdentity()
    const principalObj = identity.getPrincipal()
    
    // Only update if the principal has changed
    if (!principal || principal.toText() !== principalObj.toText()) {
      setPrincipal(principalObj)
      dispatch(setUser({ principal: principalObj.toText(), name: null }))
    }
  }, [principal, dispatch])

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client)
      await updatePrincipal(client)
    })
  }, [dispatch, updatePrincipal])

  // Listen for authentication changes
  useEffect(() => {
    if (!authClient) return

    const checkAuth = async () => {
      await updatePrincipal(authClient)
    }

    // Check auth state every 5 seconds (reduced frequency to prevent interference)
    const interval = setInterval(checkAuth, 5000)
    
    return () => clearInterval(interval)
  }, [authClient, updatePrincipal])

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
