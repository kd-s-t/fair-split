'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { useDispatch } from 'react-redux'
import { clearUser, setUser, setCkbtcBalance, setUserName } from '../lib/redux/userSlice'
import { setTransactions } from '../lib/redux/transactionsSlice'
import { createSplitDappActor } from '@/lib/icp/splitDapp'
import type { NormalizedTransaction } from '@/modules/transactions/types'

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

  const fetchUserData = useCallback(async (principalObj: Principal) => {
    try {
      const actor = await createSplitDappActor()
      
      // Fetch cKBTC Balance
      try {
        const ckbtcBalanceResult = await actor.getUserBitcoinBalance(principalObj) as number
        
        if (typeof ckbtcBalanceResult === 'bigint' || typeof ckbtcBalanceResult === 'number') {
          const formattedCkbtc = (Number(ckbtcBalanceResult) / 1e8).toFixed(8)
          dispatch(setCkbtcBalance(formattedCkbtc))
        } else {
          console.error('🔄 Failed to get cKBTC balance:', ckbtcBalanceResult)
          dispatch(setCkbtcBalance(null))
        }
      } catch (error) {
        console.error('🔄 Error fetching cKBTC balance:', error)
        dispatch(setCkbtcBalance(null))
      }

      // Fetch User Name
      try {
        const nameResult = await actor.getNickname(principalObj)
        
        if (Array.isArray(nameResult) && nameResult.length > 0) {
          dispatch(setUserName(nameResult[0]))
        } else {
          dispatch(setUserName(null))
        }
      } catch (error) {
        console.error('🔄 Error fetching user name:', error)
        dispatch(setUserName(null))
      }



      // Fetch Transactions
      try {
        const result = await actor.getTransactionsPaginated(principalObj, BigInt(0), BigInt(100)) as { transactions: unknown[] }
        
        const normalizeTx = (tx: unknown) => {
          const serializeTimestamp = (value: unknown) => {
            if (!value) return undefined;
            return typeof value === 'bigint' ? value.toString() : String(value);
          };

          const serializeArrayTimestamp = (value: unknown) => {
            if (Array.isArray(value) && value.length > 0) {
              return value[0].toString();
            }
            return serializeTimestamp(value);
          };

          const txObj = tx as Record<string, unknown>;
          const hasToText = (obj: unknown): obj is { toText: () => string } => {
            return typeof obj === 'object' && obj !== null && 'toText' in obj && typeof (obj as Record<string, unknown>).toText === 'function';
          };

          return {
            ...txObj,
            id: txObj.id as string,
            status: txObj.status as string,
            title: txObj.title as string,
            from: hasToText(txObj.from) ? txObj.from.toText() : String(txObj.from),
            createdAt: serializeTimestamp(txObj.createdAt || '0'),
            confirmedAt: serializeTimestamp(txObj.confirmedAt),
            cancelledAt: serializeTimestamp(txObj.cancelledAt),
            refundedAt: serializeTimestamp(txObj.refundedAt),
            releasedAt: serializeArrayTimestamp(txObj.releasedAt),
            readAt: serializeTimestamp(txObj.readAt),
            bitcoinTransactionHash: Array.isArray(txObj.bitcoinTransactionHash) && txObj.bitcoinTransactionHash.length > 0
              ? txObj.bitcoinTransactionHash[0]
              : txObj.bitcoinTransactionHash,
            bitcoinAddress: Array.isArray(txObj.bitcoinAddress) && txObj.bitcoinAddress.length > 0
              ? txObj.bitcoinAddress[0]
              : txObj.bitcoinAddress,
            to: (txObj.to as unknown[]).map((toEntry: unknown) => {
              const entry = toEntry as Record<string, unknown>;
              return {
                ...entry,
                principal: hasToText(entry.principal) ? entry.principal.toText() : String(entry.principal),
                amount: typeof entry.amount === 'bigint' ? entry.amount.toString() : String(entry.amount),
                percentage: typeof entry.percentage === 'bigint' ? entry.percentage.toString() : String(entry.percentage),
                status: entry.status as unknown,
                name: entry.name as string,
                approvedAt: serializeTimestamp(entry.approvedAt),
                declinedAt: serializeTimestamp(entry.declinedAt),
                readAt: serializeTimestamp(entry.readAt),
              };
            }),
          };
        };
        const normalizedTxs = (result.transactions as unknown[]).map(normalizeTx) as NormalizedTransaction[];
        dispatch(setTransactions(normalizedTxs))
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
        dispatch(setTransactions([]))
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error)
    }
  }, [dispatch])

  const updatePrincipal = useCallback(async (client?: AuthClient) => {
    const authClientToUse = client || authClient
    if (!authClientToUse) {
      return
    }
    
    const isAuthenticated = await authClientToUse.isAuthenticated()
    
    if (!isAuthenticated) {
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
    // Only update if the principal has changed
    if (!principal || principal.toText() !== principalText) {
      setPrincipal(principalObj)
      dispatch(setUser({ principal: principalText, name: null }))
      // Fetch user data immediately after setting principal
      await fetchUserData(principalObj)
    }
  }, [principal, dispatch, authClient, fetchUserData])

  useEffect(() => {
    // Use Internet Identity for both development and production
    const config = { 
      idleOptions: { disableIdle: true }
    };
    
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

    // Check auth state every 60 seconds (reduced frequency to prevent excessive calls)
    const interval = setInterval(checkAuth, 60000)
    
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
