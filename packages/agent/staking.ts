import { assign } from './core'
import type { Connection } from './chain'
import type { Address } from './identity'

export class Validator {
  chain?:  Connection
  address: Address
  constructor (properties: Partial<Validator> = {}) {
    assign(this, properties, ['chain', 'address'])
  }
}
