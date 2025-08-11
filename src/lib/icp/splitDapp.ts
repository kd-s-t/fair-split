
import { Actor, HttpAgent } from '@dfinity/agent'
import { idlFactory } from '@/declarations/split_dapp'
import { AuthClient } from '@dfinity/auth-client'

const ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
const IS_LOCAL = ORIGIN.startsWith('http://localhost')

export const createSplitDappActor = async () => {
  const host = IS_LOCAL ? 'http://localhost:4943' : 'https://staging.thesplitsafe.com'
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
  
  // Fetch root key when talking to a local replica via proxy
  if (IS_LOCAL) {
    await agent.fetchRootKey()
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
  // Use staging host for non-development environments
  const host = process.env.NODE_ENV === 'development' 
    ? (process.env.NEXT_PUBLIC_DFX_HOST || 'http://localhost:4943')
    : 'https://staging.thesplitsafe.com'
  
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
  
  // Fetch root key when talking to a local replica via proxy
  if (host.includes('localhost') || host.includes('staging.thesplitsafe.com')) {
    await agent.fetchRootKey()
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}

// Deprecated fallback: create anonymous/default actor (not recommended for authed flows)
export const createSplitDappActorAnonymous = async () => {
  // Use staging host for non-development environments
  const host = process.env.NODE_ENV === 'development' 
    ? (process.env.NEXT_PUBLIC_DFX_HOST || 'http://localhost:4943')
    : 'https://staging.thesplitsafe.com'
  
  const canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP

  if (!canisterId) {
    throw new Error(
      '❌ Canister ID is required. Check your .env file for NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP'
    )
  }

  const agent = new HttpAgent({ host })

  // Fetch root key when talking to a local replica via proxy
  if (host.includes('localhost') || host.includes('staging.thesplitsafe.com')) {
    await agent.fetchRootKey()
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}
