import type { Address } from '@hackbg/fadroma'
import { Console, assign, base16, optionallyParallel} from '@hackbg/fadroma'
import { Staking } from '@fadroma/cw'
import { decode, u8, u64, u256, array, set } from '@hackbg/borshest'
import type { Chain as Namada, Connection as NamadaConnection } from './Namada'
import type { Epoch } from './NamadaEpoch'

export type Params = Awaited<ReturnType<typeof fetchStakingParameters>>

/** Fetch staking parameters. */
export async function fetchStakingParameters (
  connection: NamadaConnection
) {
  const binary = await connection.abciQuery("/vp/pos/pos_params")
  return connection.decode.pos_parameters(binary)
}

/** Fetch total staked NAMNAM. */
export async function fetchTotalStaked (
  connection: NamadaConnection, epoch?: number|bigint|string
) {
  let query = "/vp/pos/total_stake"
  if (epoch!==undefined) query += `/${epoch}`
  const binary = await connection.abciQuery(query)
  return decode(u64, binary)
}

/** Fetch all delegations. */
export async function fetchDelegations (connection: NamadaConnection, address: Address) {
  const binary = await connection.abciQuery(`/vp/pos/delegations/${address}`)
  return connection.decode.addresses(binary)
}

/** Fetch delegations at given address. */
export async function fetchDelegationsAt (
  connection: NamadaConnection,
  address:    Address,
  epoch?:     Epoch
): Promise<Record<string, bigint>> {
  let query = `/vp/pos/delegations_at/${address}`
  epoch = Number(epoch)
  if (!isNaN(epoch)) {
    query += `/${epoch}`
  }
  const binary = await connection.abciQuery(query)
  return connection.decode.address_to_amount(binary) as Record<string, bigint>
}

/** Fetch bond with slashing for a given validator and delegator. */
export async function fetchBondWithSlashing (
  connection: NamadaConnection,
  validator:  Address,
  delegator:  Address,
  epoch?:     number|bigint|string
) {
  let query = `/vp/pos/bond_with_slashing/${validator}/${delegator}`
  if (epoch) query += `/${epoch}`
  const totalStake = await connection.abciQuery(query)
  return decode(u256, totalStake)
}

/** Fetch addresses of all known validators. */
export async function fetchValidatorAddresses (
  connection: NamadaConnection, epoch?: Epoch
): Promise<Address[]> {
  let query = "/vp/pos/validator/addresses"
  if (epoch!==undefined) query += `/${epoch}`
  const binary = await connection.abciQuery(query)
  return connection.decode.addresses(binary)
}

/** Fetch info about the set of validators currently participating in consensus. */
export async function fetchValidatorsConsensus (
  connection: NamadaConnection, epoch?: Epoch
) {
  let query = "/vp/pos/validator_set/consensus"
  if (epoch!==undefined) query += `/${epoch}`
  const binary = await connection.abciQuery(query)
  return connection.decode.pos_validator_set(binary).sort(byBondedStake)
}

/** Fetch info about the set of validators currently below capacity. */
export async function fetchValidatorsBelowCapacity (
  connection: NamadaConnection, epoch?: Epoch
) {
  let query = "/vp/pos/validator_set/below_capacity"
  if (epoch!==undefined) query += `/${epoch}`
  const binary = await connection.abciQuery(query)
  return connection.decode.pos_validator_set(binary).sort(byBondedStake)
}

/** Sorting function by the bondedStake parameter. */
const byBondedStake = (a: {bondedStake: number|bigint}, b: {bondedStake: number|bigint})=>
  (BigInt(a.bondedStake) > BigInt(b.bondedStake)) ? -1
    : (BigInt(a.bondedStake) < BigInt(b.bondedStake)) ?  1
    : 0

/** Fetch details about one validator. */
export async function fetchValidator (
  connection: NamadaConnection, namadaAddress: Address, options?: { epoch?: Epoch }
) {
  const base = { chain: connection.chain, address: null as any, namadaAddress }
  return await new NamadaValidator(base).fetchDetails(options)
}

/** Describes a Namada validator. */
class NamadaValidator extends Staking.Validator {
  constructor (properties: Omit<ConstructorParameters<typeof Staking.Validator>[0], 'chain'> & {
    chain: Namada, namadaAddress?: string,
  }) {
    super(properties)
    this.namadaAddress = properties.namadaAddress
  }
  get chain (): Namada { return super.chain as unknown as Namada }
  namadaAddress?: Address
  metadata?:      NamadaValidatorMetadata
  commission?:    NamadaValidatorCommission
  state?:         NamadaValidatorState
  stake?:         bigint
  bondedStake?:   bigint|number
  async fetchDetails (options?: { epoch?: Epoch, parallel?: boolean }) {
    await fetchValidatorDetails(this.chain.getConnection(), {
      ...options,
      validator: this
    })
    return this
  }
}

/** Describes the metadata of a Namada validator. */
type NamadaValidatorMetadata = {
  name?:          string
  email?:         string
  description?:   string|null
  website?:       string|null
  discordHandle?: string|null
  avatar?:        string|null
}

/** Describes the commission rate of a Namada validator. */
type NamadaValidatorCommission = {
  commissionRate?:              bigint
  maxCommissionChangePerEpoch?: bigint
}

/** Describes the current state of a Namada validator. */
type NamadaValidatorState = {
  state?: string,
  epoch?: bigint,
}

/** Fetch the stake of a given validator. */
export async function fetchValidatorStake (
  connection: NamadaConnection,
  address:    Address,
  epoch?:     number|bigint|string
) {
  let query = `/vp/pos/validator/stake/${address}`
  if (epoch) query += `/${epoch}`
  const totalStake = await connection.abciQuery(query)
  if (totalStake[0] === 0) return 0
  return decode(u256, totalStake.slice(1))
}

/** Fetch details for a Namada validator. */
export async function fetchValidatorDetails (connection: NamadaConnection, options?: {
  epoch?:     Epoch,
  parallel?:  boolean,
  validator?: Partial<NamadaValidator>
}) {
  const { epoch, validator = {}, parallel = false } = options || {}
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
    (e: Error) => {
      connection.log.warn(...args)
      return null
    }
  const requests: Array<()=>Promise<unknown>> = [
    () => connection.abciQuery(`/vp/pos/validator/metadata/${v}`)
      .then(binary =>binary[0] && (validator.metadata = connection.decode.pos_validator_metadata(binary.slice(1))))
      .catch(warn(`Failed to provide validator metadata for ${v}`)),
    () => connection.abciQuery(`/vp/pos/validator/commission/${v}`)
      .then(binary => validator.commission = connection.decode.pos_commission_pair(binary))
      .catch(warn(`Failed to provide validator commission pair for ${v}`)),
    () => connection.abciQuery(`/vp/pos/validator/state/${v}` + (epoch?`/${epoch}`:''))
      .then(binary => validator.state = connection.decode.pos_validator_state(binary))
      .catch(warn(`Failed to provide validator state for ${v}`)),
    () => connection.abciQuery(`/vp/pos/validator/stake/${v}` + (epoch?`/${epoch}`:''))
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

export async function fetchValidators (
  connection: NamadaConnection,
  options: Partial<Parameters<typeof Staking.getValidators>[1]> & {
    epoch?:              Epoch
    tendermintMetadata?: 'parallel'|'sequential'|boolean
    namadaMetadata?:     'parallel'|'sequential'|boolean
  } = {}
): Promise<NamadaValidator[]> {
  // This will be the return value: map of Namada address to validator details object.
  const validatorsByNamadaAddress: Record<string, NamadaValidator> = {}
  // This is the full list of validators known to the chain.
  // However, it contains no other data than the identifier.
  // The rest we will have to piece together ourselves.
  const namadaAddresses = await fetchValidatorAddresses(connection, options?.epoch)
  for (const namadaAddress of namadaAddresses) {
    validatorsByNamadaAddress[namadaAddress] = new NamadaValidator({
      chain:     connection.chain,
      publicKey: null as any, // FIXME: explicitly state nullability
      address:   null as any, // FIXME: in the type definition
      namadaAddress
    })
  }
  // This is how we will store the public keys. This needs to be done only once,
  // either when fetching Tendermint metadata or when fetching Namada metadata.
  // The public keys corresponding to each Namada address have to be ABCI-queries,
  // one by one. Doing this in parallel can crash the nodes. There's an option to
  // avoid that, but IMHO it should be fixed upstream. On our side, an improvement
  // to this would constitute a rate limiter, allowing a precise number of parallel
  // requests to be specified.
  let publicKeys: Record<string, string>|null = null
  const fetchAndPopulatePublicKeys = async (parallel = false) => Object.fromEntries(
    await optionallyParallel(parallel, namadaAddresses.map(addr => async () => {
      const binary = await connection.abciQuery(`/vp/pos/validator/consensus_key/${addr}`)
      const publicKey = base16.encode(binary.slice(2))
      validatorsByNamadaAddress[addr].publicKey = publicKey
      return [addr, publicKey]
    })))
  // This will fetch the generic "list of all validators" metadata, which is provided by
  // Namada's Tendermint core, and is therefore not behind an ABCI query. It contains
  // consensus address, public key, voting power, and proposer priority. However,
  // it only contains those validators which are currently active (state = consensus).
  // Other validators don't have these values, and if you need to e.g. cross-reference
  // by past public key or consensus address, you will have to persist them yourself.
  // (https://github.com/hackbg/undexer does that)
  let tendermintMetadata: TendermintMetadata = {}
  if (options?.tendermintMetadata ?? true) {
    publicKeys ??= await fetchAndPopulatePublicKeys(options.tendermintMetadata === 'parallel')
    tendermintMetadata = (await Staking.getValidators(connection, { ...options||{} }))
      // `getValidators` returns an array, so we rekey it by public key.
      // (Identifier rebinding would have been really nice here.)
      .reduce((vs, v)=>Object.assign(vs, {[v.publicKey]: v}), {}) as Record<string, {
        address:          string,
        publicKey:        string,
        votingPower:      bigint,
        proposerPriority: bigint,
      }>
    // Now we can populate the validators with the Tendermint metadata corresponding to
    // each validator's public key.
    for (const [namadaAddress, validator] of Object.entries(validatorsByNamadaAddress)) {
      if (validator.publicKey) {
        const publicKey = validator.publicKey
        const validatorTendermintMetadata = tendermintMetadata[validator.publicKey]
        if (validatorTendermintMetadata) {
          validator.address          = tendermintMetadata[validator.publicKey].address
          validator.publicKey        = tendermintMetadata[validator.publicKey].publicKey
          validator.votingPower      = tendermintMetadata[validator.publicKey].votingPower
          validator.proposerPriority = tendermintMetadata[validator.publicKey].proposerPriority
        } else {
          connection.log.info(
            'Missing metadata for validator with public key',
            publicKey,
            ' - this is usually fine and means validator is outside consensus'
          )
        }
      } else {
        connection.log.warn(
          'Missing publicKey for validator with address',
          namadaAddress,
          ' - this should not happen and means something is failing.'
        )
      }
    }
  }
  // This will fetch the Namada-specific metadata. It persists for validators even when they
  // leave consensus. However, it's spread between multiple ABCI queries. Sending 4-5x queries
  // per validator, all at once, is a good way to crash underprovisioned nodes.
  if (options?.namadaMetadata ?? true) {
    publicKeys ??= await fetchAndPopulatePublicKeys(options.namadaMetadata === 'parallel')
    // Since this adds up to a *lot* of requests, the parallel/sequential switch only determines
    // whether to do each validator's group of 5 requests simultaneously or sequentially; and
    // iteration over all validators is always sequential.
    for (const validator of Object.values(validatorsByNamadaAddress)) {
      await optionallyParallel(options.namadaMetadata === 'parallel', getRequests(
        connection, tendermintMetadata, validator, validator.namadaAddress!, options?.epoch
      ))
    }
  }
  return Object.values(validatorsByNamadaAddress)
}

type TendermintMetadata = Record<string, {
  address: string, publicKey: string, votingPower: bigint, proposerPriority: bigint
}>

/** Generator implementation of fetchValidators. */
export async function * fetchValidatorsIter (connection: NamadaConnection, options?: {
  epoch?:     Epoch,
  parallel?:  boolean,
  addresses?: string[]
}) {
  const { addresses = [], epoch, parallel = false } = options || {}
  const namadaAddresses = addresses?.length
    ? addresses
    : await fetchValidatorAddresses(connection, epoch)
  const meta: TendermintMetadata = (await Staking.getValidators(connection)).reduce(
    (vs, v)=>Object.assign(vs, {[v.publicKey]: v}), {}
  )
  for (const namadaAddress of namadaAddresses) {
    const validator = new NamadaValidator({
      chain:         connection.chain,
      publicKey:     null as any, // FIXME: explicitly state nullability
      address:       null as any, // FIXME: in the type definition
      namadaAddress
    })
    const requests = getRequests(connection, meta, validator, namadaAddress, options?.epoch)
    await optionallyParallel(parallel, requests)
    yield validator
  }
}

/** Generate full ABCI queries with decoding and error handling for fetching each field
  * of data about a validator (metadata, state, stake, commmission, consensus key) but
  * do not launch the requests yet. */
const getRequests = (
  connection: NamadaConnection,
  meta:       TendermintMetadata,
  validator:  NamadaValidator,
  address:    Address,
  epoch?:     Epoch,
) => {
  const { warnMetadata, warnCommission, warnState, warnStake, warnConsensusKey } =
    getWarnings(connection, address, epoch)
  const { metadataPath, commissionPath, statePath, stakePath, consensusKeyPath } =
    getAbciQueryPaths(address, epoch)
  const { decodeMetadata, decodeCommission, decodeState, decodeStake, decodePublicKey } =
    getDecoders(connection, validator, meta)
  const requests: Array<()=>Promise<unknown>> = [
    () => connection.abciQuery(metadataPath).then(decodeMetadata).catch(warnMetadata),
    () => connection.abciQuery(commissionPath).then(decodeCommission).catch(warnCommission),
    () => connection.abciQuery(statePath).then(decodeState).catch(warnState),
    () => connection.abciQuery(stakePath).then(decodeStake).catch(warnStake),
    () => connection.abciQuery(consensusKeyPath).then(decodePublicKey).catch(warnConsensusKey),
  ]
  return requests
}

/** Generates a warning handler for each request. */
const getWarnings = (connection: NamadaConnection, address: Address, epoch?: Epoch) => {
  const warn = (msg: string) => (_: Error) => {
    if (!isNaN(epoch as number)) msg += ` for epoch ${epoch}`
    connection.log.warn(`${address}:`, msg)
    return null
  }
  const warnMetadata     = warn(`Failed to provide validator metadata`)
  const warnCommission   = warn(`Failed to provide validator commission pair`)
  const warnState        = warn(`Failed to provide validator state`)
  const warnStake        = warn(`Failed to provide validator stake`)
  const warnConsensusKey = warn(`Failed to decode validator public key`)
  return { warnMetadata, warnCommission, warnState, warnStake, warnConsensusKey }
}

const getAbciQueryPaths = (address: Address, epoch?: Epoch) => {
  const consensusKeyPath = `/vp/pos/validator/consensus_key/${address}`
  const metadataPath     = `/vp/pos/validator/metadata/${address}`
  let commissionPath = `/vp/pos/validator/commission/${address}`
  let statePath      = `/vp/pos/validator/state/${address}`
  let stakePath      = `/vp/pos/validator/stake/${address}`
  if (!isNaN(epoch as number)) {
    const epochSuffix = `/${epoch}`
    commissionPath += epochSuffix
    statePath      += epochSuffix
    stakePath      += epochSuffix
  }
  return { metadataPath, commissionPath, statePath, stakePath, consensusKeyPath }
}

const getDecoders = (
  connection:         NamadaConnection,
  validator:          NamadaValidator,
  tendermintMetadata: TendermintMetadata
) => {
  const decodeMetadata = (binary: Uint8Array) =>
    binary[0] && (validator.metadata = connection.decode.pos_validator_metadata(binary.slice(1)))
  const decodeCommission = (binary: Uint8Array) =>
    validator.commission = connection.decode.pos_commission_pair(binary)
  const decodeState = (binary: Uint8Array) =>
    validator.state = connection.decode.pos_validator_state(binary)
  const decodeStake = (binary: Uint8Array) =>
    binary[0] && (validator.stake = decode(u256, binary.slice(1)))
  const decodePublicKey = (binary: Uint8Array) => {
    validator.publicKey = base16.encode(binary.slice(2))
    Object.assign(validator, tendermintMetadata[validator.publicKey] || {})
  }
  return { decodeMetadata, decodeCommission, decodeState, decodeStake, decodePublicKey }
}

export {
  NamadaValidator as Validator
}
export type {
  NamadaValidatorMetadata   as ValidatorMetadata,
  NamadaValidatorCommission as ValidatorCommission,
  NamadaValidatorState      as ValidatorState,
}
