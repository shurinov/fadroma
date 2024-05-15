import type { ChainId } from '@fadroma/agent'
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
  decodeTxs,
  initDecoder,
} from './namada-decode'

export class Namada extends CW.Chain {

  decode = Decode

  /** Connect to Namada over one or more endpoints. */
  static async connect (
    properties: ({ url: string|URL }|{ urls: Iterable<string|URL> }) & {
      chainId?: ChainId
      decoder?: string|URL|Uint8Array
    }
  ): Promise<Namada> {
    if (properties.decoder) {
      await initDecoder(properties.decoder)
    } else {
      new CW.Console('Namada').warn(
        "You didn't provide the 'decoder' property; trying to decode Namada objects will fail."
      )
    }
    return await super.connect(properties) as Namada
  }

  /** Connect to Namada using `testnetChainId` and `testnetUrls`. */
  static testnet (properties: Parameters<typeof Namada["connect"]>[0]) {
    return this.connect({
      chainId: properties.chainId || Namada.testnetChainId,
      urls: (properties as any).url
        ? [(properties as any).url]
        : ((properties as any).urls || [...Namada.testnetUrls]),
    })
  }

  /** Default chain ID of testnet. */
  static testnetChainId = 'shielded-expedition.88f17d1d14'

  /** Default RPC endpoints for testnet. */
  static testnetUrls = new Set([
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
  override async fetchBlockImpl (parameter?: { height: number }|{ hash: string }): Promise<TX.NamadaBlock> {
    if (!this.url) {
      throw new CW.Error("Can't fetch block: missing connection URL")
    }
    if ((!parameter) || ('height' in parameter)) {
      const wantedHeight = parameter?.height || ''
      // Fetch block and results as undecoded JSON
      const [block, results] = await Promise.all([
        fetch(`${this.url}/block?height=${wantedHeight}`)
          .then(response=>response.text()),
        fetch(`${this.url}/block_results?height=${wantedHeight}`)
          .then(response=>response.text()),
      ])
      const { id, txs, header } = this.decode.block(block, results) as {
        id: string,
        txs: Partial<TX.Transaction[]>[]
        header: { height: number, time: string }
      }
      return new TX.NamadaBlock({
        chain: this.chain,
        id,
        header,
        height: header.height,
        timestamp: header.time,
        transactions: decodeTxs(txs, header.height),
        blockRaw: block,
        resultsRaw: results,
        rawTransactions: [],
      })
    } else if ('hash' in parameter) {
      throw new Error('NamadaConnection.fetchBlock({ hash }): unimplemented!')
    } else {
      throw new Error('Pass { height } or { hash }')
    }
  }
}
