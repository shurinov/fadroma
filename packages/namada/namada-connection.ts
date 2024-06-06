import type { ChainId } from '@hackbg/fadroma'
import * as CW from '@fadroma/cw'
import {
  getTotalStaked,
  getStakingParameters,
  getValidators,
  getValidatorsConsensus,
  getValidatorsBelowCapacity,
  getValidatorAddresses,
  getValidator,
  getValidatorStake,
  getDelegations,
  getDelegationsAt,
} from './namada-pos'
import {
  getGovernanceParameters,
  getProposalCount,
  getProposalInfo
} from './namada-gov'
import {
  getCurrentEpoch
} from "./namada-epoch";
import {
  getPGFParameters,
  getPGFStewards,
  getPGFFundings,
  isPGFSteward
} from "./namada-pgf"
import * as TX from './namada-tx'
import {
  Decode,
  initDecoder,
} from './namada-decode'

export class Namada extends CW.Chain {

  decode = Decode

  /** Connect to Namada over one or more endpoints. */
  static async connect (
    properties: Parameters<typeof CW.Chain["connect"]>[0] & {
      chainId?: ChainId
      decoder?: string|URL|Uint8Array
    }
  ): Promise<Namada> {
    if (properties?.decoder) {
      await initDecoder(properties.decoder)
    } else {
      new CW.Console('Namada').warn(
        "You didn't provide the 'decoder' property; trying to decode Namada objects will fail."
      )
    }
    properties ??= {} as any
    properties.bech32Prefix ??= "tnam"
    return await super.connect(properties || {}) as Namada
  }

  /** Connect to Namada using `testnetChainId` and `testnetURLs`. */
  static testnet (properties: Parameters<typeof Namada["connect"]>[0]) {
    return this.connect({
      chainId: properties?.chainId || Namada.testnetChainId,
      urls: (properties as any)?.url
        ? [(properties as any).url]
        : ((properties as any)?.urls || [...Namada.testnetURLs]),
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

  getPGFParameters () {
    return getPGFParameters(this.getConnection())
  }

  getPGFStewards () {
    return getPGFStewards(this.getConnection())
  }

  getPGFFundings () {
    return getPGFFundings(this.getConnection())
  }

  isPGFSteward (address: string) {
    return isPGFSteward(this.getConnection())
  }

  getStakingParameters () {
    return getStakingParameters(this.getConnection())
  }

  getValidatorAddresses () {
    return getValidatorAddresses(this.getConnection())
  }

  getValidator (address: string) {
    return getValidator(this, address)
  }

  getValidators (options?: {
    details?:         boolean,
    pagination?:      [number, number]
    allStates?:       boolean,
    addresses?:       string[],
    parallel?:        boolean,
    parallelDetails?: boolean,
  }) {
    return getValidators(this, options)
  }

  getValidatorsConsensus () {
    return getValidatorsConsensus(this.getConnection())
  }

  getValidatorsBelowCapacity () {
    return getValidatorsBelowCapacity(this.getConnection())
  }

  getDelegations (address: string) {
    return getDelegations(this.getConnection(), address)
  }

  getDelegationsAt (address: string, epoch?: number) {
    return getDelegationsAt(this.getConnection(), address, epoch)
  }

  getGovernanceParameters () {
    return getGovernanceParameters(this.getConnection())
  }

  getProposalCount () {
    return getProposalCount(this.getConnection())
  }

  getProposalInfo (id: number) {
    return getProposalInfo(this.getConnection(), id)
  }

  getCurrentEpoch () {
    return getCurrentEpoch(this.getConnection())
  }

  getTotalStaked () {
    return getTotalStaked(this.getConnection())
  }

  getValidatorStake (address: string) {
    return getValidatorStake(this.getConnection(), address)
  }
}

export class NamadaConnection extends CW.Connection {
  get chain (): Namada {
    return super.chain as unknown as Namada
  }
  get decode () {
    return this.chain.decode
  }
  override async fetchBlockImpl (
    parameter?: ({ height: number }|{ hash: string }) & { raw?: boolean }
  ): Promise<TX.Block> {
    if (!this.url) {
      throw new CW.Error("Can't fetch block: missing connection URL")
    }
    if ((!parameter) || ('height' in parameter)) {
      return TX.Block.fetchByHeight(
        this, parameter?.height || '', parameter?.raw
      )
    } else if ('hash' in parameter) {
      return TX.Block.fetchByHash(
        this, parameter.hash || '', parameter.raw
      )
    } else {
      throw new Error('Pass { height } or { hash }')
    }
  }
}
