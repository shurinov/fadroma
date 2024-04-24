import { assign } from './core'
import type { Connection } from './chain'
import type { Address } from './identity'

export type ProposalResult = 'Pass'|'Fail'

export class Proposal {
  chain?: Connection
  id:     bigint
  votes:  Vote[]
  result: 'Pass'|'Fail'
  constructor (properties: Partial<Proposal> = {}) {
    assign(this, properties, ['chain', 'id', 'votes', 'result'])
  }
}

export type VoteValue = 'Yay'|'Nay'|'Abstain'

export class Vote {
  proposal: Proposal
  voter:    Address
  power:    bigint
  value:    VoteValue
  constructor (properties: Partial<Vote> = {}) {
    assign(this, properties, ['proposal', 'voter', 'power', 'value'])
  }
}
