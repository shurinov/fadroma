import * as Borsher from 'borsher'
import type { Address } from '@fadroma/agent'
import { Core } from '@fadroma/agent'
import { addressSchema, InternalAddresses, decodeAddress } from './namada-address'
import type { Address as NamadaAddress } from './namada-address'
import { u256Schema, decodeU256, decodeU256Fields } from './namada-u256'
import { schemaEnum } from './namada-enum'
import * as Staking from '../cw-staking'

const Schema = Borsher.BorshSchema

type Connection = {
  log: Core.Console,
  abciQuery: (path: string, args?: Uint8Array) => Promise<Uint8Array>
  tendermintClient: Promise<{ validatorsAll }>
};

export async function getStakingParameters (connection: Connection) {
  const binary = await connection.abciQuery("/vp/pos/pos_params")
  return PosParams.fromBorsh(binary)
}

export class PosParams {
  static fromBorsh = binary => new this(Borsher.borshDeserialize(posParamsSchema, binary))
  maxProposalPeriod: bigint
  owned:             OwnedPosParams
  constructor (data: Partial<PosParams> = {}) {
    Core.assignCamelCase(this, data, [
      "max_proposal_period",
      "owned"
    ])
    if (!(this.owned instanceof OwnedPosParams)) {
      this.owned = new OwnedPosParams(this.owned)
    }
  }
}

class OwnedPosParams {
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
  constructor (data: Partial<OwnedPosParams> = {}) {
    Core.assignCamelCase(this, data, Object.keys(ownedPosParamsFields))
    decodeU256Fields(this, [
      "tmVotesPerToken",
      "blockProposerReward",
      "blockVoteReward",
      "maxInflationRate",
      "targetStakedRatio",
      "duplicateVoteMinSlashRate",
      "lightClientAttackMinSlashRate",
      "validatorStakeThreshold",
      "livenessWindowCheck",
      "livenessThreshold",
      "rewardsGainP",
      "rewardsGainD",
    ])
  }
}

const ownedPosParamsFields = {
  max_validator_slots:                Schema.u64,
  pipeline_len:                       Schema.u64,
  unbonding_len:                      Schema.u64,
  tm_votes_per_token:                 u256Schema,
  block_proposer_reward:              u256Schema,
  block_vote_reward:                  u256Schema,
  max_inflation_rate:                 u256Schema,
  target_staked_ratio:                u256Schema,
  duplicate_vote_min_slash_rate:      u256Schema,
  light_client_attack_min_slash_rate: u256Schema,
  cubic_slashing_window_length:       Schema.u64,
  validator_stake_threshold:          u256Schema,
  liveness_window_check:              Schema.u64,
  liveness_threshold:                 u256Schema,
  rewards_gain_p:                     u256Schema,
  rewards_gain_d:                     u256Schema,
}

const posParamsSchema = Schema.Struct({
  owned: Schema.Struct(ownedPosParamsFields),
  max_proposal_period: Schema.u64,
})

export async function getTotalStaked (connection: Connection) {
  const binary = await connection.abciQuery("/vp/pos/total_stake")
  return Borsher.borshDeserialize(totalStakeSchema, binary)
}

const totalStakeSchema = Schema.Struct({ totalStake: Schema.u64 })

export async function getValidators (connection: Connection) {
  return Staking.getValidators(connection, {
    metadata: true,
    Validator: NamadaValidator
  })
}

class NamadaValidator extends Staking.Validator {
  metadata:     ValidatorMetaData
  commission:   CommissionPair
  state:        unknown
  stake:        bigint
  consensusKey: { Ed25519: {} } | { Secp256k1: {} }
  async fetchMetadata (connection: Connection) {
    //await super.fetchMetadata(connection)
    console.log(this.publicKey)
    console.log(this.publicKeyBytes)
    console.log(Core.SHA256(this.publicKeyBytes).slice(0,20))
    console.log(await connection.abciQuery(`/vp/post/validator/validator_by_tm_addr/${this.publicKeyHash}`))
    process.exit(123)
    await Promise.all([
      connection.abciQuery(`/vp/pos/validator/metadata/${this.address}`)
        .then(binary => this.metadata   = ValidatorMetaData.fromBorsh(binary)),
      connection.abciQuery(`/vp/pos/validator/commission/${this.address}`)
        .then(binary => this.commission = CommissionPair.fromBorsh(binary)),
      connection.abciQuery(`/vp/pos/validator/state/${this.address}`)
        .then(binary => this.state      = Borsher.borshDeserialize(stateSchema, binary)),
      connection.abciQuery(`/vp/pos/validator/stake/${this.address}`)
        .then(binary => this.stake      = decodeU256(Borsher.borshDeserialize(stakeSchema, binary))),
      connection.abciQuery(`/vp/pos/validator/consensus_key/${this.address}`)
        .then(binary => this.publicKey  = Borsher.borshDeserialize(consensusKeySchema, binary)),
    ])
    return this
  }
}

export { NamadaValidator as Validator }

export async function getValidatorAddresses (connection: Connection): Promise<Address[]> {
  const binary = await connection.abciQuery("/vp/pos/validator/addresses")
  return [...Borsher.borshDeserialize(getValidatorsSchema, binary) as Set<Array<number>>]
    .map(bytes=>decodeAddress(bytes))
}

const getValidatorsSchema = Schema.HashSet(addressSchema)

export async function getConsensusValidators (connection: Connection) {
  const binary = await connection.abciQuery("/vp/pos/validator_set/consensus")
  return [...Borsher.borshDeserialize(validatorSetSchema, binary) as Set<{
    bonded_stake: number[],
    address:      number[],
  }>].map(({bonded_stake, address})=>({
    address:     decodeAddress(address),
    bondedStake: decodeU256(bonded_stake)
  })).sort((a, b)=> (a.bondedStake > b.bondedStake) ? -1
                  : (a.bondedStake < b.bondedStake) ?  1
                  : 0)
}

export async function getBelowCapacityValidators (connection: Connection) {
  const binary = await connection.abciQuery("/vp/pos/validator_set/below_capacity")
  return [...Borsher.borshDeserialize(validatorSetSchema, binary) as Set<{
    bonded_stake: number[],
    address:      number[],
  }>].map(({bonded_stake, address})=>({
    address:     decodeAddress(address),
    bondedStake: decodeU256(bonded_stake)
  })).sort((a, b)=> (a.bondedStake > b.bondedStake) ? -1
                  : (a.bondedStake < b.bondedStake) ?  1
                  : 0)
}

const validatorSetMemberFields = {
  bonded_stake: u256Schema,
  address:      addressSchema,
}

const validatorSetSchema = Schema.HashSet(Schema.Struct(validatorSetMemberFields))

export async function getValidator (connection: Connection, address: Address) {
  const [ metadata, commission, state, stake, consensusKey ] = await Promise.all([
    `/vp/pos/validator/metadata/${address}`,
    `/vp/pos/validator/commission/${address}`,
    `/vp/pos/validator/state/${address}`,
    `/vp/pos/validator/stake/${address}`,
    `/vp/pos/validator/consensus_key/${address}`,
  ].map(path => connection.abciQuery(path)))
  return {
    metadata:     ValidatorMetaData.fromBorsh(metadata),
    commission:   CommissionPair.fromBorsh(commission),
    state:        Borsher.borshDeserialize(stateSchema, state),
    stake:        decodeU256(Borsher.borshDeserialize(stakeSchema, stake)),
    consensusKey: Borsher.borshDeserialize(consensusKeySchema, consensusKey)
  }
}

export async function getValidatorStake(connection: Connection, address: Address) {
  const totalStake = await connection.abciQuery(`/vp/pos/validator/stake/${address}`)
  return Borsher.borshDeserialize(validatorStakeSchema, totalStake)
}

const validatorStakeSchema = Schema.Option(Schema.Struct({ stake: Schema.u128 }))

export class ValidatorMetaData {
  static fromBorsh = binary => new this(Borsher.borshDeserialize(validatorMetaDataSchema, binary))
  email:         string
  description:   string|null
  website:       string|null
  discordHandle: string|null
  avatar:        string|null
  constructor (data: Partial<ValidatorMetaData> = {}) {
    Core.assignCamelCase(this, data, Object.keys(validatorMetaDataSchemaFields))
  }
}

const validatorMetaDataSchemaFields = {
  email:          Schema.String,
  description:    Schema.Option(Schema.String),
  website:        Schema.Option(Schema.String),
  discord_handle: Schema.Option(Schema.String),
  avatar:         Schema.Option(Schema.String),
}

const validatorMetaDataSchema = Schema.Option(Schema.Struct(
  validatorMetaDataSchemaFields
))

export class CommissionPair {
  static fromBorsh = binary => new this(Borsher.borshDeserialize(commissionPairSchema, binary))
  commissionRate:              bigint
  maxCommissionChangePerEpoch: bigint
  constructor (data: Partial<CommissionPair> = {}) {
    Core.assignCamelCase(this, data, Object.keys(commissionPairSchemaFields))
    decodeU256Fields(this, [
      'commissionRate',
      'maxCommissionChangePerEpoch',
    ])
  }
}

const commissionPairSchemaFields = {
  commission_rate:                 u256Schema,
  max_commission_change_per_epoch: u256Schema,
}

const commissionPairSchema = Schema.Struct(commissionPairSchemaFields)

const stateSchema = Schema.Option(schemaEnum([
  ['Consensus',      Schema.Unit],
  ['BelowCapacity',  Schema.Unit],
  ['BelowThreshold', Schema.Unit],
  ['Inactive',       Schema.Unit],
  ['Jailed',         Schema.Unit],
]))

const stakeSchema = Schema.Option(u256Schema)

const consensusKeySchema = Schema.Option(schemaEnum([
  ['Ed25519',   Schema.Array(Schema.u8, 32)],
  ['Secp256k1', Schema.Array(Schema.u8, 33)],
]))
