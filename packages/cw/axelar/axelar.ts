import { CWConnection, CWBatch } from '../cw-connection'
import { CWMnemonicIdentity } from '../cw-identity'
class AxelarConnection extends CWConnection {}
class AxelarMnemonicIdentity extends CWMnemonicIdentity {
  constructor (properties?: { mnemonic?: string } & Partial<CWMnemonicIdentity>) {
    super({ ...defaults, ...properties||{} })
  }
}
const defaults = { coinType: 118, bech32Prefix: 'axelar', hdAccountIndex: 0, }
export {
  AxelarConnection       as Connection,
  AxelarMnemonicIdentity as MnemonicIdentity
}