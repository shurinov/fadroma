import { assign } from '@hackbg/fadroma'

export class InitProposal {
  static noun = 'Proposal Init'
  id!:               bigint
  content!:          string
  author!:           string
  type!:             unknown
  votingStartEpoch!: bigint
  votingEndEpoch!:   bigint
  graceEpoch!:       bigint
  constructor (properties: Partial<InitProposal> = {}) {
    assign(this, properties, [
      "id",
      "content",
      "author",
      "type",
      "votingStartEpoch",
      "votingEndEpoch",
      "graceEpoch",
    ])
  }
}

export class VoteProposal {
  static noun = 'Proposal Vote'
  id!:          bigint
  vote!:        unknown
  voter!:       unknown
  delegations!: unknown[]
  constructor (properties: Partial<VoteProposal> = {}) {
    assign(this, properties, [
      "id",
      "vote",
      "voter",
      "delegations"
    ])
  }
}
