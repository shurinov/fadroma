import type { Address } from '@hackbg/fadroma'
import { Console, assign, base16, optionallyParallel} from '@hackbg/fadroma'
import { Staking } from '@fadroma/cw'
import { decode, u8, u64, u256, array, set } from '@hackbg/borshest'
import { NamadaConnection } from './namada-connection'
import type { Namada } from './namada-connection'

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

class NamadaValidatorMetadata {
  constructor (
    properties: Pick<NamadaValidatorMetadata, 'email'|'description'|'website'|'discordHandle'|'avatar'>
  ) {
    assign(this, properties, [ 'email', 'description', 'website', 'discordHandle', 'avatar', ])
  }
  email!:         string
  description!:   string|null
  website!:       string|null
  discordHandle!: string|null
  avatar!:        string|null
}

class NamadaValidator extends Staking.Validator {
  constructor (properties: Omit<ConstructorParameters<typeof Staking.Validator>[0], 'chain'> & {
    chain:         Namada,
    namadaAddress: string
  }) {
    super(properties)
    this.namadaAddress = properties.namadaAddress
  }
  get chain (): Namada {
    return super.chain as unknown as Namada
  }
  namadaAddress!: Address
  metadata!:      NamadaValidatorMetadata
  commission!:    NamadaCommissionPair
  state!:         unknown
  stake!:         bigint
  async fetchDetails (options?: { parallel?: boolean }) {

    const connection = this.chain.getConnection()

    if (!this.namadaAddress) {
      const addressBinary = await connection.abciQuery(`/vp/pos/validator_by_tm_addr/${this.address}`)
      this.namadaAddress = connection.decode.address(addressBinary.slice(1))
    }

    const requests: Array<()=>Promise<unknown>> = [

      () => connection.abciQuery(`/vp/pos/validator/metadata/${this.namadaAddress}`)
        .then(binary => {
          if (binary[0] === 1) {
            this.metadata = new NamadaValidatorMetadata(
              connection.decode.pos_validator_metadata(binary.slice(1)) as
                ConstructorParameters<typeof NamadaValidatorMetadata>[0]
            )
          }
        })
        .catch(e => connection.log.warn(
          `Failed to decode validator metadata for ${this.namadaAddress}`
        )),

      () => connection.abciQuery(`/vp/pos/validator/commission/${this.namadaAddress}`)
        .then(binary => {
          if (binary[0] === 1) {
            this.commission = new NamadaCommissionPair(connection.decode.pos_commission_pair(binary.slice(1)))
          }
        })
        .catch(e => connection.log.warn(
          `Failed to decode validator commission pair for ${this.namadaAddress}`
        )),

      () => connection.abciQuery(`/vp/pos/validator/state/${this.namadaAddress}`)
        .then(binary => {
          if (binary[0] === 1) {
            this.state = connection.decode.pos_validator_state(binary.slice(1))
          }
        })
        .catch(e => connection.log.warn(
          `Failed to decode validator state for ${this.namadaAddress}`
        )),

      () => connection.abciQuery(`/vp/pos/validator/stake/${this.namadaAddress}`)
        .then(binary => {
          if (binary[0] === 1) {
            this.stake = decode(u256, binary.slice(1))
          }
        })
        .catch(e => connection.log.warn(
          `Failed to decode validator stake for ${this.namadaAddress}`
        )),

    ]

    if (this.namadaAddress && !this.publicKey) {
      requests.push(() =>
        connection.abciQuery(`/vp/pos/validator/consensus_key/${this.namadaAddress}`)
        .then(binary => {
          this.publicKey  = base16.encode(binary.slice(1))
        })
        .catch(e => connection.log.warn(
          `Failed to decode validator public key for ${this.namadaAddress}`
        )))
    }

    if (this.namadaAddress && !this.address) {
      connection.log.warn("consensus address when fetching all validators: not implemented")
    }

    if (options?.parallel) {
      connection.log.debug(`fetchDetails: ${requests.length} request(s) in parallel`)
    } else {
      connection.log.debug(`fetchDetails: ${requests.length} request(s) in sequence`)
    }
    await optionallyParallel(options?.parallel, requests)

    return this

  }
}

class NamadaCommissionPair {
  commissionRate!:              bigint
  maxCommissionChangePerEpoch!: bigint
  constructor (properties: Partial<NamadaCommissionPair> = {}) {
    assign(this, properties, [
      'commissionRate',
      'maxCommissionChangePerEpoch',
    ])
  }
}

export {
  NamadaPoSParameters     as Parameters,
  NamadaValidatorMetadata as ValidatorMetadata,
  NamadaValidator         as Validator,
  NamadaCommissionPair    as CommissionPair,
}

export async function getStakingParameters (connection: NamadaConnection) {
  const binary = await connection.abciQuery("/vp/pos/pos_params")
  return new NamadaPoSParameters(connection.decode.pos_parameters(binary))
}

export async function getTotalStaked (connection: NamadaConnection) {
  const binary = await connection.abciQuery("/vp/pos/total_stake")
  return decode(u64, binary)
}

export async function getValidators (
  chain: Namada,
  options: Partial<Parameters<typeof Staking.getValidators>[1]> & {
    addresses?:       string[],
    allStates?:       boolean,
    parallel?:        boolean,
    parallelDetails?: boolean,
    interval?:        number,
  } = {}
) {
  const connection = chain.getConnection()
  if (options.allStates) {
    let { addresses } = options
    addresses ??= await getValidatorAddresses(connection)
    if (options.pagination && (options.pagination as Array<number>).length !== 0) {
      if (options.pagination.length !== 2) {
        throw new Error("pagination format: [page, per_page]")
      }
      const [page, perPage] = options.pagination
      addresses = addresses.slice((page - 1)*perPage, page*perPage)
    }
    const validators = addresses.map(namadaAddress=>new NamadaValidator({
      chain,
      address: '',
      namadaAddress
    }))
    if (options.details) {
      if (options.parallel && !options.pagination) {
        throw new Error("set pagination or parallel=false, so as not to bombard the node")
      }
      const thunks = validators.map(validator=>()=>validator.fetchDetails({
        parallel: options?.parallelDetails
      }))
      if (options?.parallel) {
        connection.log.debug(`getValidators: ${thunks.length} request(s) in parallel`)
      } else {
        connection.log.debug(`getValidators: ${thunks.length} request(s) in sequence`)
      }
      await optionallyParallel(options?.parallel, thunks)
    }
    return validators
  } else {
    if (options.addresses) {
      throw new Error("addresses option is only for caching with allStates")
    }
    return Staking.getValidators(connection, {
      ...options, Validator: NamadaValidator
    }) as unknown as Promise<NamadaValidator[]>
  }
}

export async function getValidatorAddresses (connection: NamadaConnection): Promise<Address[]> {
  const binary = await connection.abciQuery("/vp/pos/validator/addresses")
  return connection.decode.addresses(binary)
}

export async function getValidatorsConsensus (connection: NamadaConnection) {
  const binary = await connection.abciQuery("/vp/pos/validator_set/consensus")
  return connection.decode.pos_validator_set(binary).sort(byBondedStake)
}

export async function getValidatorsBelowCapacity (connection: NamadaConnection) {
  const binary = await connection.abciQuery("/vp/pos/validator_set/below_capacity")
  return connection.decode.pos_validator_set(binary).sort(byBondedStake)
}

const byBondedStake = (
  a: { bondedStake: number|bigint },
  b: { bondedStake: number|bigint },
)=> (a.bondedStake > b.bondedStake) ? -1
  : (a.bondedStake < b.bondedStake) ?  1
  : 0

export async function getValidator (chain: Namada, namadaAddress: Address) {
  return await new NamadaValidator({
    chain,
    address: '',
    namadaAddress
  }).fetchDetails()
}

export async function getValidatorStake (connection: NamadaConnection, address: Address) {
  const totalStake = await connection.abciQuery(`/vp/pos/validator/stake/${address}`)
  return decode(u256, totalStake)
}

export async function getDelegations (connection: NamadaConnection, address: Address) {
  const binary = await connection.abciQuery(`/vp/pos/delegations/${address}`)
  return connection.decode.addresses(binary)
}

export async function getDelegationsAt (
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
