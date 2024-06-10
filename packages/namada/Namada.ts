import NamadaConsole from './NamadaConsole'
import NamadaChain from './NamadaChain'
import NamadaConnection from './NamadaConnection'
import NamadaTransaction from './NamadaTransaction'
import { Decode, initDecoder } from './NamadaDecode'
import * as Identity from './NamadaIdentity'
export {
  Decode,
  initDecoder,
  NamadaConsole      as Console,
  NamadaChain        as Chain,
  NamadaConnection   as Connection,
  NamadaTransaction  as Transaction,
  Identity
}
export const testnetChainId = NamadaChain.testnetChainId
export const testnetURLs    = NamadaChain.testnetURLs
export function connect (...args: Parameters<typeof NamadaChain.connect>) {
  return NamadaChain.connect(...args)
}
export function testnet (...args: Parameters<typeof NamadaChain.testnet>) {
  return NamadaChain.testnet(...args)
}
export function mainnet (...args: never) {
  throw new Error(
    'Connection details for Namada mainnet are not built into Fadroma yet. ' +
    'You can pass them to Namada.connect function if you have them.'
  )
}
export type { Validator } from './NamadaPoS'
