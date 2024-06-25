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
  u64                 (_: Uint8Array): bigint
  address_to_amount   (_: Uint8Array): Record<string, bigint>
  addresses           (_: Uint8Array): string[]
  address             (_: Uint8Array): string
  epoch_duration      (_: Uint8Array): { minNumOfBlocks: number, minDuration: number }
  gas_cost_table      (_: Uint8Array): Record<string, string>
  gov_parameters      (_: Uint8Array): Partial<Gov.Parameters>
  gov_proposal        (_: Uint8Array): Partial<Gov.Proposal>
  gov_votes           (_: Uint8Array): Partial<Gov.Vote>[]
  gov_result          (_: Uint8Array): Partial<Gov.ProposalResult>
  pgf_parameters      (_: Uint8Array): Partial<PGF.Parameters>
  pos_validator_set   (_: Uint8Array): { bondedStake: number|bigint }[]
  pos_parameters      (_: Uint8Array): Partial<PoS.Parameters>
  pos_validator_state (_: Uint8Array): unknown
  storage_keys ():
    { epochDuration:          string
    , maxBlockDuration:       string
    , maxGasForBlock:         string
    , feeUnshieldingGasLimit: string
    , gasCostTable:           string }
}
