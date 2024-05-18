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
    header, rawTransactions, blockRaw, resultsRaw, ...properties
  }: ConstructorParameters<typeof Block>[0] & {
    header: object
    blockRaw:string,
    resultsRaw:string,
  }
    & Pick<NamadaBlock, 'rawTransactions'>
  ) {
    super(properties)
    this.rawTransactions = rawTransactions
    this.header = header
    this.blockRaw = blockRaw
    this.resultsRaw = resultsRaw
  }
  declare transactions: Transaction[]
  rawTransactions?: unknown[]
  header: object
  blockRaw: string
  resultsRaw: string
}
