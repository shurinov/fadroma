import { Logged } from './core'
import type { Block, Connection, Agent } from './chain'
import type * as Token from './token'

/** A transaction in a block on a chain. */
export class Transaction {
  block? :  Block
  hash:     string
  type:     unknown
  data:     unknown
  gasLimit: Token.Native[]
  gasUsed:  Token.Native[]
  status:   'Pending'|'Accepted'|'Rejected'
}

/** Builder object for batched transactions. */
export class Batch<C extends Connection, A extends Agent> extends Logged {

  connection?: C

  agent?: A

  constructor (properties?: Partial<Batch<C, A>>) {
    super(properties)
  }

  /** Add an upload message to the batch. */
  upload (...args: Parameters<A["upload"]>): this {
    this.log.warn('upload: stub (not implemented)')
    return this
  }

  /** Add an instantiate message to the batch. */
  instantiate (...args: Parameters<A["instantiate"]>): this {
    this.log.warn('instantiate: stub (not implemented)')
    return this
  }

  /** Add an execute message to the batch. */
  execute (...args: Parameters<A["execute"]>): this {
    this.log.warn('execute: stub (not implemented)')
    return this
  }

  /** Submit the batch. */
  async submit (...args: unknown[]): Promise<unknown> {
    this.log.warn('submit: stub (not implemented)')
    return {}
  }

}
