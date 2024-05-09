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
    transactions, rawTransactions, ...properties
  }: ConstructorParameters<typeof Block>[0]
    & Pick<NamadaBlock, 'transactions'|'rawTransactions'>
  ) {
    super(properties)
    this.transactions = [...transactions||[]]
    this.rawTransactions = rawTransactions
  }
  transactions: Transaction[]
  rawTransactions?: unknown[]
}
