import type { CosmWasmClient, SigningCosmWasmClient } from '@hackbg/cosmjs-esm'
import type { Address, Token, Chain, Connection, SigningConnection } from '@fadroma/agent'
import type { CWChain, CWConnection } from './cw-connection'
import type { CWAgent, CWSigningConnection } from './cw-identity'

export async function fetchBalance (
  connection: CWConnection, balances: Parameters<Connection["fetchBalanceImpl"]>[0]
) {
  if (!address) {
    throw new Error('getBalance: need address')
  }
  const { amount } = await connection.api.getBalance(address, token)
  return amount
}

export async function send (
  { api, address }: CWSigningConnection,
  { outputs
  , sendFee = 'auto'
  , sendMemo
  , parallel }: Parameters<SigningConnection["sendImpl"]>[0]
) {
  return api.sendTokens(
    address!,
    recipient as string,
    amounts,
    sendFee,
    sendMemo
  )
}
