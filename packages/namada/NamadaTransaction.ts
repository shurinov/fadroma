import { assign } from '@hackbg/fadroma'
import { Block } from '@fadroma/cw'
import { Decode } from './NamadaDecode'
import type { Chain as Namada } from './Namada'

export default class NamadaTransaction {

  constructor (properties: Partial<NamadaTransaction> = {}) {
    assign(this, properties, [
      'id',
      'height',
      'chainId',
      'expiration',
      'timestamp',
      'feeToken',
      'feeAmountPerGasUnit',
      'multiplier',
      'gasLimitMultiplier',
      'txType',
      'sections',
      'content',
      'batch',
      'atomic'
    ])
  }

  id!: string
  height?: number
  chainId!: string
  expiration!: string|null
  timestamp!: string
  feeToken?: string
  feeAmountPerGasUnit?: string
  multiplier?: BigInt
  gasLimitMultiplier?: BigInt
  atomic!: boolean
  txType!: 'Raw'|'Wrapper'|'Decrypted'|'Protocol'
  sections!: object[]
  content?: object
  batch!: Array<{
    hash: string,
    codeHash: string,
    dataHash: string,
    memoHash: string
  }>

  static fromDecoded ({ id, sections, type, ...header }: {
    id: string,
    type: 'Raw'|'Wrapper'|'Decrypted'|'Protocol',
    sections: object[]
  }) {
    return new this({
      ...header,
      id,
      txType: type,
      sections
    })
  }
}

export class NamadaUndecodedTransaction extends NamadaTransaction {
  data!:  unknown
  error!: Error
  constructor (properties: Partial<NamadaUndecodedTransaction> = {}) {
    super()
    assign(this, properties, [ "data", "error" ])
  }
}
