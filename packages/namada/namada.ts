export {
  Namada as default,
  NamadaConnection as Connection
} from './namada-connection'
export {
  NamadaMnemonicIdentity as MnemonicIdentity,
} from './namada-identity'
export {
  initDecoder,
  Decode
} from './namada-decode'
export {
  Transaction
} from './namada-tx'
export * as TX from './namada-tx'
export {
  NamadaConsole as Console
} from './namada-console'

import { Namada } from './namada-connection'

export function connect (...args: Parameters<typeof Namada.connect>) {
  return Namada.connect(...args)
}

export function testnet (...args: Parameters<typeof Namada.testnet>) {
  return Namada.testnet(...args)
}

export function mainnet (...args: never) {
  throw new Error(
    'Connection details for Namada mainnet are not built into Fadroma yet. ' +
    'You can pass them to Namada.connect function if you have them.'
  )
}

export const testnetChainId = Namada.testnetChainId

export const testnetURLs = Namada.testnetURLs
