import init, { Decode } from './pkg/fadroma_namada.js'
import type * as PGF from './NamadaPGF'
import type * as PoS from './NamadaPoS'
import type * as Gov from './NamadaGov'

export async function initDecoder (decoder: string|URL|Uint8Array): Promise<void> {
  if (decoder instanceof Uint8Array) {
    await init(decoder)
  } else if (decoder) {
    await init(await fetch(decoder))
  }
}

export { Decode }

export interface NamadaDecoder {
  u64 (_: Uint8Array): bigint

  address_to_amount (_: Uint8Array): Record<string, bigint>
  addresses         (_: Uint8Array): string[]
  address           (_: Uint8Array): string

  epoch_duration (_: Uint8Array): {
    minNumOfBlocks: number,
    minDuration: number
  }

  gas_cost_table (_: Uint8Array): Record<string, string>

  gov_parameters (_: Uint8Array): Partial<{
    minProposalFund:         bigint
    maxProposalCodeSize:     bigint
    minProposalVotingPeriod: bigint
    maxProposalPeriod:       bigint
    maxProposalContentSize:  bigint
    minProposalGraceEpochs:  bigint
  }>

  gov_proposal (_: Uint8Array): Partial<{
    id:               string
    content:          Map<string, string>
    author:           string
    type:             unknown
    votingStartEpoch: bigint
    votingEndEpoch:   bigint
    graceEpoch:       bigint
  }>

  gov_votes (_: Uint8Array): Partial<{
    validator: string
    delegator: string
    data:      "Yay"|"Nay"|"Abstain"
  }>[]

  gov_result (_: Uint8Array): Partial<{
    result:            "Passed"|"Rejected"
    tallyType:         "TwoThirds"|"OneHalfOverOneThird"|"LessOneHalfOverOneThirdNay"
    totalVotingPower:  bigint
    totalYayPower:     bigint
    totalNayPower:     bigint
    totalAbstainPower: bigint
  }>

  pgf_parameters (_: Uint8Array): Partial<{
    stewards:              Set<string>
    pgfInflationRate:      bigint
    stewardsInflationRate: bigint
  }>

  pos_validator_set (_: Uint8Array): {
    bondedStake: number|bigint
  }[]

  pos_parameters (_: Uint8Array): Partial<{
    maxProposalPeriod:             bigint
    maxValidatorSlots:             bigint
    pipelineLen:                   bigint
    unbondingLen:                  bigint
    tmVotesPerToken:               bigint
    blockProposerReward:           bigint
    blockVoteReward:               bigint
    maxInflationRate:              bigint
    targetStakedRatio:             bigint
    duplicateVoteMinSlashRate:     bigint
    lightClientAttackMinSlashRate: bigint
    cubicSlashingWindowLength:     bigint
    validatorStakeThreshold:       bigint
    livenessWindowCheck:           bigint
    livenessThreshold:             bigint
    rewardsGainP:                  bigint
    rewardsGainD:                  bigint
  }>

  pos_validator_state (_: Uint8Array): unknown

  storage_keys (): {
    epochDuration:          string,
    maxBlockDuration:       string,
    maxGasForBlock:         string,
    feeUnshieldingGasLimit: string,
    gasCostTable:           string
  }
}
