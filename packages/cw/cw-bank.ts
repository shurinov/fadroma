import type { CosmWasmClient, SigningCosmWasmClient } from '@hackbg/cosmjs-esm'
import type { Address, Token, Chain } from '@fadroma/agent'
import { Core } from '@fadroma/agent'

type Connection = {
  api: CosmWasmClient|Promise<CosmWasmClient>
}

export async function getBalance (
  { api }: Connection,
  token:   string,
  address: Address
) {
  api = await Promise.resolve(api)
  if (!address) {
    throw new Error('getBalance: need address')
  }
  const { amount } = await api.getBalance(address, token)
  return amount
}

type SigningConnection = {
  address: Address,
  log: Core.Console
  api: SigningCosmWasmClient|Promise<SigningCosmWasmClient>
}

export async function send (
  { api, address }: SigningConnection,
  { outputs
  , sendFee = 'auto'
  , sendMemo
  , parallel }: Parameters<Chain.Agent["sendImpl"]>[0]
) {
  api = await Promise.resolve(api)
  if (!(api?.sendTokens)) {
    throw new Error("can't send tokens with an unauthenticated agent")
  }
  return api.sendTokens(
    address!,
    recipient as string,
    amounts,
    sendFee,
    sendMemo
  )
}
