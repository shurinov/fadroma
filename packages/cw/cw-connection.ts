import { bold, assign, Chain, Connection, Compute } from '@fadroma/agent'
import type { Address, Message, CodeId, CodeHash, Token } from '@fadroma/agent'
import { CWAgent } from './cw-identity'
import type { CWIdentity, CWMnemonicIdentity, CWSignerIdentity } from './cw-identity'
import { CWConsole as Console, CWError as Error } from './cw-base'
import { CWBlock, CWBatch } from './cw-tx'
import * as CWBank    from './cw-bank'
import * as CWCompute from './cw-compute'
import * as CWStaking from './cw-staking'
import { Amino, Proto, CosmWasmClient, SigningCosmWasmClient } from '@hackbg/cosmjs-esm'
import type { Block } from '@hackbg/cosmjs-esm'

export class CWChain extends Chain {
  constructor (properties: Partial<CWChain> = {}) {
    super(properties)
    assign(this, properties, [
      'coinType',
      'bech32Prefix',
      'hdAccountIndex'
    ])
  }
  /** The bech32 prefix for the account's address  */
  bech32Prefix?:    string
  /** The coin type in the HD derivation path */
  coinType?:        number
  /** The account index in the HD derivation path */
  hdAccountIndex?:  number
}

/** Generic agent for CosmWasm-enabled chains. */
export class CWConnection extends Connection {
  /** API connects asynchronously, so API handle is a promise. */
  declare api:      CosmWasmClient

  constructor (properties: Partial<CWConnection>) {
    super(properties)
    assign(this, properties, [
      'api',
    ])
    //if (!this.url) {
      //throw new Error('No connection URL.')
    //}
    //if (this.identity?.signer) {
      //this.log.debug('Connecting and authenticating via', bold(this.url))
      //this.api = SigningCosmWasmClient.connectWithSigner(
        //this.url,
        //this.identity.signer
      //)
    //} else {
      //this.log.debug('Connecting anonymously via', bold(this.url))
      //this.api = CosmWasmClient.connect(this.url)
    //}
  }

  override authenticate (identity: CWIdentity): CWAgent {
    return new CWAgent({ connection: this, identity })
  }

  /** Handle to the API's internal query client. */
  get queryClient (): Promise<ReturnType<CosmWasmClient["getQueryClient"]>> {
    return Promise.resolve(this.api).then(api=>(api as any)?.queryClient)
  }

  /** Handle to the API's internal Tendermint transaction client. */
  get tendermintClient (): Promise<ReturnType<CosmWasmClient["getTmClient"]>> {
    return Promise.resolve(this.api).then(api=>(api as any)?.tmClient)
  }

  abciQuery (path, params = new Uint8Array()) {
    return this.queryClient.then(async client=>{
      this.log.debug('ABCI query:', path)
      const { value } = await client!.queryAbci(path, params)
      return value
    })
  }

  async fetchBlockImpl (parameter?: { height: number }|{ hash: string }):
    Promise<CWBlock>
  {
    const api = await this.api
    if ((parameter as { height })?.height) {
      const { id, header, txs } = await api.getBlock((parameter as { height }).height)
      return new CWBlock({
        hash:   id,
        height: header.height,
        rawTxs: txs as Uint8Array[],
      })
    } else if ((parameter as { hash })?.hash) {
      throw new Error('CWConnection.fetchBlock({ hash }): unimplemented!')
    } else {
      const { id, header, txs } = await api.getBlock()
      return new CWBlock({
        hash:   id,
        height: header.height,
        rawTxs: txs as Uint8Array[],
      })
    }
  }

  async fetchHeightImpl () {
    const { height } = await this.fetchBlockImpl()
    return height
  }

  /** Query native token balance. */
  fetchBalanceImpl (...args: Parameters<Connection["fetchBalanceImpl"]>) {
    return CWBank.fetchBalance(this, ...args)
  }

  fetchCodeInfoImpl (...args: Parameters<Connection["fetchCodeInfoImpl"]>) {
    return CWCompute.fetchCodeInfo(this, ...args)
  }

  fetchCodeInstancesImpl (...args: Parameters<Connection["fetchCodeInstancesImpl"]>) {
    return CWCompute.fetchCodeInstances(this, ...args)

  }

  fetchContractInfoImpl (...args: Parameters<Connection["fetchContractInfoImpl"]>) {
    return CWCompute.fetchContractInfo(this, ...args)
  }

  override async queryImpl <T> (
    ...args: Parameters<Connection["queryImpl"]>
  ) {
    return await CWCompute.query(this, ...args) as T
  }

  fetchValidators ({ details = false }: {
    details?: boolean
  } = {}) {
    return this.tendermintClient.then(()=>CWStaking.getValidators(this, { details }))
  }

  fetchValidatorInfo (address: Address): Promise<unknown> {
    return Promise.all([
      this.queryClient,
      this.tendermintClient
    ]).then(()=>new CWStaking.Validator({ address }).fetchDetails(this))
  }
}
