import { Core, Chain, Deploy } from '@fadroma/agent'
import type { Address, Message, CodeId, CodeHash, Token } from '@fadroma/agent'
import type { CWIdentity, CWMnemonicIdentity, CWSignerIdentity } from './cw-identity'
import { CWConsole as Console, CWError as Error } from './cw-base'
import { CWBatch }  from './cw-batch'
import * as Bank    from './cw-bank'
import * as Compute from './cw-compute'
import * as Staking from './cw-staking'
import { Amino, Proto, CosmWasmClient, SigningCosmWasmClient } from '@hackbg/cosmjs-esm'
import type { Block } from '@hackbg/cosmjs-esm'

export class CWBlock extends Chain.Block {
  rawTxs: Uint8Array[]
  constructor ({ hash, height, rawTxs }: Partial<CWBlock> = {}) {
    super({ hash, height })
    this.rawTxs = [...rawTxs||[]]
  }
}

/** Generic agent for CosmWasm-enabled chains. */
export class CWConnection extends Chain.Connection {
  /** The bech32 prefix for the account's address  */
  bech32Prefix?:    string
  /** The coin type in the HD derivation path */
  coinType?:        number
  /** The account index in the HD derivation path */
  hdAccountIndex?:  number
  /** API connects asynchronously, so API handle is a promise. */
  declare api:      Promise<CosmWasmClient>
  /** A supported method of authentication. */
  declare identity: CWMnemonicIdentity|CWSignerIdentity

  constructor (properties: Partial<CWConnection>) {
    super(properties)
    Core.assign(this, properties, [
      'coinType',
      'bech32Prefix',
      'hdAccountIndex'
    ])
    if (!this.url) {
      throw new Error('No connection URL.')
    }
    if (this.identity?.signer) {
      this.log.debug('Connecting and authenticating via', Core.bold(this.url))
      this.api = SigningCosmWasmClient.connectWithSigner(
        this.url,
        this.identity.signer
      )
    } else {
      this.log.debug('Connecting anonymously via', Core.bold(this.url))
      this.api = CosmWasmClient.connect(this.url)
    }
  }

  authenticate (identity: CWIdentity): CWAgent {
    return new CWAgent({ connection: this, identity })
  }

  batch (): Chain.Batch<this, CWAgent> {
    return new CWBatch({ connection: this }) as unknown as Chain.Batch<this, CWAgent>
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

  protected override async fetchBlockImpl (parameter?: { height: number }|{ hash: string }):
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

  protected override async fetchHeightImpl () {
    const { height } = await this.fetchBlockImpl()
    return height
  }

  /** Query native token balance. */
  protected override fetchBalanceImpl (
    ...args: Parameters<Chain.Connection["fetchBalanceImpl"]>
  ) {
    return Bank.fetchBalance(this, ...args)
  }

  protected override fetchCodeInfoImpl (
    ...args: Parameters<Chain.Connection["fetchCodeInfoImpl"]>
  ) {
    return Compute.fetchCodeInfo(this, ...args)
  }

  protected override fetchCodeInstancesImpl (
    ...args: Parameters<Chain.Connection["fetchCodeInstancesImpl"]>
  ) {
    return Compute.fetchCodeInstances(this, ...args)

  }

  protected override fetchContractInfoImpl (
    ...args: Parameters<Chain.Connection["fetchContractInfoImpl"]>
  ) {
    return Compute.fetchContractInfo(this, ...args)
  }

  protected override async queryImpl <T> (
    ...args: Parameters<Chain.Connection["queryImpl"]>
  ) {
    return await Compute.query(this, ...args) as T
  }

  fetchValidators ({ details = false }: {
    details?: boolean
  } = {}) {
    return this.tendermintClient.then(()=>Staking.getValidators(this, { details }))
  }

  fetchValidatorInfo (address: Address): Promise<unknown> {
    return Promise.all([
      this.queryClient,
      this.tendermintClient
    ]).then(()=>new Staking.Validator({ address }).fetchDetails(this))
  }
}

export class CWAgent extends Chain.Agent {
  /** API connects asynchronously, so API handle is a promise. */
  declare api: Promise<SigningCosmWasmClient>

  protected async sendImpl (...args: Parameters<Chain.Agent["sendImpl"]>) {
    return await Bank.send(this, ...args)
  }

  protected async uploadImpl (...args: Parameters<Chain.Agent["uploadImpl"]>) {
    return await Compute.upload(this, ...args)
  }

  protected async instantiateImpl (...args: Parameters<Chain.Agent["instantiateImpl"]>) {
    return await Compute.instantiate(this, ...args)
  }

  protected async executeImpl <T> (...args: Parameters<Chain.Agent["executeImpl"]>): Promise<T> {
    return await Compute.execute(this, ...args) as T
  }
}
