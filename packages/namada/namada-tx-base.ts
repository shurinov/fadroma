import { assign } from '@hackbg/fadroma'
import * as Sections from './namada-tx-section'

class NamadaTransaction {

  static fromDecoded = ({ id, sections, type, ...header }: {
    id: string,
    type: 'Raw'|'Wrapper'|'Decrypted'|'Protocol',
    sections: Array<
      | Partial<Sections.Data>
      | Partial<Sections.ExtraData>
      | Partial<Sections.Code>
      | Partial<Sections.Signature>
      | Partial<Sections.Ciphertext>
      | Partial<Sections.MaspBuilder>
      | Partial<Sections.Header>
      | Partial<Sections.MaspTx>
      | Partial<Sections.Unknown>
    >
  }) => new this({
    ...header,
    id,
    txType: type,
    sections: sections.map(section=>{
      switch (section.type) {
        case 'Data':
          return new Sections.Data(section)
        case 'ExtraData':
          return new Sections.ExtraData(section)
        case 'Code':
          return new Sections.Code(section)
        case 'Signature':
          return new Sections.Signature(section)
        case 'Ciphertext':
          return new Sections.Ciphertext()
        case 'MaspBuilder':
          return new Sections.MaspBuilder(section)
        case 'Header':
          return new Sections.Header(section)
        case 'MaspTx':
          return new Sections.MaspTx(section)
        default:
          return new Sections.Unknown(section)
      }
    })
  })

  id!:         string
  height?:     number
  chainId!:    string
  expiration!: string|null
  timestamp!:  string
  codeHash!:   string
  dataHash!:   string
  memoHash!:   string
  txType!:     'Raw'|'Wrapper'|'Decrypted'|'Protocol'
  sections!:   Sections.Section[]
  content?:    object

  constructor (properties: Partial<NamadaTransaction> = {}) {
    assign(this, properties, [
      'id',
      'height',
      'chainId',
      'expiration',
      'timestamp',
      'codeHash',
      'dataHash',
      'memoHash',
      'txType',
      'sections',
      'content'
    ])
  }
}

export { NamadaTransaction as Transaction }
