import { Logged } from './core'
import type { Block, Connection } from './chain'
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
export class Batch<C extends Connection> extends Logged {

  connection?: C

  constructor (properties?: Partial<Batch<C>>) {
    super(properties)
  }

  /** Add an upload message to the batch. */
  upload (...args: Parameters<C["upload"]>): this {
    this.log.warn('upload: stub (not implemented)')
    return this
  }

  /** Add an instantiate message to the batch. */
  instantiate (...args: Parameters<C["instantiate"]>): this {
    this.log.warn('instantiate: stub (not implemented)')
    return this
  }

  /** Add an execute message to the batch. */
  execute (...args: Parameters<C["execute"]>): this {
    this.log.warn('execute: stub (not implemented)')
    return this
  }

  /** Submit the batch. */
  async submit (...args: unknown[]): Promise<unknown> {
    this.log.warn('submit: stub (not implemented)')
    return {}
  }

}
