import type { Address } from '@hackbg/fadroma'
import { Console, assign, base16, optionallyParallel} from '@hackbg/fadroma'
import { Staking } from '@fadroma/cw'
import { decode, u8, u64, u256, array, set } from '@hackbg/borshest'
import type {
  Chain as Namada,
  Connection as NamadaConnection
} from './Namada'

class NamadaPoSParameters {
  maxProposalPeriod!:             bigint
  maxValidatorSlots!:             bigint
  pipelineLen!:                   bigint
  unbondingLen!:                  bigint
  tmVotesPerToken!:               bigint
  blockProposerReward!:           bigint
  blockVoteReward!:               bigint
  maxInflationRate!:              bigint
  targetStakedRatio!:             bigint
  duplicateVoteMinSlashRate!:     bigint
  lightClientAttackMinSlashRate!: bigint
  cubicSlashingWindowLength!:     bigint
  validatorStakeThreshold!:       bigint
  livenessWindowCheck!:           bigint
  livenessThreshold!:             bigint
  rewardsGainP!:                  bigint
  rewardsGainD!:                  bigint
  constructor (properties: Partial<NamadaPoSParameters> = {}) {
    assign(this, properties, [
      'maxProposalPeriod',
      'maxValidatorSlots',
      'pipelineLen',
      'unbondingLen',
      'tmVotesPerToken',
      'blockProposerReward',
      'blockVoteReward',
      'maxInflationRate',
      'targetStakedRatio',
      'duplicateVoteMinSlashRate',
      'lightClientAttackMinSlashRate',
      'cubicSlashingWindowLength',
      'validatorStakeThreshold',
      'livenessWindowCheck',
      'livenessThreshold',
      'rewardsGainP',
      'rewardsGainD',
    ])
  }
}

class NamadaValidator extends Staking.Validator {
  constructor (properties: Omit<ConstructorParameters<typeof Staking.Validator>[0], 'chain'> & {
    chain: Namada, namadaAddress?: string,
  }) {
    super(properties)
    this.namadaAddress = properties.namadaAddress
  }

  get chain (): Namada { return super.chain as unknown as Namada }

  namadaAddress?:                 Address
  metadata?: {
    email?:                       string
    description?:                 string|null
    website?:                     string|null
    discordHandle?:               string|null
    avatar?:                      string|null
  }
  commission?: {
    commissionRate?:              bigint
    maxCommissionChangePerEpoch?: bigint
  }
  state?: {
    state?:                       string,
    epoch?:                       bigint,
  }
  stake?:                         bigint
  bondedStake?:                   number

  async fetchDetails (options?: { parallel?: boolean }) {
    return fetchValidatorDetails(this.chain.getConnection(), {
      ...options, validator: this
    })
  }
}

export {
  NamadaPoSParameters     as Parameters,
  NamadaValidator         as Validator,
}

export async function fetchStakingParameters (connection: NamadaConnection) {
  const binary = await connection.abciQuery("/vp/pos/pos_params")
  return new NamadaPoSParameters(connection.decode.pos_parameters(binary))
}

export async function fetchTotalStaked (connection: NamadaConnection) {
  const binary = await connection.abciQuery("/vp/pos/total_stake")
  return decode(u64, binary)
}

export async function fetchValidators (
  chain: Namada,
  options: Partial<Parameters<typeof Staking.getValidators>[1]> & {
    parallel?:        boolean,
    parallelDetails?: boolean,
    interval?:        number,
  } = {}
): Promise<Record<string, NamadaValidator>> {
  const connection =
    chain.getConnection()
  const validators: Record<string, NamadaValidator> =
    (await Staking.getValidators(connection, { ...options||{}, Validator: NamadaValidator }))
      .reduce((vv, v)=>Object.assign(vv, { [v.publicKey]: v }), {})
  const addresses =
    await fetchValidatorAddresses(connection)
  const publicKeyToNamadaAddress: Record<string, string> =
    Object.fromEntries(await Promise.all(addresses.map(async address => {
      const binary = await connection.abciQuery(`/vp/pos/validator/consensus_key/${address}`)
      return [base16.encode(binary.slice(2)), address]
    })))
  for (const [publicKey, namadaAddress] of Object.entries(publicKeyToNamadaAddress)) {
    validators[publicKey] ??= new NamadaValidator({ chain, publicKey })
    validators[publicKey].namadaAddress = namadaAddress
  }
  if (options?.details ?? true) {
    await fetchValidatorsDetails(connection, validators, {
      parallel:        options?.parallel,
      parallelDetails: options?.parallelDetails,
    })
  }
  return validators
}

export async function fetchValidatorAddresses (connection: NamadaConnection): Promise<Address[]> {
  const binary = await connection.abciQuery("/vp/pos/validator/addresses")
  return connection.decode.addresses(binary)
}

export async function fetchValidatorsDetails (
  connection: NamadaConnection,
  validators: Record<string, NamadaValidator>,
  options:    { parallel?: boolean, parallelDetails?: boolean },
) {
  const thunks = Object.values(validators)
    .map(validator=>async()=>fetchValidatorDetails(connection, {
      validator,
      parallel: options.parallelDetails
    }))
  if (options?.parallel) {
    connection.log.debug(`NamadaPoS/fetchValidators: ${thunks.length} request(s) in parallel`)
  } else {
    connection.log.debug(`NamadaPoS/fetchValidators: ${thunks.length} request(s) in sequence`)
  }
  await optionallyParallel(options?.parallel, thunks)
}

export async function fetchValidatorDetails (
  connection: NamadaConnection,
  options?:   { parallel?: boolean, validator?: Partial<NamadaValidator> }
) {
  const validator = options?.validator || {}

  if (!validator.namadaAddress) {
    if (!validator.address) {
      throw new Error('missing tendermint or namada address for validator')
    }
    const addressBinary = await connection.abciQuery(`/vp/pos/validator_by_tm_addr/${validator.address}`)
    validator.namadaAddress = connection.decode.address(addressBinary.slice(1))
    connection.log.info(validator.address, 'is', validator.namadaAddress)
  }
  const v = validator.namadaAddress
  const warn = (...args: Parameters<typeof connection["log"]["warn"]>) =>
    (e: Error) => connection.log.warn(...args)
  const requests: Array<()=>Promise<unknown>> = [
    () => connection.abciQuery(`/vp/pos/validator/metadata/${v}`)
      .then(binary =>binary[0] && (validator.metadata = connection.decode.pos_validator_metadata(binary.slice(1))))
      .catch(warn(`Failed to provide validator metadata for ${v}`)),
    () => connection.abciQuery(`/vp/pos/validator/commission/${v}`)
      .then(binary => validator.commission = connection.decode.pos_commission_pair(binary))
      .catch(warn(`Failed to provide validator commission pair for ${v}`)),
    () => connection.abciQuery(`/vp/pos/validator/state/${v}`)
      .then(binary => validator.state = connection.decode.pos_validator_state(binary))
      .catch(warn(`Failed to provide validator state for ${v}`)),
    () => connection.abciQuery(`/vp/pos/validator/stake/${v}`)
      .then(binary => binary[0] && (validator.stake = decode(u256, binary.slice(1))))
      .catch(warn(`Failed to provide validator stake for ${v}`)),
    () => connection.abciQuery(`/vp/pos/validator/consensus_key/${v}`)
      .then(binary => {
        const publicKey = base16.encode(binary.slice(2))
        if (validator.publicKey && (validator.publicKey !== publicKey)) {
          throw Object.assign(new Error(`Fetched different public key for ${v}`), {
            oldPublicKey: validator.publicKey,
            newPublicKey: publicKey
          })
        }
        validator.publicKey = publicKey
      })
      .catch(warn(`Failed to decode validator public key for ${v}`))
  ]
  const prefix = `validator ${v} details: ${requests.length} request(s)`
  if (options?.parallel) {
    connection.log.debug(prefix, `in parallel`)
  } else {
    connection.log.debug(prefix, `in sequence`)
  }
  await optionallyParallel(options?.parallel, requests)
  return validator
}

export async function fetchValidatorsConsensus (connection: NamadaConnection) {
  const binary = await connection.abciQuery("/vp/pos/validator_set/consensus")
  return connection.decode.pos_validator_set(binary).sort(byBondedStake)
}

export async function fetchValidatorsBelowCapacity (connection: NamadaConnection) {
  const binary = await connection.abciQuery("/vp/pos/validator_set/below_capacity")
  return connection.decode.pos_validator_set(binary).sort(byBondedStake)
}

const byBondedStake = (
  a: { bondedStake: number|bigint },
  b: { bondedStake: number|bigint },
)=> (a.bondedStake > b.bondedStake) ? -1
  : (a.bondedStake < b.bondedStake) ?  1
  : 0

export async function fetchValidator (chain: Namada, namadaAddress: Address) {
  return await new NamadaValidator({
    chain,
    address: '',
    namadaAddress
  }).fetchDetails()
}

export async function fetchValidatorStake (connection: NamadaConnection, address: Address) {
  const totalStake = await connection.abciQuery(`/vp/pos/validator/stake/${address}`)
  return decode(u256, totalStake)
}

export async function fetchDelegations (connection: NamadaConnection, address: Address) {
  const binary = await connection.abciQuery(`/vp/pos/delegations/${address}`)
  return connection.decode.addresses(binary)
}

export async function fetchDelegationsAt (
  connection: NamadaConnection, address: Address, epoch?: number
): Promise<Record<string, bigint>> {
  let query = `/vp/pos/delegations_at/${address}`
  epoch = Number(epoch)
  if (!isNaN(epoch)) {
    query += `/${epoch}`
  }
  const binary = await connection.abciQuery(query)
  return connection.decode.address_to_amount(binary) as Record<string, bigint>
}
