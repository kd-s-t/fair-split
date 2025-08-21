
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

export const createSplitDappActor = async () => {
  const host = IS_LOCAL ? 'http://localhost:4943' : 'https://thesplitsafe.com'
  const canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP

  if (!canisterId) {
    throw new Error(
      '❌ Canister ID is required. Check your .env file for NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP'
    )
  }

  // For local development, use anonymous identity (no authentication)
  const agent = new HttpAgent({ 
    host
  })
  
  // Only fetch root key for local development
  if (IS_LOCAL) {
    try {
      await agent.fetchRootKey()
    } catch (error) {
      console.warn('Failed to fetch root key for local development. Make sure your local replica is running with: dfx start --clean', error)
      // Continue without root key for local development
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

// Function to create actor with default DFX identity for local testing
export const createSplitDappActorWithDfxKey = async () => {
  const host = IS_LOCAL ? 'http://localhost:4943' : 'https://thesplitsafe.com'
  
  const canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP

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
  
  // Only fetch root key for local development
  if (IS_LOCAL) {
    try {
      await agent.fetchRootKey()
    } catch (error) {
      console.warn('Failed to fetch root key for local development:', error)
      // Continue without root key for local development
    }
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}

// Deprecated fallback: create anonymous/default actor (not recommended for authed flows)
export const createSplitDappActorAnonymous = async () => {
  const host = IS_LOCAL ? 'http://localhost:4943' : 'https://thesplitsafe.com'
  
  const canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP

  if (!canisterId) {
    throw new Error(
      '❌ Canister ID is required. Check your .env file for NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP'
    )
  }

  const agent = new HttpAgent({ host })

  // Only fetch root key for local development
  if (IS_LOCAL) {
    try {
      await agent.fetchRootKey()
    } catch (error) {
      console.warn('Failed to fetch root key for local development:', error)
      // Continue without root key for local development
    }
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}
