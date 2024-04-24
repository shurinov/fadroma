import { assign, Logged } from './core'

/** An address on a chain. */
export type Address = string

/** A cryptographic identity. */
export class Identity extends Logged {
  /** Display name. */
  name?: Address
  /** Unique identifier. */
  address?: Address

  constructor (properties?: Partial<Identity>) {
    super(properties)
    assign(this, properties, ['name', 'address'])
  }

  sign (doc: any): unknown {
    throw new Error("can't sign: stub")
  }
}
