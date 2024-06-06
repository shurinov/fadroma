export { default as Section } from './namada-tx-section'
export * as Sections from './namada-tx-section'
export { default as wasmToContent } from './namada-tx-content'
export * as Contents from './namada-tx-content'

import { assign } from '@hackbg/fadroma'
import { Block } from '@fadroma/cw'
import { Decode } from './namada-decode'
import type { Namada } from './namada-connection'
import type Section from './namada-tx-section'
import * as Sections from './namada-tx-section'

class NamadaBlock extends Block {

  constructor ({
    header,
    rawBlockResponse,
    rawResultsResponse,
    ...properties
  }: ConstructorParameters<typeof Block>[0]
    & Pick<NamadaBlock, 'header'|'rawBlockResponse'|'rawResultsResponse'>
  ) {
    super(properties)
    this.header             = header
    this.rawBlockResponse   = rawBlockResponse
    this.rawResultsResponse = rawResultsResponse
  }

  /** Block header. */
  header: {
    version:            object
    chainId:            string
    height:             bigint
    time:               string
    lastBlockId:        string
    lastCommitHash:     string
    dataHash:           string
    validatorsHash:     string
    nextValidatorsHash: string
    consensusHash:      string
    appHash:            string
    lastResultsHash:    string
    evidenceHash:       string
    proposerAddress:    string
  }

  /** Transaction in block. */
  declare transactions: NamadaTransaction[]

  /** Response from block API endpoint. */
  rawBlockResponse?: string

  /** Response from block_results API endpoint. */
  rawResultsResponse?: string

  static async fetchByHeight (
    connection: { url: string|URL, decode?: typeof Decode, chain?: Namada },
    height: number|string|bigint,
    raw?: boolean
  ): Promise<NamadaBlock> {

    const { url, decode = Decode, chain } = connection ?? {}

    if (!url) {
      throw new Error("Can't fetch block: missing connection URL")
    }

    // Fetch block and results as undecoded JSON
    const [block, results] = await Promise.all([
      fetch(`${url}/block?height=${height}`)
        .then(response=>response.text()),
      fetch(`${url}/block_results?height=${height}`)
        .then(response=>response.text()),
    ])

    const { id, header, txs } = decode.block(block, results) as {
      id:     string,
      txs:    Partial<NamadaTransaction[]>[]
      header: NamadaBlock["header"]
    }

    return new NamadaBlock({
      id,
      header,
      chain:        chain!,
      height:       Number(header.height),
      timestamp:    header.time,
      transactions: txs.map((tx, i)=>{
        try {
          return NamadaTransaction.fromDecoded({
            height,
            ...tx as any
          })
        } catch (error) {
          console.error(error)
          console.warn(`Failed to decode transaction #${i} in block ${height}, see above for details.`)
          return new NamadaUndecodedTransaction({
            error: error as any,
            data: tx as any,
          })
        }
      }),
      ...raw ? {
        rawBlockResponse:   block,
        rawResultsResponse: results,
      } : {}
    })

  }

  static async fetchByHash (
    connection: { url: string|URL, decode?: typeof Decode, chain?: Namada },
    hash: string,
    raw?: boolean
  ): Promise<NamadaBlock> {
    throw new Error('NamadaBlock.fetchByHash: not implemented')
  }

}

class NamadaTransaction {

  id!:         string
  height?:     number
  chainId!:    string
  expiration!: string|null
  timestamp!:  string
  codeHash!:   string
  dataHash!:   string
  memoHash!:   string
  txType!:     'Raw'|'Wrapper'|'Decrypted'|'Protocol'
  sections!:   Section[]
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

  static fromDecoded ({ id, sections, type, ...header }: {
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
  }) {
    return new this({
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
  }
}

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
  NamadaBlock as Block,
  NamadaTransaction as Transaction
}

export const Transactions = {
  Undecoded: NamadaUndecodedTransaction,
  Raw:       NamadaRawTransaction,
  Wrapper:   NamadaWrapperTransaction,
  Decrypted: NamadaDecryptedTransaction,
  Protocol:  NamadaProtocolTransaction,
}
