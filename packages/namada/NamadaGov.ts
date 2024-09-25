import { decode, u64 } from '@hackbg/borshest'
import type NamadaConnection from './NamadaConnection'
import type { NamadaDecoder } from './NamadaDecode'

export type Params = Awaited<ReturnType<typeof fetchGovernanceParameters>>

type Connection = Pick<NamadaConnection, 'abciQuery'|'decode'>

export const INTERNAL_ADDRESS = "tnam1q5qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrw33g6"

export async function fetchGovernanceParameters (
  connection: Connection
) {
  const binary = await connection.abciQuery(`/vp/governance/parameters`)
  return connection.decode.gov_parameters(binary)
}

export async function fetchProposalCount (
  connection: Connection
) {
  const binary = await connection.abciQuery(`/shell/value/#${INTERNAL_ADDRESS}/counter`)
  return decode(u64, binary) as bigint
}

export async function fetchProposalInfo (
  connection: Connection, id: number|bigint
): Promise<ReturnType<NamadaDecoder["gov_proposal"]>|null> {
  const query    = `/vp/governance/proposal/${id}`
  const response = await connection.abciQuery(query)
  if (response[0] === 0) return null
  const decoded = connection.decode.gov_proposal(response.slice(1))
  return decoded as ReturnType<NamadaDecoder["gov_proposal"]>
}

export async function fetchProposalVotes (
  connection: Connection, id: number|bigint
): Promise<ReturnType<NamadaDecoder["gov_votes"]>> {
  const query    = `/vp/governance/proposal/${id}/votes`
  const response = await connection.abciQuery(query)
  const decoded  = connection.decode.gov_votes(response)
  return decoded as ReturnType<NamadaDecoder["gov_votes"]>
}

export async function fetchProposalResult (
  connection: Connection, id: number|bigint
): Promise<NamadaGovernanceProposalResult|null> {
  const query    = `/vp/governance/stored_proposal_result/${id}`
  const response = await connection.abciQuery(query)
  if (response[0] === 0) return null
  const decoded = connection.decode.gov_result(response.slice(1))
  const results = decodeResultResponse(decoded as Required<typeof decoded>)
  return results as NamadaGovernanceProposalResult
}

export async function fetchProposalWasm (
  connection: Connection, id: number|bigint
): Promise<NamadaGovernanceProposalWasm|null> {
  id = BigInt(id)
  const codeKey = connection.decode.gov_proposal_code_key(BigInt(id))
  let wasm
  const hasKey = await connection.abciQuery(`/shell/has_key/${codeKey}`)
  if (hasKey[0] === 1) {
    wasm = await connection.abciQuery(`/shell/value/${codeKey}`)
    wasm = wasm.slice(4) // trim length prefix
    return { id, codeKey, wasm }
  } else {
    return null
  }
}

const decodeResultResponse = (
  decoded: {
    result:            "Passed"|"Rejected"
    tallyType:         "TwoThirds"|"OneHalfOverOneThird"|"LessOneHalfOverOneThirdNay"
    totalVotingPower:  bigint
    totalYayPower:     bigint
    totalNayPower:     bigint
    totalAbstainPower: bigint
  },
  turnout = decoded.totalYayPower! + decoded.totalNayPower! + decoded.totalAbstainPower!
): NamadaGovernanceProposalResult => ({
  ...decoded,
  turnout:        String(turnout),
  turnoutPercent: (decoded.totalVotingPower! > 0) ? percent2(turnout, decoded.totalVotingPower!) : '0',
  yayPercent:     (turnout > 0) ? percent(decoded.totalYayPower!, turnout) : '0',
  nayPercent:     (turnout > 0) ? percent(decoded.totalNayPower!, turnout) : '0',
  abstainPercent: (turnout > 0) ? percent(decoded.totalAbstainPower!, turnout) : '0',
})

interface NamadaGovernanceProposal {
  readonly id:       bigint
  readonly proposal: ReturnType<NamadaDecoder["gov_proposal"]>
  readonly votes:    ReturnType<NamadaDecoder["gov_votes"]>
  readonly result:   NamadaGovernanceProposalResult|null
}

interface NamadaGovernanceProposalWasm {
  readonly id:      bigint
  readonly codeKey: string
  readonly wasm?:   Uint8Array
}

interface NamadaGovernanceProposalResult {
  readonly result:            "Passed"|"Rejected"
  readonly tallyType:         "TwoThirds"|"OneHalfOverOneThird"|"LessOneHalfOverOneThirdNay"
  readonly totalVotingPower:  bigint
  readonly totalYayPower:     bigint
  readonly totalNayPower:     bigint
  readonly totalAbstainPower: bigint
  readonly turnout:           string
  readonly turnoutPercent:    string
  readonly yayPercent:        string
  readonly nayPercent:        string
  readonly abstainPercent:    string
}

const percent = (a: string|number|bigint, b: string|number|bigint) =>
  ((Number(BigInt(a) * 1000000n / BigInt(b)) / 10000).toFixed(2) + '%')

const percent2 = (a: string|number|bigint, b: string|number|bigint) =>
  ((Number(BigInt(a) * 1000000n / BigInt(b)) / 1000000).toFixed(2) + '%')

export type {
  NamadaGovernanceProposal       as Proposal,
  NamadaGovernanceProposalWasm   as ProposalWasm,
  NamadaGovernanceProposalResult as ProposalResult,
}
