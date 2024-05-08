import { SecretNetworkClient } from '@hackbg/secretjs-esm'
import { Chain, Connection, Token } from '@fadroma/agent'
import type { ChainId } from '@fadroma/agent'
import { ScrtAgent } from './scrt-identity'
import { ScrtBlock } from './scrt-tx'
import * as Bank from './scrt-bank'
import * as Compute from './scrt-compute'
import * as Staking from './scrt-staking'
import * as Governance from './scrt-governance'

export class ScrtChain extends Chain {

  declare connections: ScrtConnection[]

  get connection (): ScrtConnection {
    return super.connection as ScrtConnection
  }

  static async connect ({ chainId, urls }: {
    chainId: ChainId,
    urls:    (string|URL)[]
  }): Promise<ScrtChain> {
    return new ScrtChain({
      chainId,
      connections: urls.map(url=>new ScrtConnection({ url: url.toString() }))
    })
  }

  async authenticate (...args: unknown[]): Promise<ScrtAgent> {
    if (args.length === 0) {
      return new ScrtAgent({
        chain:    this,
        api:      new SecretNetworkClient(),
        identity: null,
      })
    }
  }

  async fetchLimits (): Promise<{ gas: number }> {
    const params = { subspace: "baseapp", key: "BlockParams" }
    const { param } = await this.api.query.params.params(params)
    let { max_bytes, max_gas } = JSON.parse(param?.value??'{}')
    this.log.debug(`Fetched default gas limit: ${max_gas} and code size limit: ${max_bytes}`)
    if (max_gas < 0) {
      max_gas = 10000000
      this.log.warn(`Chain returned negative max gas limit. Defaulting to: ${max_gas}`)
    }
    return { gas: max_gas }
  }

}

/** Represents a Secret Network API endpoint. */
export class ScrtConnection extends Connection {

  /** Underlying API client. */
  declare api: SecretNetworkClient

  /** Smallest unit of native token. */
  static gasToken = new Token.Native('uscrt')

  constructor (properties?: Partial<ScrtConnection>) {
    super(properties as Partial<Connection>)
    this.api ??= new SecretNetworkClient({ url: this.url!, chainId: this.chainId!, })
    const {chainId, url} = this
    if (!chainId) {
      throw new Error("can't authenticate without chainId")
    }
    if (!url) {
      throw new Error("can't connect without url")
    }
    this.api = new SecretNetworkClient({ chainId, url })
  }

  override async fetchBlockImpl (parameter?): Promise<ScrtBlock> {
    if (!parameter) {
      const {
        block_id: { hash, part_set_header } = {},
        block: { header, data, evidence, last_commit } = {}
      } = await this.api.query.tendermint.getLatestBlock({})
      return new ScrtBlock({
        hash:   base16.encode(hash),
        height: Number(header.height)
      })
    }
  }

  override async fetchHeightImpl () {
    const { height } = await this.fetchBlockImpl()
    return height
  }

  override async fetchBalanceImpl (
    ...args: Parameters<Connection["fetchBalanceImpl"]>
  ) {
    return await Bank.fetchBalance(this, ...args)
  }

  override async fetchCodeInfoImpl (
    ...args: Parameters<Connection["fetchCodeInfoImpl"]>
  ) {
    return await Compute.fetchCodeInfo(this, ...args)
  }

  override async fetchCodeInstancesImpl (
    ...args: Parameters<Connection["fetchCodeInstancesImpl"]>
  ) {
    return await Compute.fetchCodeInstances(this, ...args)
  }

  override async fetchContractInfoImpl (
    ...args: Parameters<Connection["fetchContractInfoImpl"]>
  ) {
    return await Compute.fetchContractInfo(this, ...args)
  }

  override async queryImpl <T> (parameters): Promise<T> {
    return await Compute.query(this, parameters) as T
  }
}