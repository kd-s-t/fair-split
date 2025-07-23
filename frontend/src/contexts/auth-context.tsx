'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../lib/redux/userSlice';

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
  const dispatch = useDispatch();

  useEffect(() => {
    AuthClient.create().then(async client => {
      setAuthClient(client)
      const isAuthenticated = await client.isAuthenticated()
      if (isAuthenticated) {
        const identity = client.getIdentity()
        const principalObj = identity.getPrincipal()
        setPrincipal(principalObj)
        // Fetch name from canister
        try {
          const actor = await import('../lib/icp/splitDapp').then(m => m.createSplitDappActor());
          const result = await (await actor).getName(principalObj);
          let name: string | null = null;
          if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'string') {
            name = result[0];
          } else if (typeof result === 'object' && result !== null && 0 in result && typeof result[0] === 'string') {
            name = result[0];
          }
          dispatch(setUser({ principal: principalObj.toText(), name }));
        } catch (e) {
          dispatch(setUser({ principal: principalObj.toText(), name: null }));
        }
      } else {
        setPrincipal(null)
        dispatch(clearUser());
      }
    })
  }, [])

  return (
    <AuthContext.Provider value={{ principal, authClient }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
