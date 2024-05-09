import {
  bold,
  pickRandom
} from '@fadroma/agent'
import {
  brailleDump
} from '@hackbg/dump'
import {
  NamadaConsole
} from './namada-console'
import {
  Namada,
  NamadaConnection,
} from './namada-connection'
import {
  NamadaMnemonicIdentity
} from './namada-identity'

export const chainIds = {
  testnet: 'shielded-expedition.88f17d1d14'
}

export const testnets = new Set([
  'https://namada-testnet-rpc.itrocket.net',
  'https://namada-rpc.stake-machine.com',
  'https://namadarpc.songfi.xyz',
  'https://rpc.testnet.one',
])

export const faucets = {
  //'luminara.4d6026bc59ee20d9664d3': new Set([
    //'https://faucet.luminara.icu/'
  //])
}

/** Connect to Namada in testnet mode. */
export const testnet = (options: Partial<NamadaConnection> = {}): Promise<Namada> => {
  return Namada.connect({
    ...options||{},
    chainId: chainIds.testnet,
    urls:    testnets,
  })
}

export {
  NamadaConnection       as Connection,
  NamadaMnemonicIdentity as MnemonicIdentity,
}
export {
  initDecoder
} from './namada-decode'
export {
  default as CLI
} from './namada-cli'
export {
  Transaction
} from './namada-tx'
export * as TX from './namada-tx'

export default Namada
