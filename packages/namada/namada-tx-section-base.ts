import { assign } from '@fadroma/agent'

export class Section {
  static noun = 'Section'
  type!: null
    |'Data'
    |'ExtraData'
    |'Code'
    |'Signature'
    |'Ciphertext'
    |'MaspTx'
    |'MaspBuilder'
    |'Header'
  constructor (properties: Partial<Section> = {}) {
    assign(this, properties, [
      "type"
    ])
  }
}

