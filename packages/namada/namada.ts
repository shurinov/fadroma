export {
  Namada as default,
  NamadaConnection as Connection
} from './namada-connection'
export {
  NamadaMnemonicIdentity as MnemonicIdentity,
} from './namada-identity'
export {
  initDecoder
} from './namada-decode'
export {
  Transaction
} from './namada-tx'
export * as TX from './namada-tx'
export {
  NamadaConsole as Console
} from './namada-console'

import { Namada } from './namada-connection'
export const connect = Namada.connect
export const testnet = Namada.testnet
export const testnetChainId = Namada.testnetChainId
export const testnetURLs = Namada.testnetURLs
