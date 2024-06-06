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

export default NamadaTransaction

class NamadaUndecodedTransaction extends NamadaTransaction {
  data!:  unknown
  error!: Error
  constructor (properties: Partial<NamadaUndecodedTransaction> = {}) {
    super()
    assign(this, properties, [ "data", "error" ])
  }
}

class NamadaRawTransaction extends NamadaTransaction {
  txType = 'Raw' as 'Raw'
  //constructor (header: object, details: object, sections: object[]) {
    //super(header, sections)
    //this.txType = 'Raw'
  //}
}

class NamadaWrapperTransaction extends NamadaTransaction {
  txType = 'Wrapper' as 'Wrapper'
  //declare fee:                 {
    //token:                     string
    //amountPerGasUnit:          {
      //amount:                  bigint,
      //denomination:            number
    //},
  //}
  //declare pk:                  string
  //declare epoch:               bigint
  //declare gasLimit:            bigint
  //declare unshieldSectionHash: string|null
  //constructor (header: object, details: object, sections: object[]) {
    //super(header, sections)
    //assignCamelCase(this, details, wrapperTransactionFields.map(x=>x[0] as string))
    //this.txType = 'Wrapper'
  //}

//export const wrapperTransactionFields: Fields = [
  //["fee",                 struct(
    //["amountPerGasUnit",  struct(
      //["amount",          u256],
      //["denomination",    u8],
    //)],
    //["token",             addr],
  //)],
  //["pk",                  pubkey],
  //["epoch",               u64],
  //["gasLimit",            u64],
  //["unshieldSectionHash", option(hashSchema)],
//]
}

class NamadaDecryptedTransaction extends NamadaTransaction {
  txType = 'Decrypted' as 'Decrypted'
  //undecryptable: boolean
}

class NamadaProtocolTransaction extends NamadaTransaction {
  txType = 'Protocol' as 'Protocol'
  //pk: string
  //tx: |'EthereumEvents'
      //|'BridgePool'
      //|'ValidatorSetUpdate'
      //|'EthEventsVext'
      //|'BridgePoolVext'
      //|'ValSetUpdateVext'
  //constructor (header: object, details: object, sections: object[]) {
    //super(header, sections)
    //assignCamelCase(this, details, protocolTransactionFields.map(x=>x[0] as string))
    //this.txType = 'Protocol'
  //}

//export const protocolTransactionFields: Fields = [
  //["pk",                   pubkey],
  //["tx",                   variants(
    //['EthereumEvents',     unit],
    //['BridgePool',         unit],
    //['ValidatorSetUpdate', unit],
    //['EthEventsVext',      unit],
    //['BridgePoolVext',     unit],
    //['ValSetUpdateVext',   unit],
  //)],
//]

}

export {
  NamadaUndecodedTransaction as Undecoded,
  NamadaRawTransaction       as Raw,
  NamadaWrapperTransaction   as Wrapper,
  NamadaDecryptedTransaction as Decrypted,
  NamadaProtocolTransaction  as Protocol,
}
