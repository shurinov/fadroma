import type * as Namada from './Namada.ts'
import type { NamadaDecoder } from './NamadaDecode.ts'
import { Decode } from './NamadaDecode.ts'
import { Block, Transaction } from '@fadroma/cw'
import { Case } from '@hackbg/4mat'

type Connection = { url: string|URL, decode?: NamadaDecoder, chain?: Namada.Chain }

type NamadaBlockParameters =
  ConstructorParameters<typeof Block>[0]
  & Pick<NamadaBlock, 'chain'|'hash'|'header'|'transactions'|'responses'>

/** Responses from block API endpoints. */
export async function fetchBlockByHeight (
  { url, decode = Decode as unknown as NamadaDecoder, chain }: Connection,
  { height }: { height?: number|string|bigint, }
): Promise<NamadaBlock> {
  if (!url) {
    throw new Error("Can't fetch block: missing connection URL")
  }
  // Fetch block and results as undecoded JSON
  const blockUrl   = `${url}/block?height=${height??''}`
  const resultsUrl = `${url}/block_results?height=${height??''}`
  const [block, results] = await Promise.all([
    fetch(blockUrl).then(response=>response.text()),
    fetch(resultsUrl).then(response=>response.text()),
  ])
  return blockFromResponses({
    block: { url: blockUrl, response: block, },
    results: { url: resultsUrl, response: results, },
  }, { chain, decode, height })
}

export async function fetchBlockResultsByHeight (
  { url }: Connection,
  height?: bigint|number,
): Promise<BlockResults> {
  const response = await fetch(`${url}/block_results?height=${height??''}`)
  console.log(response);
  const { error, result } = await response.json() as {
    error: {
      data: string
    },
    result: {
      height:                  string
      txs_results:             unknown[]|null
      begin_block_events:      unknown[]|null
      end_block_events:        unknown[]|null
      validator_updated:       unknown[]|null
      consensus_param_updates: unknown[]|null
    },
  }
  if (error) {
    throw new Error(error.data)
  }
  const returned: Partial<BlockResults> = {}
  for (const [key, value] of Object.entries(result)) {
    returned[Case.camel(key) as keyof BlockResults] = value as any
  }
  return returned as BlockResults
}

type BlockResults = {
  height:                string
  txsResults:            TxResult[]|null
  beginBlockEvents:      unknown[]|null
  endBlockEvents:        EndBlockEvent[]|null
  validatorUpdates:      unknown[]|null
  consensusParamUpdates: unknown[]|null
}

type TxResult = {
  code:       number
  data:       unknown|null
  log:        string
  info:       string
  gas_wanted: string
  gas_used:   string
  events:     unknown[]
  codespace:  string
}

type EndBlockEvent = {
  type:       string
  attributes: Array<{
    key:      string
    value:    string
    index:    boolean
  }>
}

type DecodedResponses = {
  hash:         string,
  header:       NamadaBlock["header"]
  transactions: Array<Partial<NamadaTransaction> & {id: string}>
}

export function blockFromResponses (
  responses: NonNullable<NamadaBlock["responses"]>,
  options: { decode?: NamadaDecoder, chain?: Namada.Chain, height?: string|number|bigint }
): NamadaBlock {
  const decode = options.decode || Decode as unknown as NamadaDecoder
  const { chain, height } = options
  const blockResponse = responses.block.response
  const { hash, header, transactions: decodedTransactions } = decode.block(
    blockResponse, null /*responses.results?.response*/
  ) as DecodedResponses
  const block = new NamadaBlock({
    chain, hash, header, responses, transactions: [], height: height ? BigInt(height) : undefined
  })
  return Object.assign(block, { transactions: decodedTransactions.map(tx=>{
    return new NamadaTransaction({ hash: tx?.id, ...tx, block })
  }) })
}

class NamadaBlock extends Block {
  constructor ({ responses, ...props }: NamadaBlockParameters) {
    super(props)
    this.#responses = responses
  }
  get chain (): Namada.Chain|undefined { return super.chain as Namada.Chain|undefined }
  #responses?: {
    block:    { url: string, response: string }
    results?: { url: string, response: string }
  }
  get responses () { return this.#responses }
  /** Block header. */
  declare header: NamadaBlockHeader
  /** Timestamp of block */
  get time () { return (this.header as any)?.time }
  /** Transaction in block. */
  declare transactions: NamadaTransaction[]
}

type NamadaBlockHeader = {
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

type NamadaTransactionParameters =
  Pick<NamadaTransaction, 'hash'|'block'> & NamadaTransaction['data']

class NamadaTransaction extends Transaction {
  constructor ({ hash, block, ...data }: NamadaTransactionParameters) {
    super({ hash, block, data })
  }
  get block (): NamadaBlock|undefined {
    return super.block as NamadaBlock|undefined
  }
  declare data: {
    expiration?:          string|null
    timestamp?:           string
    feeToken?:            string
    feeAmountPerGasUnit?: string
    multiplier?:          bigint
    gasLimitMultiplier?:  bigint
    atomic?:              boolean
    txType?:              'Raw'|'Wrapper'|'Decrypted'|'Protocol'
    sections?:            object[]
    content?:             Array<object>
    batch?:               Array<{
      hash:     string,
      codeHash: string,
      dataHash: string,
      memoHash: string
    }>
  }|undefined
}

export {
  NamadaBlock       as Block,
  NamadaTransaction as Transaction,
}
