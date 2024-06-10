import * as CW from '@fadroma/cw'
import type { ChainId } from '@hackbg/fadroma'
import NamadaConnection from './NamadaConnection'
import { Decode, initDecoder } from './NamadaDecode'

export default class NamadaChain extends CW.Chain {
  decode = Decode

  /** Connect to Namada over one or more endpoints. */
  static async connect (
    properties: Parameters<typeof CW.Chain["connect"]>[0] & {
      chainId?: ChainId
      decoder?: string|URL|Uint8Array
    }
  ): Promise<NamadaChain> {
    if (properties?.decoder) {
      await initDecoder(properties.decoder)
    } else {
      new CW.Console('@fadroma/namada').warn(
        "Decoder binary not provided; trying to decode Namada objects will fail."
      )
    }
    properties ??= {} as any
    properties.bech32Prefix ??= "tnam"
    return await super.connect(properties || ({} as any)) as NamadaChain
  }

  /** Connect to Namada using `testnetChainId` and `testnetURLs`. */
  static testnet (properties: Parameters<typeof NamadaChain["connect"]>[0]) {
    return this.connect({
      chainId: properties?.chainId || NamadaChain.testnetChainId,
      urls: (properties as any)?.url
        ? [(properties as any).url]
        : ((properties as any)?.urls || [...NamadaChain.testnetURLs]),
    })
  }

  /** Default chain ID of testnet. */
  static testnetChainId = 'shielded-expedition.88f17d1d14'

  /** Default RPC endpoints for testnet. */
  static testnetURLs = new Set([
    'https://namada-testnet-rpc.itrocket.net',
    'https://namada-rpc.stake-machine.com',
    'https://namadarpc.songfi.xyz',
    'https://rpc.testnet.one',
  ])

  static get Connection () {
    return NamadaConnection
  }

  getConnection (): NamadaConnection {
    return this.connections[0] as NamadaConnection
  }

  authenticate (...args: unknown[]): never {
    throw new Error('Transacting on Namada is currently not supported.')
  }

  fetchPGFParameters () {
    return this.getConnection().fetchPGFParametersImpl()
  }

  fetchPGFStewards () {
    return this.getConnection().fetchPGFStewardsImpl()
  }

  fetchPGFFundings () {
    return this.getConnection().fetchPGFFundingsImpl()
  }

  isPGFSteward (address: string) {
    return this.getConnection().isPGFStewardImpl(address)
  }

  fetchStakingParameters () {
    return this.getConnection().fetchStakingParametersImpl()
  }

  fetchValidatorAddresses () {
    return this.getConnection().fetchValidatorAddressesImpl()
  }

  fetchValidator (address: string) {
    return this.getConnection().fetchValidatorImpl(address)
  }

  fetchValidators (options?: {
    details?:         boolean,
    pagination?:      [number, number]
    allStates?:       boolean,
    addresses?:       string[],
    parallel?:        boolean,
    parallelDetails?: boolean,
  }) {
    return this.getConnection().fetchValidators(options)
  }

  fetchValidatorsConsensus () {
    return this.getConnection().fetchValidatorsConsensusImpl()
  }

  fetchValidatorsBelowCapacity () {
    return this.getConnection().fetchValidatorsBelowCapacityImpl()
  }

  fetchDelegations (address: string) {
    return this.getConnection().fetchDelegationsImpl(address)
  }

  fetchDelegationsAt (address: string, epoch?: number) {
    return this.getConnection().fetchDelegationsAtImpl(address, epoch)
  }

  fetchGovernanceParameters () {
    return this.getConnection().fetchGovernanceParametersImpl()
  }

  fetchProposalCount () {
    return this.getConnection().fetchProposalCountImpl()
  }

  fetchProposalInfo (id: number) {
    return this.getConnection().fetchProposalInfoImpl(id)
  }

  fetchCurrentEpoch () {
    return this.getConnection().fetchCurrentEpochImpl()
  }

  fetchTotalStaked () {
    return this.getConnection().fetchTotalStakedImpl()
  }

  fetchValidatorStake (address: string) {
    return this.getConnection().fetchValidatorStakeImpl(address)
  }
}
