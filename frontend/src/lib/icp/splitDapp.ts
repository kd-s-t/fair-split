import { HttpAgent, Actor } from '@dfinity/agent'
import { idlFactory } from '../../declarations/split_dapp.did.js'

const canisterId = process.env.NEXT_PUBLIC_SPLIT_DAPP_CANISTER_ID!

export const createSplitDappActor = () => {
  const agent = new HttpAgent({ host: 'http://localhost:4943' })

  if (process.env.NODE_ENV === 'development') {
    agent.fetchRootKey().catch(console.warn)
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
}
