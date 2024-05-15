import { assign } from '@hackbg/fadroma'

export class UpdateStewardCommission {
  static noun = 'Steward Commission Update'
  steward!:    string
  commission!: Record<string, bigint>
  constructor (properties: Partial<UpdateStewardCommission> = {}) {
    assign(this, properties, [
      "steward",
      "commission"
    ])
  }
}

export class ResignSteward {
  static noun = 'Steward Resignation'
  steward!: string
  constructor (properties: Partial<ResignSteward> = {}) {
    assign(this, properties, [
      "steward",
    ])
  }
}
