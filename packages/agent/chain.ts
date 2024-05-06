/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import { ContractInstance } from './deploy'
import {
  Console, Error,
  Logged, colors, bold, randomColor,
  assign, hideProperties, into, timed
} from './core'
import type { Address, Identity } from './identity'
import * as Code from './program'
import * as Deploy from './deploy'
import * as Token from './token'
import * as Store from './store'
import { Batch } from './tx'
import type { Transaction } from './tx'

import { CompiledCode } from './program.browser'
/** The `CompiledCode` class has an alternate implementation for non-browser environments.
  * This is because Next.js tries to parse the dynamic `import('node:...')` calls used by
  * the `fetch` methods. (Which were made dynamic exactly to avoid such a dual-implementation
  * situation in the first place - but Next is smart and adds a problem where there isn't one.)
  * So, it defaults to the version that can only fetch from URL using the global fetch method;
  * but the non-browser entrypoint substitutes `CompiledCode` in `_$_HACK_$_` with the
  * version which can also load code from disk (`LocalCompiledCode`). Ugh. */
export const _$_HACK_$_ = { CompiledCode }

export * from './identity'
export * from './tx'

/** A chain ID. */
export type ChainId = string

/** A contract's full unique on-chain label. */
export type Label = string

/** A transaction message that can be sent to a contract. */
export type Message = string|Record<string, unknown>

/** A transaction hash, uniquely identifying an executed transaction on a chain. */
export type TxHash = string

/** Represents the backend of an [`Endpoint`](#abstract-class-endpoint), managed by us,
  * such as:
  *
  *   * Local devnet RPC endpoint.
  *   * Stub/mock implementation of chain.
  *
  * You shouldn't need to instantiate this class directly.
  * Instead, see `Connection`, `Devnet`, and their subclasses. */
export abstract class Backend extends Logged {
  /** The chain ID that will be passed to the devnet node. */
  chainId?:  ChainId
  /** Denomination of base gas token for this chain. */
  gasToken?: Token.Native

  constructor (properties?: Partial<Backend>) {
    super(properties)
    assign(this, properties, ["chainId"])
  }

  abstract connect ():
    Promise<Connection>
  abstract connect (name: string):
    Promise<Agent>
  abstract connect (identity: Partial<Identity>):
    Promise<Agent>

  abstract getIdentity (name: string):
    Promise<{ address?: Address, mnemonic?: string }>
}

/** Represents a remote API endpoint.
  *
  * You shouldn't need to instantiate this class directly.
  * Instead, see [`Connection`](#abstract-class-connection) and its subclasses. */
export abstract class Endpoint extends Logged {
  /** Chain ID. This is a string that uniquely identifies a chain.
    * A project's mainnet and testnet have different chain IDs. */
  chainId?: ChainId
  /** Connection URL.
    *
    * The same chain may be accessible via different endpoints, so
    * this property contains the URL to which requests are sent. */
  url?: string
  /** Instance of platform SDK. This must be provided in a subclass.
    *
    * Since most chain SDKs initialize asynchronously, this is usually a `Promise`
    * that resolves to an instance of the underlying client class (e.g. `CosmWasmClient` or `SecretNetworkClient`).
    *
    * Since transaction and query methods are always asynchronous as well, well-behaved
    * implementations of Fadroma Agent begin each method that talks to the chain with
    * e.g. `const { api } = await this.api`, making sure an initialized platform SDK instance
    * is available. */
  api?: unknown
  /** Setting this to false stops retries. */
  alive: boolean = true

  constructor (properties: Partial<Endpoint> = {}) {
    super(properties)
    assign(this, properties, ['chainId', 'alive', 'url', 'api'])
    this.log.label = [
      this.constructor.name,
      '(',
      this[Symbol.toStringTag] ? `(${bold(this[Symbol.toStringTag])})` : null,
      ')'
    ].filter(Boolean).join('')
  }

  get [Symbol.toStringTag] () {
    let tag = ''
    if (this.chainId) {
      tag = colors.bgHex(randomColor({ luminosity: 'dark', seed: this.chainId })).whiteBright(this.chainId)
    }
    return tag
  }
}

/** Represents a connection to a blockchain via a given endpoint.
  * * Use one of its subclasses in `@fadroma/scrt`, `@fadroma/cw`, `@fadroma/namada`
  * to connect to the corresponding chain.
  * * Or, extend this class to implement
  * support for new kinds of blockchains. */
export abstract class Connection extends Endpoint {
  /** Native token of chain. */
  static gasToken: Token.Native = new Token.Native('')
  /** Native token of chain. */
  static gas (amount: number|Token.Uint128): Token.Amount {
    return this.gasToken.amount(String(amount))
  }
  /** Chain mode. */
  mode?: 'Mainnet'|'Testnet'|'Devnet'|'Mocknet'

  constructor (properties: Partial<Connection> = {}) {
    super(properties)
    assign(this, properties, ['mode'])

    this.log.label = new.target.constructor.name
    const chainColor = randomColor({ // url takes priority in determining color
      luminosity: 'dark', seed: this.chainId||this.url
    })
    this.log.label = colors.bgHex(chainColor).whiteBright(` ${this.chainId||this.url} `)

    //if ((this.identity && (this.identity.name||this.identity.address))) {
      //const identityColor = randomColor({ // address takes priority in determining color
        //luminosity: 'dark', seed: this.identity.address||this.identity.name
      //})
      //this.log.label += ' '
      //this.log.label += colors.bgHex(identityColor).whiteBright(
        //` ${this.identity.name||this.identity.address} `
      //)
    //}
  }

  get [Symbol.toStringTag] () {
    let tag = super[Symbol.toStringTag]
    //if ((this.identity && (this.identity.name||this.identity.address))) {
      //let myTag = `${this.identity.name||this.identity.address}`
      //const myColor = randomColor({ luminosity: 'dark', seed: myTag })
      //myTag = colors.bgHex(myColor).whiteBright.bold(myTag)
      //tag = [tag, myTag].filter(Boolean).join(':')
    //}
    return tag
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////

  abstract authenticate (identity: Identity): Agent

  /** Construct a transaction batch. */
  batch (): Batch<Connection, Agent> {
    return new Batch({ connection: this })
  }

  /// FETCH BLOCK ///

  /** Get info about the latest block. */
  fetchBlock (): Promise<Block>
  /** Get info about the block with a specific height. */
  fetchBlock ({ height }: { height: number }): Promise<Block>
  /** Get info about the block with a specific hash. */
  fetchBlock ({ hash }: { hash: string }): Promise<Block>

  fetchBlock (...args: unknown[]): Promise<Block> {
    if (args[0]) {
      if (typeof args[0] === 'object') {
        if ('height' in args[0]) {
          this.log.debug(`Querying block by height ${args[0].height}`)
          return this.fetchBlockImpl({ height: args[0].height as number })
        } else if ('hash' in args[0]) {
          this.log.debug(`Querying block by hash ${args[0].hash}`)
          return this.fetchBlockImpl({ hash: args[0].hash as string })
        }
      } else {
        throw new Error('Invalid arguments, pass {height:number} or {hash:string}')
      }
    } else {
      this.log.debug(`Querying latest block`)
      return this.fetchBlockImpl()
    }
  }
  protected abstract fetchBlockImpl (parameters?: { height: number }|{ hash: string }):
    Promise<Block>

  /** Get the current block height. */
  get height (): Promise<number> {
    this.log.debug('Querying block height')
    return this.fetchHeightImpl()
  }
  protected abstract fetchHeightImpl ():
    Promise<number>

  /** Time to ping for next block. */
  blockInterval = 250

  /** Wait until the block height increments, or until `this.alive` is set to false. */
  get nextBlock (): Promise<number> {
    return this.height.then(async startingHeight=>{
      startingHeight = Number(startingHeight)
      if (isNaN(startingHeight)) {
        this.log.warn('Current block height undetermined. Not waiting for next block')
        return Promise.resolve(NaN)
      }
      this.log.log(
        `Waiting for block > ${bold(String(startingHeight))}`,
        `(polling every ${this.blockInterval}ms)`
      )
      const t = + new Date()
      return new Promise(async (resolve, reject)=>{
        try {
          while (this.alive) {
            await new Promise(ok=>setTimeout(ok, this.blockInterval))
            this.log(
              `Waiting for block > ${bold(String(startingHeight))} ` +
              `(${((+ new Date() - t)/1000).toFixed(3)}s elapsed)`
            )
            const height = await this.height
            if (height > startingHeight) {
              this.log.log(`Block height incremented to ${bold(String(height))}, proceeding`)
              return resolve(height as number)
            }
          }
          throw new Error('endpoint dead, not waiting for next block')
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  /// FETCH BALANCE ///

  /** The default gas token of the chain. */
  get defaultDenom (): string {
    return (this.constructor as Function & {gasToken: Token.Native}).gasToken?.id
  }

  /** Fetch balance of 1 or many addresses in 1 or many native tokens. */
  fetchBalance (address: Address, token: string):
    Promise<Token.Uint128>
  fetchBalance (address: Address, tokens?: string[]):
    Promise<Record<string, Token.Uint128>>
  fetchBalance (addresses: Address[], token: string):
    Promise<Record<Address, Token.Uint128>>
  fetchBalance (addresses: Address[], tokens?: string):
    Promise<Record<Address, Record<string, Token.Uint128>>>
  async fetchBalance (...args: unknown[]): Promise<unknown> {
    throw new Error('unimplemented!')

    //[>* Get balance of current identity in main token. <]
    //get balance () {
      //if (!this.identity?.address) {
        //throw new Error('not authenticated, use .getBalance(token, address)')
      //} else if (!this.defaultDenom) {
        //throw new Error('no default token for this chain, use .getBalance(token, address)')
      //} else {
        //return this.getBalanceOf(this.identity.address)
      //}
    //}

    /** Get the balance in a native token of a given address,
      * either in this connection's gas token,
      * or in another given token. */
    //getBalanceOf (address: Address|{ address: Address }, token?: string) {
      //if (!address) {
        //throw new Error('pass (address, token?) to getBalanceOf')
      //}
      //token ??= this.defaultDenom
      //if (!token) {
        //throw new Error('no token for balance query')
      //}
      //const addr = (typeof address === 'string') ? address : address.address
      //if (addr === this.identity?.address) {
        //this.log.debug('Querying', bold(token), 'balance')
      //} else {
        //this.log.debug('Querying', bold(token), 'balance of', bold(addr))
      //}
      //return timed(
        //this.doGetBalance.bind(this, token, addr),
        //({ elapsed, result }) => this.log.debug(
          //`Queried in ${elapsed}s: ${bold(address)} has ${bold(result)} ${token}`
        //)
      //)
    //}

    /** Get the balance in a given native token, of
      * either this connection's identity's address,
      * or of another given address. */
    //getBalanceIn (token: string, address?: Address|{ address: Address }) {
      //if (!token) {
        //throw new Error('pass (token, address?) to getBalanceIn')
      //}
      //address ??= this.identity?.address
      //if (!address) {
        //throw new Error('no address for balance query')
      //}
      //const addr = (typeof address === 'string') ? address : address.address
      //if (addr === this.identity?.address) {
        //this.log.debug('Querying', bold(token), 'balance')
      //} else {
        //this.log.debug('Querying', bold(token), 'balance of', bold(addr))
      //}
      //return timed(
        //this.doGetBalance.bind(this, token, addr),
        //({ elapsed, result }) => this.log.debug(
          //`Queried in ${elapsed}s: balance of ${bold(address)} is ${bold(result)}`
        //)
      //)
    //}
  }
  protected abstract fetchBalanceImpl (parameters: { token?: string, address?: string }):
    Promise<string|number|bigint>

  /// FETCH CODE INFO ///

  /** Fetch info about all code IDs uploaded to the chain. */
  fetchCodeInfo ():
    Promise<Record<Deploy.CodeId, Deploy.UploadedCode>>
  /** Fetch info about a single code ID. */
  fetchCodeInfo (codeId: Deploy.CodeId, options: { parallel?: boolean }):
    Promise<Deploy.UploadedCode>
  /** Fetch info about multiple code IDs. */
  fetchCodeInfo (codeIds: Iterable<Deploy.CodeId>, options: { parallel?: boolean }):
    Promise<Record<Deploy.CodeId, Deploy.UploadedCode>>

  fetchCodeInfo (...args: unknown[]): Promise<unknown> {
    if (args.length === 0) {
      this.log.debug('Querying all codes...')
      return timed(
        ()=>this.fetchCodeInfoImpl(),
        ({ elapsed, result }) => this.log.debug(
          `Queried in ${bold(elapsed)}: all codes`
        ))
    }
    if (args.length === 1) {
      if (args[0] instanceof Array) {
        const codeIds = args[0] as Array<Deploy.CodeId>
        const { parallel } = args[1] as { parallel?: boolean }
        this.log.debug(`Querying info about ${codeIds.length} code IDs...`)
        return timed(
          ()=>this.fetchCodeInfoImpl({ codeIds, parallel }),
          ({ elapsed, result }) => this.log.debug(
            `Queried in ${bold(elapsed)}: info about ${codeIds.length} code IDs`
          ))
      } else {
        const codeIds = [args[0] as Deploy.CodeId]
        const { parallel } = args[1] as { parallel?: boolean }
        this.log.debug(`Querying info about code id ${args[0]}...`)
        return timed(
          ()=>this.fetchCodeInfoImpl({ codeIds, parallel }),
          ({ elapsed }) => this.log.debug(
            `Queried in ${bold(elapsed)}: info about code id ${codeIds[0]}`
          ))
      }
    } else {
      throw new Error('fetchCodeInfo takes 0 or 1 arguments')
    }
  }
  /** Chain-specific implementation of fetchCodeInfo. */
  protected abstract fetchCodeInfoImpl (parameters?: {
    codeIds?: Deploy.CodeId[]
    parallel?: boolean
  }):
    Promise<Record<Deploy.CodeId, Deploy.UploadedCode>>

  /// FETCH CODE INSTANCES ///

  /** Fetch all instances of a code ID. */
  fetchCodeInstances (
    codeId: Deploy.CodeId
  ): Promise<Record<Address, Contract>>
  /** Fetch all instances of a code ID, with custom client class. */
  fetchCodeInstances <C extends typeof Contract> (
    Contract: C,
    codeId: Deploy.CodeId
  ): Promise<Record<Address, InstanceType<C>>>
  /** Fetch all instances of multple code IDs. */
  fetchCodeInstances (
    codeIds:  Iterable<Deploy.CodeId>,
    options?: { parallel?: boolean }
  ): Promise<Record<Deploy.CodeId, Record<Address, Contract>>>
  /** Fetch all instances of multple code IDs, with custom client class. */
  fetchCodeInstances <C extends typeof Contract> (
    Contract: C,
    codeIds:  Iterable<Deploy.CodeId>,
    options?: { parallel?: boolean }
  ): Promise<Record<Deploy.CodeId, Record<Address, InstanceType<C>>>>
  /** Fetch all instances of multple code IDs, with multiple custom client classes. */
  fetchCodeInstances (
    codeIds:  { [id: Deploy.CodeId]: typeof Contract },
    options?: { parallel?: boolean }
  ): Promise<{
    [codeId in keyof typeof codeIds]: Record<Address, InstanceType<typeof codeIds[codeId]>>
  }>
  async fetchCodeInstances (...args: unknown[]): Promise<unknown> {
    let $C = Contract
    let custom = false
    if (typeof args[0] === 'function') {
      $C = args.shift() as typeof Contract
      let custom = true
    }
    if (!args[0]) {
      throw new Error('Invalid arguments')
    }

    if (args[0][Symbol.iterator]) {
      const result: Record<Deploy.CodeId, Record<Address, Contract>> = {}
      const codeIds = {}
      for (const codeId of args[0] as Deploy.CodeId[]) {
        codeIds[codeId] = $C
      }
      this.log.debug(`Querying contracts with code ids ${Object.keys(codeIds).join(', ')}...`)
      return timed(
        ()=>this.fetchCodeInstancesImpl({ codeIds }),
        ({elapsed})=>this.log.debug(`Queried in ${elapsed}ms`))
    }

    if (typeof args[0] === 'object') {
      if (custom) {
        throw new Error('Invalid arguments')
      }
      const result: Record<Deploy.CodeId, Record<Address, Contract>> = {}
      this.log.debug(`Querying contracts with code ids ${Object.keys(args[0]).join(', ')}...`)
      const codeIds = args[0] as { [id: Deploy.CodeId]: typeof Contract }
      return timed(
        ()=>this.fetchCodeInstancesImpl({ codeIds }),
        ({elapsed})=>this.log.debug(`Queried in ${elapsed}ms`))
    }

    if ((typeof args[0] === 'number')||(typeof args[0] === 'string')) {
      const id = args[0]
      this.log.debug(`Querying contracts with code id ${id}...`)
      const result = {}
      return timed(
        ()=>this.fetchCodeInstancesImpl({ codeIds: { [id]: $C } }),
        ({elapsed})=>this.log.debug(`Queried in ${elapsed}ms`))
    }
    
    throw new Error('Invalid arguments')
  }
  /** Chain-specific implementation of fetchCodeInstances. */
  protected abstract fetchCodeInstancesImpl (parameters: {
    codeIds: { [id: Deploy.CodeId]: typeof Contract },
    parallel?: boolean
  }):
    Promise<{
      [codeId in keyof typeof parameters["codeIds"]]:
        Record<Address, InstanceType<typeof parameters["codeIds"][codeId]>>
    }>

  /// FETCH CONTRACT INFO ///

  /** Fetch a contract's details wrapped in a `Contract` instance. */
  fetchContractInfo (
    address:   Address
  ): Promise<Contract>
  /** Fetch a contract's details wrapped in a custom class instance. */
  fetchContractInfo <C extends typeof Contract> (
    Contract:  C,
    address:   Address
  ): Promise<Contract>
  /** Fetch multiple contracts' details wrapped in `Contract` instance. */
  fetchContractInfo (
    addresses: Address[],
    options?:  { parallel?: boolean }
  ): Promise<Record<Address, Contract>>
  /** Fetch multiple contracts' details wrapped in instances of a custom class. */
  fetchContractInfo <C extends typeof Contract> (
    Contract:  C,
    addresses: Address[],
    options?:  { parallel?: boolean }
  ): Promise<Record<Address, Contract>>
  /** Fetch multiple contracts' details, specifying a custom class for each. */
  fetchContractInfo (
    contracts: { [address: Address]: typeof Contract },
    options?:  { parallel?: boolean }
  ): Promise<{
    [address in keyof typeof contracts]: InstanceType<typeof contracts[address]>
  }>

  async fetchContractInfo (...args: unknown[]): Promise<unknown> {
    let $C = Contract
    let custom = false
    if (typeof args[0] === 'function') {
      $C = args.shift() as typeof Contract
      custom = true
    }
    if (!args[0]) {
      throw new Error('Invalid arguments')
    }
    const { parallel = false } = (args[1] || {}) as { parallel?: boolean }

    // Fetch single contract
    if (typeof args[0] === 'string') {
      this.log.debug(`Fetching contract ${args[0]}`)
      const contracts = await timed(
        ()=>this.fetchContractInfoImpl({ addresses: [args[0] as Address] }),
        ({ elapsed }) => this.log.debug(
          `Fetched in ${bold(elapsed)}: contract ${args[0]}`
        ))
      if (custom) {
        return new $C(contracts[args[0]])
      } else {
        return contracts[args[0]]
      }
    }

    // Fetch array of contracts
    if (args[0][Symbol.iterator]) {
      const addresses = args[0] as Address[]
      this.log.debug(`Fetching ${addresses.length} contracts`)
      const contracts = await timed(
        ()=>this.fetchContractInfoImpl({ addresses, parallel }),
        ({ elapsed }) => this.log.debug(
          `Fetched in ${bold(elapsed)}: ${addresses.length} contracts`
        ))
      if (custom) {
        return addresses.map(address=>new $C(contracts[address]))
      } else {
        return addresses.map(address=>contracts[address])
      }
    }

    // Fetch map of contracts with different classes
    if (typeof args[0] === 'object') {
      if (custom) {
        // Can't specify class as first argument
        throw new Error('Invalid arguments')
      }

      const addresses = Object.keys(args[0]) as Address[]
      this.log.debug(`Querying info about ${addresses.length} contracts`)
      const contracts = await timed(
        ()=>this.fetchContractInfoImpl({ addresses, parallel }),
        ({ elapsed }) => this.log.debug(
          `Queried in ${bold(elapsed)}: info about ${addresses.length} contracts`
        ))
      const result = {}
      for (const address of addresses) {
        result[address] = new args[0][address](contracts[address])
      }
      return result
    }

    throw new Error('Invalid arguments')
  }
  /** Chain-specific implementation of fetchContractInfo. */
  protected abstract fetchContractInfoImpl (parameters: {
    contracts: { [address: Address]: typeof Contract },
    parallel?: boolean
  }):
    Promise<Record<Address, Contract>>

  /// QUERY ///

  /** Query a contract by address. */
  query <T> (contract: Address, message: Message): Promise<T>
  /** Query a contract object. */
  query <T> (contract: { address: Address }, message: Message): Promise<T>

  query <T> (contract: Address|{ address: Address }, message: Message):
    Promise<T> {
    return timed(
      ()=>this.queryImpl({
        ...(typeof contract === 'string') ? { address: contract } : contract,
        message
      }),
      ({ elapsed, result }) => this.log.debug(
        `Queried in ${bold(elapsed)}s: `, JSON.stringify(result)
      )
    )
  }

  protected abstract queryImpl <T> (parameters: {
    address:   Address
    codeHash?: string
    message:   Message
  }):
    Promise<T>

}

/** Enables non-read-only transactions by binding an `Identity` to a `Connection`. */
export abstract class Agent extends Logged {
  /** The connection that will broadcast the transactions. */
  connection: Connection
  /** The identity that will sign the transactions. */
  identity:   Identity
  /** Default transaction fees. */
  fees?: Token.FeeMap<'send'|'upload'|'init'|'exec'>

  constructor (properties: Partial<Agent>) {
    super()
    assign(this, properties, ["connection", "identity", "fees"])
  }

  get address (): Address|undefined {
    return this.identity?.address
  }

  async fetchBalance (tokens?: string[]|string): Promise<void> {
    throw new Error("unimplemented!")
  }

  /** Send native tokens to 1 recipient. */
  async send (
    recipient: Address|{ address?: Address },
    amounts: (Token.Amount|Token.ICoin)[],
    options?: { sendFee?: Token.IFee, sendMemo?: string }
  ): Promise<unknown> {
    if (typeof recipient === 'object') {
      recipient = recipient.address!
    }
    if (!recipient) {
      throw new Error('no recipient address')
    }
    this.log.debug(
      `Sending to ${bold(recipient)}:`,
      ` ${amounts.map(x=>x.toString()).join(', ')}`
    )
    return await timed(
      ()=>this.sendImpl({
        recipient: recipient as string,
        amounts: amounts.map(
          amount=>(amount instanceof Token.Amount)?amount.asCoin():amount
        ),
        options
      }),
      t=>`Sent in ${bold(t)}s`
    )
  }

  /** Chain-specific implementation of native token transfer. */
  protected abstract sendImpl (parameters: {
    outputs:   Record<Address, Record<string, Token.Uint128>>,
    sendFee?:  Token.IFee,
    sendMemo?: string,
    parallel?: boolean
  }): Promise<unknown>

  /** Upload a contract's code, generating a new code id/hash pair. */
  async upload (
    code:     string|URL|Uint8Array|Partial<Code.CompiledCode>,
    options?: Omit<Parameters<Agent["uploadImpl"]>[0], 'binary'>,
  ): Promise<Deploy.UploadedCode & {
    chainId: ChainId,
    codeId:  Deploy.CodeId
  }> {
    let template: Uint8Array
    if (code instanceof Uint8Array) {
      template = code
    } else {
      if (typeof code === 'string' || code instanceof URL) {
        code = new _$_HACK_$_.CompiledCode({ codePath: code })
      } else {
        code = new _$_HACK_$_.CompiledCode(code)
      }
      const t0 = performance.now()
      template = await (code as Code.CompiledCode).fetch()
      const t1 = performance.now() - t0
      this.log.log(
        `Fetched in`, `${bold((t1/1000).toFixed(6))}s: code hash`,
        bold(code.codeHash), `(${bold(String(code.codeData?.length))} bytes`
      )
    }
    this.log.debug(`Uploading ${bold((code as any).codeHash)}`)
    const result = await timed(
      () => this.uploadImpl({ ...options, binary: template }),
      ({elapsed, result}: any) => this.log.debug(
        `Uploaded in ${bold(elapsed)}:`,
        `code with hash ${bold(result.codeHash)} as code id ${bold(String(result.codeId))}`,
      ))
    return new Deploy.UploadedCode({
      ...template, ...result as any
    }) as Deploy.UploadedCode & {
      chainId: ChainId, codeId: Deploy.CodeId,
    }
  }

  /** Chain-specific implementation of code upload. */
  protected abstract uploadImpl (parameters: {
    binary:       Uint8Array,
    reupload?:    boolean,
    uploadStore?: Store.UploadStore,
    uploadFee?:   Token.ICoin[]|'auto',
    uploadMemo?:  string
  }): Promise<Partial<Deploy.UploadedCode & {
    chainId: ChainId,
    codeId:  Deploy.CodeId
  }>>

  /** Instantiate a new program from a code id, label and init message. */
  async instantiate (
    contract: Deploy.CodeId|Partial<Deploy.UploadedCode>,
    options:  Partial<Deploy.ContractInstance>
  ): Promise<Deploy.ContractInstance & {
    address: Address,
  }> {
    if (typeof contract === 'string') {
      contract = new Deploy.UploadedCode({ codeId: contract })
    }
    if (isNaN(Number(contract.codeId))) {
      throw new Error(`can't instantiate contract with missing code id: ${contract.codeId}`)
    }
    if (!contract.codeId) {
      throw new Error("can't instantiate contract without code id")
    }
    if (!options.label) {
      throw new Error("can't instantiate contract without label")
    }
    if (!(options.initMsg||('initMsg' in options))) {
      throw new Error("can't instantiate contract without init message")
    }
    const { codeId, codeHash } = contract
    const result = await timed(
      () => into(options.initMsg).then(initMsg=>this.instantiateImpl({
        ...options,
        codeId,
        codeHash,
        initMsg
      })),
      ({ elapsed, result }) => this.log.debug(
        `Instantiated in ${bold(elapsed)}:`,
        `code id ${bold(String(codeId))} as `,
        `${bold(options.label)} (${result.address})`
      )
    )
    return new Deploy.ContractInstance({
      ...options, ...result
    }) as Deploy.ContractInstance & {
      address: Address
    }
  }

  /** Chain-specific implementation of contract instantiation. */
  protected abstract instantiateImpl (parameters: Partial<Deploy.ContractInstance>):
    Promise<Deploy.ContractInstance & { address: Address }>

  /** Call a given program's transaction method. */
  async execute <T> (
    contract: Address|Partial<Deploy.ContractInstance>,
    message:  Message,
    options?: Omit<Parameters<Agent["executeImpl"]>[0], 'address'|'codeHash'|'message'>
  ): Promise<T> {
    if (typeof contract === 'string') {
      contract = new Deploy.ContractInstance({ address: contract })
    }
    if (!contract.address) {
      throw new Error("agent.execute: no contract address")
    }
    const { address } = contract
    let method = (typeof message === 'string') ? message : Object.keys(message||{})[0]
    return timed(
      () => this.executeImpl({
        ...contract as { address, codeHash },
        message,
        ...options
      }),
      ({ elapsed }) => this.log.debug(
        `Executed in ${bold(elapsed)}:`,
        `tx ${bold(method||'(???)')} of ${bold(address)}`
      )
    )
  }

  /** Chain-specific implementation of contract transaction. */
  protected abstract executeImpl <T> (parameters: {
    address:   Address
    codeHash?: string
    message:   Message
    execFee?:  Token.IFee
    execSend?: Token.ICoin[]
    execMemo?: string
  }): Promise<T>
}

/** The building block of a blockchain, as obtained by
  * [the `fetchBlock` method of `Connection`](#method-connectionfetchblock)
  *
  * Contains zero or more transactions. */
export abstract class Block {
  /** Connection to the chain to which this block belongs. */
  chain?: Connection
  /** Monotonically incrementing ID of block. */
  height: number
  /** Content-dependent ID of block. */
  hash:   string

  constructor (properties: Partial<Block> = {}) {
    assign(this, properties, ["height", "hash"])
    hideProperties(this, "block")
  }

  async fetchTransactions ():
    Promise<Transaction[]>
  async fetchTransactions (options: { byId: true }):
    Promise<Record<string, Transaction>>
  async fetchTransactions (...args: unknown[]): Promise<unknown> {
    return []
  }
}

/** Represents a particular instance of a smart contract.
  *
  * Subclass this to add custom query and transaction methods corresponding
  * to the contract's API. */
export class Contract extends Logged {
  /** Connection to the chain on which this contract is deployed. */
  connection?: Connection
  /** Connection to the chain on which this contract is deployed. */
  agent?:      Agent
  /** Code upload from which this contract is created. */
  codeId?:     Deploy.CodeId
  /** The code hash uniquely identifies the contents of the contract code. */
  codeHash?:   Code.CodeHash
  /** The address uniquely identifies the contract instance. */
  address?:    Address
  /** The label is a human-friendly identifier of the contract. */
  label?:      Label
  /** The address of the account which instantiated the contract. */
  initBy?:     Address

  constructor (properties: Partial<Contract>) {
    super((typeof properties === 'string')?{}:properties)
    if (typeof properties === 'string') {
      properties = { instance: { address: properties } }
    }
    assign(this, properties, [ 'instance', 'connection' ])
    let { instance, connection } = properties
    this.instance = instance as Partial<Deploy.ContractInstance>
    this.connection = connection
  }

  /** Execute a query on the specified instance as the specified Connection. */
  query <Q> (message: Message): Promise<Q> {
    if (!this.connection) {
      throw new Error("can't query instance without connection")
    }
    if (!this.instance?.address) {
      throw new Error("can't query instance without address")
    }
    return this.connection.query<Q>(
      this.instance as Deploy.ContractInstance & { address: Address }, message
    )
  }

  /** Execute a transaction on the specified instance as the specified Connection. */
  execute (message: Message, options: Parameters<Agent["execute"]>[2] = {}): Promise<unknown> {
    if (!this.connection) {
      throw new Error("can't transact with instance without connection")
    }
    if (!this.agent?.execute) {
      throw new Error("can't transact with instance without authorizing the connection")
    }
    if (!this.instance?.address) {
      throw new Error("can't transact with instance without address")
    }
    return this.agent?.execute(
      this.instance as Deploy.ContractInstance & { address: Address }, message, options
    )
  }
}
