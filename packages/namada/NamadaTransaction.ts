import { assign, Transaction } from '@hackbg/fadroma'
import { Block } from '@fadroma/cw'
import { Decode } from './NamadaDecode'
import type { Chain as Namada } from './Namada'
import type NamadaBlock from './NamadaBlock'

export default class NamadaTransaction extends Transaction {
  constructor ({
    id, block, ...data
  }: Pick<NamadaTransaction,'id'|'block'> & NamadaTransaction['data']) {
    super({ id, block, data })
  }

  get block (): NamadaBlock|undefined {
    return super.block as NamadaBlock|undefined
  }

  declare data: {
    expiration?: string|null
    timestamp?: string
    feeToken?: string
    feeAmountPerGasUnit?: string
    multiplier?: BigInt
    gasLimitMultiplier?: BigInt
    atomic?: boolean
    txType?: 'Raw'|'Wrapper'|'Decrypted'|'Protocol'
    sections?: object[]
    content?: object
    batch?: Array<{
      hash: string,
      codeHash: string,
      dataHash: string,
      memoHash: string
    }>
  }|undefined

  static fromDecoded (
    data:   Pick<NamadaTransaction,'id'|'block'> & NamadaTransaction['data'],
    block?: NamadaBlock
  ) {
    try {
      return new this(data)
    } catch (error: any) {
      console.error(error)
      const context = ` in block ${block?.height??'??'}.`
      console.warn(`Failed to decode transaction${context}`)
      return new NamadaUndecodedTransaction({ error, data })
    }
  }
}

export class NamadaUndecodedTransaction extends NamadaTransaction {
  declare data: any
  error: Error
  constructor (properties: Partial<NamadaUndecodedTransaction> = {}) {
    super(properties)
    assign(this, properties, [ "data", "error" ])
  }
}
