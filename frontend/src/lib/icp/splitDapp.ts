import { Actor, HttpAgent } from '@dfinity/agent'
import { idlFactory } from '@/declarations'

export const createSplitDappActor = async () => {
  const host = process.env.NEXT_PUBLIC_DFX_HOST || 'https://ic0.app'
  const canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP

  if (!canisterId) {
    throw new Error(
      '❌ Canister ID is required. Check your .env file for NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP'
    )
  }

  const agent = new HttpAgent({ host })
  // Optionally fetch root key in local
  if (host.includes('localhost')) {
    await agent.fetchRootKey()
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}
