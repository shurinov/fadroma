export { Transaction } from './namada-tx-base'
export * as Transactions from './namada-tx-variant'
export { Section } from './namada-tx-section-base'
export * as Sections from './namada-tx-section'
export { default as wasmToContent } from './namada-tx-content'
export * as Contents from './namada-tx-content'

import { Block } from '@fadroma/cw'
import { Transaction } from './namada-tx-base'

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
  rawBlockResponse?: string
  rawResultsResponse?: string
  declare transactions: Transaction[]
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
}
