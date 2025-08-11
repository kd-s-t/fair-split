
import { Actor, HttpAgent } from '@dfinity/agent'
import { idlFactory } from '@/declarations/split_dapp'
import { AuthClient } from '@dfinity/auth-client'

export const createSplitDappActor = async () => {
  const host = process.env.NEXT_PUBLIC_DFX_HOST || ''
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
  
  // Optionally fetch root key in local
  if (host.includes('localhost')) {
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
  const host = process.env.NEXT_PUBLIC_DFX_HOST || ''
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
  
  if (host.includes('localhost')) {
    await agent.fetchRootKey()
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}

// Deprecated fallback: create anonymous/default actor (not recommended for authed flows)
export const createSplitDappActorAnonymous = async () => {
  const host = process.env.NEXT_PUBLIC_DFX_HOST || ''
  const canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP

  if (!canisterId) {
    throw new Error(
      '❌ Canister ID is required. Check your .env file for NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP'
    )
  }

  const agent = new HttpAgent({ host })

  if (host.includes('localhost')) {
    await agent.fetchRootKey()
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}
