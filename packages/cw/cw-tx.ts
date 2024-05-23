import { Block, Batch } from '@hackbg/fadroma'
import { CWError as Error } from './cw-base'
import { Chain } from '@hackbg/fadroma'
import type { CWChain, CWConnection } from './cw-connection'
import type { CWAgent } from './cw-identity'

export class CWBlock extends Block {
  constructor (
    properties: ConstructorParameters<typeof Block>[0] & Partial<Pick<CWBlock, 'rawTransactions'>>
  ) {
    super(properties)
    if (properties.rawTransactions) {
      this.rawTransactions = properties.rawTransactions
    }
  }
  /** Undecoded transactions. */
  rawTransactions?: Uint8Array[]
}

/** Transaction batch for CosmWasm-enabled chains. */
export class CWBatch extends Batch {
  declare agent: CWAgent

  upload (
    code:    Parameters<Batch["upload"]>[0],
    options: Parameters<Batch["upload"]>[1],
  ) {
    throw new Error("CWBatch#upload: not implemented")
    return this
  }
  instantiate (
    code:    Parameters<Batch["instantiate"]>[0],
    options: Parameters<Batch["instantiate"]>[1]
  ) {
    throw new Error("CWBatch#instantiate: not implemented")
    return this
  }
  execute (
    contract: Parameters<Batch["execute"]>[0],
    options:  Parameters<Batch["execute"]>[1]
  ) {
    throw new Error("CWBatch#execute: not implemented")
    return this
  }
  async submit () {}
}
