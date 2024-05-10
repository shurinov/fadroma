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
    rawTransactions, ...properties
  }: ConstructorParameters<typeof Block>[0]
    & Pick<NamadaBlock, 'rawTransactions'>
  ) {
    super(properties)
    this.rawTransactions = rawTransactions
  }
  declare transactions: Transaction[]
  rawTransactions?: unknown[]
}
