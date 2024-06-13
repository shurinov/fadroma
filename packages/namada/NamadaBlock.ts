import { Block } from '@fadroma/cw'
import type { Chain as Namada } from './Namada'
import { Decode } from './NamadaDecode'
import NamadaTransaction, { NamadaUndecodedTransaction } from './NamadaTransaction'

export default class NamadaBlock extends Block {

  constructor ({
    header, responses, ...properties
  }: ConstructorParameters<typeof Block>[0]
    & Pick<NamadaBlock, 'header'|'responses'|'chain'>
  ) {
    super(properties)
    this.#responses = responses
    this.header     = header
  }

  get chain (): Namada|undefined {
    return super.chain as Namada|undefined
  }

  #responses?: {
    block:   { url: string, response: string }
    results: { url: string, response: string }
  }

  get responses () {
    return this.#responses
  }

  /** Block header. */
  declare header: {
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
  /** Monotonically incrementing ID of block. */
  get height () {
    return Number((this.header as any)?.height)
  }
  /** Timestamp of block */
  get time () {
    return (this.header as any)?.time
  }

  /** Transaction in block. */
  declare transactions: NamadaTransaction[]

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
    const { hash, header, transactions } = decode.block(
      responses.block.response,
      responses.results.response
    ) as {
      height:       bigint,
      hash:         string,
      header:       NamadaBlock["header"]
      transactions: Partial<NamadaTransaction[]>[]
    }
    const block = new NamadaBlock({
      id: hash,
      header,
      chain:        chain!,
      height:       Number(header.height),
      timestamp:    header.time,
      transactions: [],
      responses
    })
    block.transactions = transactions.map(tx=>new NamadaTransaction({
      id: tx.id,
      ...tx,
      block
    }))
    return block
  }

}
