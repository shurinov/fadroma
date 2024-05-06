import { Core, Chain } from '@fadroma/agent'
import type { CWConnection, CWAgent } from './cw-connection'

/** Transaction batch for CosmWasm-enabled chains. */
export class CWBatch extends Chain.Batch<CWConnection, CWAgent> {
  upload (
    code:    Parameters<Chain.Batch<Chain.Connection, Chain.Agent>["upload"]>[0],
    options: Parameters<Chain.Batch<Chain.Connection, Chain.Agent>["upload"]>[1]
  ) {
    throw new Core.Error("CWBatch#upload: not implemented")
    return this
  }
  instantiate (
    code:    Parameters<Chain.Batch<Chain.Connection, Chain.Agent>["instantiate"]>[0],
    options: Parameters<Chain.Batch<Chain.Connection, Chain.Agent>["instantiate"]>[1]
  ) {
    throw new Core.Error("CWBatch#instantiate: not implemented")
    return this
  }
  execute (
    contract: Parameters<Chain.Batch<Chain.Connection, Chain.Agent>["execute"]>[0],
    options:  Parameters<Chain.Batch<Chain.Connection, Chain.Agent>["execute"]>[1]
  ) {
    throw new Core.Error("CWBatch#execute: not implemented")
    return this
  }
  async submit () {}
}
