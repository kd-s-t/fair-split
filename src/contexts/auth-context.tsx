'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { useDispatch } from 'react-redux'
import { clearUser } from '../lib/redux/userSlice'

interface AuthContextType {
  principal: Principal | null
  authClient: AuthClient | null
}

const AuthContext = createContext<AuthContextType>({
  principal: null,
  authClient: null,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)
  const [principal, setPrincipal] = useState<Principal | null>(null)
  const dispatch = useDispatch()

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client)

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

    })
  }, [dispatch])

  return (
    <AuthContext.Provider value={{ principal, authClient }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
