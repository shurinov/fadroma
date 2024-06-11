import { Block } from '@fadroma/cw'
import type { Chain as Namada } from './Namada'
import { Decode } from './NamadaDecode'
import Transaction, { NamadaUndecodedTransaction } from './NamadaTransaction'

export default class NamadaBlock extends Block {

  constructor ({
    header, responses, ...properties
  }: ConstructorParameters<typeof Block>[0]
    & Pick<NamadaBlock, 'header'|'responses'|'chain'>
  ) {
    super(properties)
    this.#chain     = properties.chain
    this.#responses = responses
    this.header     = header
  }

  #chain: Namada
  get chain (): Namada {
    return this.#chain
  }

  #responses?: {
    block:   { url: string, response: string }
    results: { url: string, response: string }
  }
  get responses () {
    return this.#responses
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

  /** Responses from block API endpoints. */

  static async fetchByHeight (
    { url, decode = Decode, chain }: {
      url: string|URL, decode?: typeof Decode, chain?: Namada
    },
    { height, raw }: {
      height?: number|string|bigint,
      raw?: boolean,
    }
  ): Promise<NamadaBlock> {
    if (!url) {
      throw new Error("Can't fetch block: missing connection URL")
    }
    // Fetch block and results as undecoded JSON
    const blockUrl = `${url}/block?height=${height??''}`
    const resultsUrl = `${url}/block_results?height=${height??''}`
    const [block, results] = await Promise.all([
      fetch(blockUrl).then(response=>response.text()),
      fetch(resultsUrl).then(response=>response.text()),
    ])
    return this.fromResponses({
      block: { url: blockUrl, response: block, },
      results: { url: resultsUrl, response: results, },
    }, { chain, decode, height })
  }

  static async fetchByHash (
    _1: { url: string|URL, decode?: typeof Decode, chain?: Namada },
    _2: { hash: string, raw?: boolean },
  ): Promise<NamadaBlock> {
    throw new Error('NamadaBlock.fetchByHash: not implemented')
  }

  static fromResponses (
    responses: NonNullable<NamadaBlock["responses"]>,
    { decode = Decode, chain, height }: {
      decode?: typeof Decode
      chain?:  Namada,
      height?: string|number|bigint
    },
  ): NamadaBlock {
    const { id, header, txs } = decode.block(
      responses.block.response,
      responses.results.response
    ) as {
      id: string,
      txs: Partial<Transaction[]>[]
      header: NamadaBlock["header"]
    }

    return new NamadaBlock({
      id,
      header,

      chain: chain!,
      height: Number(header.height),
      timestamp: header.time,

      transactions: txs.map((tx, i)=>{
        try {
          return Transaction.fromDecoded({
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

      responses
    })

  }

}
