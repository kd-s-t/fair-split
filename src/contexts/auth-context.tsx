'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { useDispatch } from 'react-redux'
import { clearUser, setUser } from '../lib/redux/userSlice'

interface AuthContextType {
  principal: Principal | null
  authClient: AuthClient | null
  updatePrincipal: (client?: AuthClient) => Promise<void>
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

  const updatePrincipal = useCallback(async (client?: AuthClient) => {
    const authClientToUse = client || authClient
    if (!authClientToUse) {
      console.log('🔐 No auth client available for updatePrincipal')
      return
    }
    
    console.log('🔐 Checking authentication status...')
    const isAuthenticated = await authClientToUse.isAuthenticated()
    console.log('🔐 Is authenticated:', isAuthenticated)
    
    if (!isAuthenticated) {
      console.log('🔐 Not authenticated, clearing user if needed')
      // Only logout if we actually had a principal before
      if (principal) {
        await authClientToUse.logout()
        setPrincipal(null)
        dispatch(clearUser())
      }
      return
    }

    const identity = authClientToUse.getIdentity()
    const principalObj = identity.getPrincipal()
    const principalText = principalObj.toText()
    console.log('🔐 Got principal:', principalText)
    
    // Only update if the principal has changed
    if (!principal || principal.toText() !== principalText) {
      console.log('🔐 Updating principal in state and Redux')
      setPrincipal(principalObj)
      dispatch(setUser({ principal: principalText, name: null }))
    } else {
      console.log('🔐 Principal unchanged, no update needed')
    }
  }, [principal, dispatch])

  useEffect(() => {
    // For local development, use anonymous identity
    // For production, use default identity provider
    const config = process.env.NODE_ENV === 'development' 
      ? { 
          idleOptions: { disableIdle: true },
          identityProvider: undefined  // Explicitly disable identity provider for local development
        }
      : {};
    
    AuthClient.create(config).then(async (client) => {
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
    await updatePrincipal()
  }

  return (
    <AuthContext.Provider value={{ principal, authClient, updatePrincipal: handleUpdatePrincipal }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
