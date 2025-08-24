
import { Actor, HttpAgent } from '@dfinity/agent'
import { idlFactory } from '@/declarations/split_dapp'
import { AuthClient } from '@dfinity/auth-client'

// Add crypto polyfill for Internet Computer
if (typeof window !== 'undefined' && !window.crypto) {
  import('crypto').then(({ webcrypto }) => {
    (window as unknown as { crypto: typeof webcrypto }).crypto = webcrypto
  })
}

const ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
const IS_LOCAL = ORIGIN.startsWith('http://localhost')

// Environment-based host configuration
const getHost = () => {
  // Priority 1: Explicit environment variable
  if (process.env.NEXT_PUBLIC_DFX_HOST) {
    return process.env.NEXT_PUBLIC_DFX_HOST
  }
  
  // Priority 2: NODE_ENV-based configuration
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:4943'
  }
  
  if (process.env.NODE_ENV === 'production') {
    return 'https://icp0.io'
  }
  
  // Priority 3: Force flags (fallback)
  if (process.env.NEXT_PUBLIC_FORCE_MAINNET === 'true') {
    return 'https://icp0.io'
  }
  
  if (process.env.NEXT_PUBLIC_FORCE_LOCAL === 'true') {
    return 'http://localhost:4943'
  }
  
  // Priority 4: Auto-detect based on origin (lowest priority)
  return IS_LOCAL ? 'http://localhost:4943' : 'https://icp0.io'
}

// Environment-based canister ID configuration
const getCanisterId = () => {
  // Priority 1: Explicit environment variable
  if (process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP) {
    return process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP
  }
  
  // Priority 2: NODE_ENV-based configuration
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP_LOCAL || 'local-canister-id'
  }
  
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP_MAINNET || 'efzgd-dqaaa-aaaai-q323a-cai'
  }
  
  // Priority 3: Auto-detect based on host (fallback)
  const host = getHost()
  if (host.includes('localhost')) {
    return process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP_LOCAL || 'local-canister-id'
  } else {
    return process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP_MAINNET || 'efzgd-dqaaa-aaaai-q323a-cai'
  }
}

export const createSplitDappActor = async () => {
  const host = getHost()
  const canisterId = getCanisterId()

  if (!canisterId) {
    throw new Error(
      '❌ Canister ID is required. Check your .env file for NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP'
    )
  }

  // Create agent
  const agent = new HttpAgent({ 
    host
  })
  
  // Fetch root key only for local development
  if (host.includes('localhost')) {
    try {
      await agent.fetchRootKey()
    } catch (error) {
      console.warn('Failed to fetch root key for local development:', error)
    }
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}
export async function getPrincipalText() {
  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();

  // Extract and return the principal
  return identity.getPrincipal().toText();
}

// Function to create actor with authentication
export const createSplitDappActorWithDfxKey = async () => {
  const host = getHost()
  
  const canisterId = getCanisterId()

  if (!canisterId) {
    throw new Error(
      '❌ Canister ID is required. Check your .env file for NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP'
    )
  }

  const authClient = await AuthClient.create()
  const identity = authClient.getIdentity()
  
  const agent = new HttpAgent({ 
    host,
    identity 
  })
  
  // No need to fetch root key for mainnet

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}

// Anonymous actor (not recommended for authed flows)
export const createSplitDappActorAnonymous = async () => {
  const host = getHost()
  
  const canisterId = getCanisterId()

  if (!canisterId) {
    throw new Error(
      '❌ Canister ID is required. Check your .env file for NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP'
    )
  }

  const agent = new HttpAgent({ host })

  // No need to fetch root key for mainnet

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}
