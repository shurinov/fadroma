export { default as Transaction } from './namada-tx-base'
export * as Transactions from './namada-tx-base'
export { default as Section } from './namada-tx-section'
export * as Sections from './namada-tx-section'
export { default as wasmToContent } from './namada-tx-content'
export * as Contents from './namada-tx-content'

import { Block } from '@fadroma/cw'
import { Decode } from './namada-decode'
import Transaction, { Undecoded } from './namada-tx-base'
import type { Namada } from './namada-connection'

export class NamadaBlock extends Block {

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
  declare transactions: Transaction[]

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
      txs:    Partial<Transaction[]>[]
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
          return Transaction.fromDecoded({
            height,
            ...tx as any
          })
        } catch (error) {
          console.error(error)
          console.warn(`Failed to decode transaction #${i} in block ${height}, see above for details.`)
          return new Undecoded({
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
