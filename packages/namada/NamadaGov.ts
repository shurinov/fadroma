import { assign } from '@hackbg/fadroma'
import type { Address } from '@hackbg/fadroma'
import { decode, u64 } from '@hackbg/borshest'
import type Connection from './NamadaConnection'
import type { NamadaDecoder } from './NamadaDecode'

export type Params = Awaited<ReturnType<typeof fetchGovernanceParameters>>

export async function fetchGovernanceParameters (connection: Pick<Connection, 'abciQuery'|'decode'>) {
  const binary = await connection.abciQuery(`/vp/governance/parameters`)
  return connection.decode.gov_parameters(binary)
}

export async function fetchProposalCount (connection: Pick<Connection, 'abciQuery'>) {
  const binary = await connection.abciQuery(`/shell/value/#${INTERNAL_ADDRESS}/counter`)
  return decode(u64, binary) as bigint
}

export type ProposalInfo = Awaited<ReturnType<typeof fetchProposalInfo>>

export async function fetchProposalInfo (
  connection: Pick<Connection, 'abciQuery'|'decode'>, id: number|bigint
) {
  const proposalResponse = await connection.abciQuery(`/vp/governance/proposal/${id}`)
  if (proposalResponse[0] === 0) {
    return null
  }
  const [
    votesResponse, resultResponse 
  ] = await Promise.all([
    `/vp/governance/proposal/${id}/votes`,
    `/vp/governance/stored_proposal_result/${id}`,
  ].map(
    x=>connection.abciQuery(x)
  ))
  const proposal =
    connection.decode.gov_proposal(proposalResponse.slice(1))
  const votes =
    connection.decode.gov_votes(votesResponse)
  const result: GovernanceProposalResult|null =
    (resultResponse[0] === 0)
      ? null
      : new GovernanceProposalResult(
          connection.decode.gov_result(resultResponse.slice(1))
        )
  return { proposal, votes, result }
}

class GovernanceProposalResult implements ReturnType<NamadaDecoder["gov_result"]> {
  result!:            "Passed"|"Rejected"
  tallyType!:         "TwoThirds"|"OneHalfOverOneThird"|"LessOneHalfOverOneThirdNay"
  totalVotingPower!:  bigint
  totalYayPower!:     bigint
  totalNayPower!:     bigint
  totalAbstainPower!: bigint
  constructor (properties: Partial<GovernanceProposalResult> = {}) {
    assign(this, properties, [
      'result',
      'tallyType',
      'totalVotingPower',
      'totalYayPower',
      'totalNayPower',
      'totalAbstainPower',
    ])
  }
  get turnout () {
    return this.totalYayPower + this.totalNayPower + this.totalAbstainPower
  }
  get turnoutPercent () {
    return percent(this.turnout, this.totalVotingPower)
  }
  get yayPercent () {
    return percent(this.totalYayPower, this.turnout)
  }
  get nayPercent () {
    return percent(this.totalNayPower, this.turnout)
  }
  get abstainPercent () {
    return percent(this.totalAbstainPower, this.turnout)
  }
}

const percent = (a: bigint, b: bigint) =>
  ((Number(a * 1000000n / b) / 10000).toFixed(2) + '%').padStart(7)

export {
  GovernanceProposalResult as ProposalResult,
}

export const INTERNAL_ADDRESS = "tnam1q5qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrw33g6"
