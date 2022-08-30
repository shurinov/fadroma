import { bold } from '@hackbg/konzola'

type valof<T> = T[keyof T]

/** Core of inheritance model. Override only allowed properties.
  * Thanks to this atrocity, Contract inherits from Template inherits from Source. */
export function override (
  strict:    boolean,
  self:      object,
  overrides: object,
  allowed:   string[] = Object.getOwnPropertyNames(self),
): Record<string, valof<typeof overrides>> {
  const filtered: Record<string, valof<typeof overrides>> = {}
  for (const [key, val] of Object.entries(overrides)) {
    if (allowed.includes(key)) {
      const current: typeof val = (self as any)[key]
      if (strict && current && current !== val) {
        throw new Error(`Tried to override pre-defined ${key}`)
      }
      (self as any)[key] = val
    } else {
      (filtered as any)[key] = val
    }
  }
  return filtered
}

/** A ***value object*** that allows its meaningful properties to be overridden.
  * For the override to work, empty properties must be defined as:
  *
  *     class Named extends Overridable {
  *         name?: Type = undefined
  *     }
  *
  * Otherwise Object.getOwnPropertyNames won't see the property slots,
  * and `new Named.but({ name: 'something' })` won't update `name`.
  * (This is because of how TypeScript handles class properties;
  * in raw JS, they seem to be defined as undefined by default?)
  *
  * Even in when not inheriting from `Overridable`, try to follow the pattern of
  * ***immutable value objects*** which represent a piece of state in context
  * and which, instead of mutating themselves, emit changed copies of themselves
  * using the idioms:
  *     this.but({ name: 'value' }) // internally
  * or:
  *     new Named(oldNamed, { name: 'value' }) // externally.
  **/
export class Overridable {
  override (options: object = {}) {
    override(true, this, options)
  }
  /** Return copy of self with overridden properties. */
  but (options: Partial<Source> = {}) {
    return new (this.constructor as any)(this, options)
  }
}

/** `new Overridable(specifier, overrides)` idiom. */
export interface New<T, U> {
  new (specifier?: U, options?: Partial<T>): T
}

/** The friendly name of the contract. Used as part of the label. */
export type Name       = string

/** The contract's full unique on-chain label. */
export type Label      = string

/** Allows sources to be specified as strings, URLs, or key-value maps. */
export type IntoSource = string|URL|Partial<Source>

/** Source: a smart contract that exists in source code form and can be compiled. */
export abstract class Source extends Overridable implements Partial<Source> {

  /** Allow Source to be specified from string or URL. */
  static get (specifier: IntoSource, options: Partial<Source> = {}): Partial<Source> {
    if (typeof specifier === 'string') {
      const [ crate, ref ] = specifier.split('@')
      return { ...options, crate, ref }
    } else if (specifier instanceof URL) {
      return { ...options, repo: specifier }
    } else if (typeof specifier === 'object') {
      return { ...specifier, ...options }
    } else {
      throw new SourceError.Invalid(specifier)
    }
  }

  constructor (specifier: IntoSource = {}, options: Partial<Source> = {}) {
    super()
    this.override(Source.get(specifier, options))
  }

  /** URL to local or remote Git repository containing the source code. */
  repo?:    string|URL     = undefined

  /** Commit hash of source commit. Points to last commit if building from HEAD. */
  commit?:  string         = undefined

  /** Git ref (branch or tag) pointing to source commit. */
  ref?:     string         = undefined

  /** Name of crate. Used to find contract crate in workspace repos. */
  crate?:   string         = undefined

  /** Builder implementation that produces a Template from the Source. */
  builder?: string|Builder = undefined

  /** Compile the source using the selected builder. */
  build (builder?: typeof this.builder): Promise<Template> {
    return this.assertBuildable(builder).build(this)
  }

  /** Throw appropriate error if not buildable. */
  assertBuildable (builder: typeof this.builder = this.builder): Builder {
    if (!this.crate) throw new SourceError.NoCrate()
    if (!builder)    throw new SourceError.NoBuilder()
    if (typeof builder === 'string') throw new SourceError.ProvideBuilder(builder)
    return builder
  }

  /** Return a copy of self pinned to a certain Git reference.
    * Used to specify historical builds. */
  at (ref?: string): Source {
    return ref ? this : this.but({ ref })
  }

  /** Serialize for storage as JSON-formatted plaintext. */
  flatten (): Partial<Source> {
    return {
      repo:    this.repo?.toString(),
      commit:  this.commit,
      ref:     this.ref,
      crate:   this.crate,
      builder: (typeof this.builder === 'object') ? this.builder.id : this.builder
    }
  }

}

export class CustomError extends Error {
  static define (name: string, message: (...args: any)=>string): typeof this {
    return Object.assign(class extends this {}, {
      name: `${name}Error`,
      constructor (...args: any) {
        //@ts-ignore
        super(message(args))
      }
    })
  }
}

export class SourceError extends CustomError {
  static Invalid        = this.define('InvalidSource',
    (specifier: unknown) => `Can't create source from: ${specifier}`)
  static NoCrate        = this.define('NoCrate',
    () => `No crate specified for building`)
  static NoBuilder      = this.define('NoBuilder',
    () => `No builder selected.`)
  static ProvideBuilder = this.define('ProvideBuilder',
    (id: string) => `Provide a "${id}" builder`)
}

/** Constructor type for builder. */
export type NewBuilder = New<Builder, IntoBuilder>

/** Builders can be specified as ids, class names, or objects. */
export type IntoBuilder = string|NewBuilder|Partial<Builder>

/** Builder: turns `Source` into `Template`, providing `artifact` and `codeHash` */
export abstract class Builder extends Overridable {

  /** Populated by @fadroma/build */
  static variants: Record<string, Builder> = {}

  /** Get a Builder from a specifier and optional overrides. */
  static get (specifier: IntoBuilder = '', options: Partial<Builder> = {}) {
    if (typeof specifier === 'string') {
      const B = Builder.variants[specifier]
      if (!B) {
        throw new Error(`No "${specifier}" builder installed. Make sure @fadroma/build is imported`)
      }
      return new (B as any)(options)
    } else if (typeof specifier === 'function') {
      if (!options.id) {
        throw new Error(`No builder specified.`)
      }
      return new (specifier as NewBuilder)(options)
    } else {
      const B = Builder.variants[specifier?.id as string]
      return new (B as any)({ ...specifier, ...options })
    }
  }

  /** For serialization/deserialization. */
  abstract id: string

  /** Up to the implementation.
    * `@fadroma/build` implements dockerized and non-dockerized
    * variants on top of the `build.impl.mjs` script. */
  abstract build (source: IntoSource, ...args: any[]): Promise<Template>

  /** Default implementation of buildMany is parallel.
    * Builder implementations override this, though. */
  buildMany (sources: IntoSource[], ...args: unknown[]): Promise<Template[]> {
    return Promise.all(sources.map(source=>this.build(source, ...args)))
  }

}

export type NewTemplate = New<Template, IntoTemplate>

export type IntoTemplate = IntoSource|Partial<Template>

/** Template: contract that is compiled but not deployed.
  * Can be uploaded, and, after uploading, instantiated. */
export class Template extends Source {

  /** Allow Template to be specified from string, URL or Source */
  static parse (specifier: IntoTemplate, options: Partial<Template> = {}): Partial<Template> {
    if (typeof specifier === 'string') {
      const [crate, ref] = specifier.split('@')
      return { ...options, crate, ref }
    } else if (specifier instanceof URL) {
      return { ...options, artifact: specifier }
    } else if (typeof specifier === 'object') {
      return { ...specifier, ...options }
    } else {
      throw new TemplateError.Invalid(specifier)
    }
  }

  constructor (
    specifier: IntoTemplate      = {},
    options:   Partial<Template> = {},
    public readonly context?: UploadInitContext
  ) {
    super()
    this.override(Template.parse(specifier, options))
  }

  /** URL to the compiled code. */
  artifact?:  string|URL      = undefined

  /** Code hash ensuring immutability of the compiled code. */
  codeHash?:  CodeHash        = undefined

  /** Object containing upload logic. */
  uploader?:  string|Uploader = undefined

  /** ID of chain to which this template is uploaded. */
  chainId?:   ChainId         = undefined

  /** Code ID representing the identity of the contract's code on a specific chain. */
  codeId?:    CodeId          = undefined

  /** Hash of transaction that performed the upload. */
  uploadTx?:  TxHash          = undefined

  /** Return the Uploader for this Template or throw. */
  private assertUploader (uploader: typeof this.uploader = this.uploader): Uploader {
    if (!uploader)                    throw new TemplateError.NoUploader()
    if (typeof uploader === 'string') throw new TemplateError.ProvideUploader(uploader)
    if (!uploader.agent)              throw new TemplateError.NoUploaderAgent()
    return uploader
  }

  /** Upload source code to a chain. */
  async upload (uploader?: typeof this.uploader): Promise<Template> {
    let self: Template = this
    if (!self.artifact) self = await self.build()
    return self.assertUploader(uploader).upload(this)
  }

  /** Depending on what pre-Template type we start from, this function
    * invokes builder and uploader to produce a Template from it. */
  async getOrUpload (): Promise<Template> {
    // We're gonna do this immutably, generating new instances of Template when changes are needed.
    let self: Template = this
    // If chain ID, code ID and code hash are present, this template is ready to uploade
    if (self.chainId && self.codeId && self.codeHash) return self
    // Otherwise we're gonna need an uploader
    const uploader = self.assertUploader()
    // And if we still can't determine the chain ID, bail
    const chainId = self.chainId ?? uploader.chain.id
    if (!chainId) throw new TemplateError.NoChainId()
    // If we have chain ID and code ID, try to get code hash
    if (self.codeId) {
      self = new Template(self, { codeHash: await uploader.getHash(self.codeId) })
      if (!self.codeHash) throw new TemplateError.NoCodeHash()
      return self
    }
    return await this.upload()
  }

  async instantiate (agent: Agent, label: string, initMsg: Message): Promise<Contract> {
    return await agent.instantiate(this, label, initMsg)
  }

}

/** Multiple different templates that can be uploaded in one invocation.
  * Not uploaded in parallel by default. */
export class Templates {
  constructor (
    slots: IntoTemplate[] = [],
    public readonly context: UploadInitContext
  ) {
    this.slots = slots.map(value=>new Template(value, { context }))
  }
  public readonly slots: Template[]
  async getOrUploadMany (): Promise<Template[]> {
    const templates: Template[] = []
    for (const template of this.slots) {
      templates.push(await template.getOrUpload())
    }
    return templates
  }
}

export class TemplateError extends CustomError {
  static Invalid = this.define('InvalidSpecifier',
    (specifier: unknown) => `Can't create template from: ${specifier}`)
  static NoArtifact = this.define('NoArtifact',
    () => "No code id and no artifact to upload")
  static NoUploader = this.define('NoUploader',
    () => "No uploader specified")
  static NoUploaderAgent = this.define('NoUploaderAgent',
    () => "No uploader agent specified")
  static ProvideUploader = this.define('ProvideUploader',
    (id: string) => `Provide a "${id}" uploader`)
  static NoChainId = this.define('NoChainId',
    () => "No chain ID specified")
  static NoCodeHash = this.define('NoCodeHash',
    () => "No code hash")
  static NoSource = this.define('TemplateNoSource',
    () => "No artifact and no source to build")
  static NoArtifactURL = this.define('NoArtifactUrl',
    () => "Still no artifact URL")
}

/** A code ID, identifying uploaded code on a chain. */
export type CodeId     = string

/** A code hash, verifying the code's integrity. */
export type CodeHash   = string

/** An address on a chain. */
export type Address    = string

/** A transaction message that can be sent to a contract. */
export type Message    = string|Record<string, unknown>

/** Interface for executing read-only, unauthenticated API calls. */
export interface Spectator {

  /** The chain on which this object operates. */
  chain:        Chain

  /** Query a smart contract. */
  query <U>     (contract: Partial<Client>, msg: Message): Promise<U>

  /** Get the code id of a smart contract. */
  getCodeId     (address: Address):                        Promise<string>

  /** Get the label of a smart contract. */
  getLabel      (address: Address):                        Promise<string>

  /** Get the code hash of a smart contract. */
  getHash       (addressOrCodeId: Address|number):         Promise<string>

  /** Get the code hash of a smart contract. */
  checkHash     (address: Address, codeHash?: CodeHash):   Promise<string>

  /** Get the current block height. */
  get height    ():                                        Promise<number>

  /** Wait for the block height to increment. */
  get nextBlock ():                                        Promise<number>

}

/** A chain can be in one of the following modes: */
export enum ChainMode {
  Mainnet = 'Mainnet',
  Testnet = 'Testnet',
  Devnet  = 'Devnet',
  Mocknet = 'Mocknet'
}

/** The unique ID of a chain. */
export type ChainId = string

/** Represents a particular chain. */
export abstract class Chain implements Spectator {

  static Mode = ChainMode

  constructor (
    readonly id: ChainId,
    options: Partial<ChainOpts> = {}
  ) {
    if (!id) {
      throw new Error('Chain: need to pass chain id')
    }
    this.id   = id
    this.mode = options.mode!
    if (options.url) {
      this.url = options.url
    }
    if (options.node) {
      if (options.mode === Chain.Mode.Devnet) {
        this.node = options.node
        if (this.url !== String(this.node.url)) {
          console.warn(`Fadroma Chain: node.url "${this.node.url}" overrides chain.url "${this.url}"`)
          this.url = String(this.node.url)
        }
        if (this.id !== this.node.chainId) {
          console.warn(`Fadroma Chain: node.id "${this.node.chainId}" overrides chain.id "${this.id}"`)
          this.id = this.node.chainId
        }
      } else {
        console.warn('Chain: "node" option passed to non-devnet. Ignoring')
      }
    }
  }

  isSecretNetwork = false

  /** The API URL to use. */
  readonly url:  string = ''

  /** Whether this is mainnet, public testnet, local devnet, or mocknet. */
  readonly mode: ChainMode

  /** Whether this is a mainnet. */
  get isMainnet () { return this.mode === ChainMode.Mainnet }

  /** Whether this is a testnet. */
  get isTestnet () { return this.mode === ChainMode.Testnet }

  /** Whether this is a devnet. */
  get isDevnet  () { return this.mode === ChainMode.Devnet  }

  /** Whether this is a mocknet. */
  get isMocknet () { return this.mode === ChainMode.Mocknet }

  /** Whether this is a devnet or mocknet. */
  get devMode   () { return this.isDevnet || this.isMocknet }

  /** Return self. */
  get chain     () { return this }

  /** If this is a devnet, this contains an interface to the devnet container. */
  readonly node?: DevnetHandle

  /** The default denomination of the chain's native token. */
  abstract defaultDenom: string

  /** Get the native balance of an address. */
  abstract getBalance (denom: string, address: Address): Promise<string>

  abstract query <U> (contract: Client, msg: Message): Promise<U>

  abstract getCodeId (address: Address): Promise<CodeId>

  abstract getLabel (address: Address): Promise<string>

  abstract getHash (address: Address|number): Promise<CodeHash>

  async checkHash (address: Address, codeHash?: CodeHash) {
    // Soft code hash checking for now
    const realCodeHash = await this.getHash(address)
    if (!codeHash) {
      console.warn(
        'Code hash not provided for address:', address,
        '  Code hash on chain:', realCodeHash
      )
    } if (codeHash !== realCodeHash) {
      console.warn(
        'Code hash mismatch for address:', address,
        '  Expected code hash:',           codeHash,
        '  Code hash on chain:',           realCodeHash
      )
    } else {
      console.info(`Code hash of ${address}:`, realCodeHash)
    }
    return realCodeHash
  }

  abstract get height (): Promise<number>

  get nextBlock (): Promise<number> {
    console.info('Waiting for next block...')
    return new Promise((resolve, reject)=>{
      this.height.then(async startingHeight=>{
        try {
          while (true) {
            await new Promise(ok=>setTimeout(ok, 100))
            const height = await this.height
            if (height > startingHeight) {
              resolve(height)
            }
          }
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  /** Get a new instance of the appropriate Agent subclass. */
  async getAgent <A extends Agent> (
    options: Partial<AgentOpts> = {},
    _Agent:  AgentCtor<Agent> = this.Agent as AgentCtor<Agent>
  ): Promise<A> {
    if (this.node) await this.node.respawn()
    if (!options.mnemonic && options.name) {
      if (this.node) {
        options = await this.node.getGenesisAccount(options.name)
      } else {
        throw new Error('Chain#getAgent: getting agent by name only supported for devnets')
      }
    }
    const agent = await _Agent.create(this, options) as A
    return agent
  }

  static Agent: AgentCtor<Agent>

  /** The Agent subclass to use for interacting with this chain. */
  Agent: AgentCtor<Agent> = (this.constructor as Function & { Agent: AgentCtor<Agent> }).Agent

}

export interface ChainOpts {
  url:  string
  mode: ChainMode
  node: DevnetHandle
}

export interface DevnetHandle {
  chainId: string
  url: URL
  respawn (): Promise<unknown>
  terminate (): Promise<void>
  getGenesisAccount (name: string): Promise<AgentOpts>
}

/** Something that can execute mutating transactions. */
export interface Executor extends Spectator {
  /** The address from which transactions are signed and sent. */
  address?:        Address
  /** Default fee maximums for send, upload, init, and execute. */
  fees?:           AgentFees
  /** Send native tokens to 1 recipient. */
  send            (to: Address, amounts: ICoin[], opts?: ExecOpts):    Promise<void|unknown>
  /** Send native tokens to multiple recipients. */
  sendMany        (outputs: [Address, ICoin[]][], opts?: ExecOpts):    Promise<void|unknown>
  /** Upload code, generating a new code id/hash pair. */
  upload          (code: Uint8Array):                                  Promise<void|Template>
  /** Upload multiple pieces of code, generating multiple code id/hash pairs. */
  uploadMany      (code: Uint8Array[]):                                Promise<void|Template[]>
  /** Create a new smart contract from a code id, label and init message. */
  instantiate     (template: Template, label: string, msg: Message):   Promise<void|Contract>
  /** Create multiple smart contracts from a list of code id/label/init message triples. */
  instantiateMany (configs: DeployArgsTriple[]):                       Promise<void|Contract[]>
  /** Call a transaction method on a smart contract. */
  execute         (contract: Contract, msg: Message, opts?: ExecOpts): Promise<void|unknown>
  /** Begin a transaction bundle. */
  bundle          (): Bundle
  /** Get a client instance for talking to a specific smart contract as this executor. */
  getClient <C extends Client> (
    Client: NewClient<C>, specifier: Address|Partial<C>, codeHash?: CodeHash
  ): C
}

export type DeployArgsTriple = [Template, Name, Message]

/** Options for a compute transaction. */
export interface ExecOpts {
  /** The maximum fee. */
  fee?:  IFee
  /** A list of native tokens to send alongside the transaction. */
  send?: ICoin[]
  /** A transaction memo. */
  memo?: string
}

/** A 128-bit integer. */
export type Uint128    = string

/** A 256-bit integer. */
export type Uint256    = string

/** A 128-bit decimal fraction. */
export type Decimal    = string

/** A 256-bit decimal fraction. */
export type Decimal256 = string

/** Represents some amount of native token. */
export interface ICoin { amount: Uint128, denom: string }

/** A gas fee, payable in native tokens. */
export interface IFee { amount: readonly ICoin[], gas: Uint128 }

/** Represents some amount of native token. */
export class Coin implements ICoin {
  readonly amount: string
  constructor (amount: number|string, readonly denom: string) {
    this.amount = String(amount)
  }
}

/** A constructable gas fee in native tokens. */
export class Fee implements IFee {
  readonly amount: readonly ICoin[]
  constructor (amount: Uint128|number, denom: string, readonly gas: string = String(amount)) {
    this.amount = [{ amount: String(amount), denom }]
  }
}

/** By authenticating to a network you obtain an Agent,
  * which can perform transactions as the authenticated identity. */
export abstract class Agent implements Executor {

  static create (chain: Chain, options: AgentOpts = {}): Promise<Agent> {
    //@ts-ignore
    return new this(chain, options)
  }

  constructor (readonly chain: Chain, options: AgentOpts = {}) {
    this.chain = chain
    Object.defineProperty(this, 'chain', { enumerable: false })
    if (options.name) this.name = options.name
    if (options.fees) this.fees = options.fees
  }

  /** The address of this agent. */
  address?: Address

  /** The friendly name of the agent. */
  name?:    string

  /** Default transaction fees to use for interacting with the chain. */
  fees?:    AgentFees

  /** The default denomination in which the agent operates. */
  get defaultDenom () { return this.chain.defaultDenom }

  /** Get the balance of this or another address. */
  getBalance (denom = this.defaultDenom, address = this.address): Promise<string> {
    if (address) {
      return this.chain.getBalance(denom, address)
    } else {
      throw new Error('Agent#getBalance: what address?')
    }
  }

  /** This agent's balance in the chain's native token. */
  get balance (): Promise<string> { return this.getBalance() }

  /** The chain's current block height. */
  get height (): Promise<number> { return this.chain.height }

  /** Wait until the block height increments. */
  get nextBlock () { return this.chain.nextBlock }

  /** Get the code ID of a contract. */
  getCodeId (address: Address) { return this.chain.getCodeId(address) }

  /** Get the label of a contract. */
  getLabel  (address: Address) { return this.chain.getLabel(address) }

  /** Get the code hash of a contract or template. */
  getHash   (address: Address|number) { return this.chain.getHash(address) }

  checkHash (address: Address, codeHash?: CodeHash) {
    return this.chain.checkHash(address, codeHash)
  }

  getClient <C extends Client> (
    Client: NewClient<C>, specifier: Address|Partial<C>, codeHash?: CodeHash
  ): C {
    if (typeof specifier === 'string') specifier = { address: specifier } as Partial<C>
    return new Client(this, { ...specifier, codeHash })
  }

  query <R> (contract: Client, msg: Message): Promise<R> {
    return this.chain.query(contract, msg)
  }

  abstract send     (to: Address, amounts: ICoin[], opts?: ExecOpts): Promise<void|unknown>

  abstract sendMany (outputs: [Address, ICoin[]][], opts?: ExecOpts): Promise<void|unknown>

  abstract upload (blob: Uint8Array): Promise<Template>

  uploadMany (blobs: Uint8Array[] = []): Promise<Template[]> {
    return Promise.all(blobs.map(blob=>this.upload(blob)))
  }

  abstract instantiate <T> (template: Template, label: string, msg: T): Promise<Contract>

  instantiateMany (configs: DeployArgsTriple[] = []): Promise<Contract[]> {
    return Promise.all(configs.map(triple=>this.instantiate(...triple)))
  }

  abstract execute (
    contract: Partial<Contract>, msg: Message, opts?: ExecOpts
  ): Promise<void|unknown>

  static Bundle: BundleCtor<Bundle>

  Bundle: BundleCtor<Bundle> = (this.constructor as AgentCtor<typeof this>).Bundle

  bundle (): Bundle {
    //@ts-ignore
    return new this.Bundle(this)
  }

}

export interface AgentCtor<A extends Agent> {
  new    (chain: Chain, options: AgentOpts): A
  create (chain: Chain, options: AgentOpts): Promise<A>
  Bundle: BundleCtor<Bundle>
}

export interface AgentOpts {
  name?:     string
  mnemonic?: string
  address?:  Address
  fees?:     AgentFees
}

export interface AgentFees {
  send?:   IFee
  upload?: IFee
  init?:   IFee
  exec?:   IFee
}

export type IntoUploader = string|NewUploader|Partial<Uploader>

export type NewUploader  = New<Uploader, IntoUploader>

/** Uploader: uploads a `Template`'s `artifact` to a specific `Chain`,
  * binding the `Template` to a particular `chainId` and `codeId`. */
export abstract class Uploader {

  /** Populated by @fadroma/deploy */
  static variants: Record<string, Uploader> = {}

  constructor (public agent: Agent) {}

  get chain () {
    return this.agent.chain
  }

  async getHash (id: CodeId): Promise<CodeHash> {
    return await this.agent.getHash(Number(id))
  }

  abstract upload     (template: Template):   Promise<Template>

  abstract uploadMany (template: Template[]): Promise<Template[]>

}

/** A transaction hash, uniquely identifying an executed transaction on a chain. */
export type TxHash       = string

export interface NewClient<C extends Client> {
  new (agent?: Executor, address?: Address, hash?: CodeHash): C
  new (agent?: Executor, options?: Partial<C>): C
}

export class Client extends Template {

  constructor (
    agent?:    Executor,
    address?:  Address|Partial<Client>,
    codeHash?: CodeHash
  ) {
    super()
    if (typeof address === 'string') address = { address }
    this.override({ ...address, codeHash, agent })
    const { name } = this.constructor
    if (!this.agent) console.warn(
      `${name}: created without agent. Transactions and queries not possible.`
    )
    if (!this.address) console.warn(
      `${name}: created without address. Transactions and queries not possible.`
    )
    if (!this.codeHash) console.warn(
      `${name}: created without codeHash. Transactions and queries may be slower.`
    )
  }

  agent?:    Agent

  /** Address of the contract on the chain. */
  address?: Address                 = undefined

  /** TXID of transaction where this contract was created. */
  initTx?:  TxHash                  = undefined

  /** Label of the contract on the chain. */
  label?:   string                  = undefined

  /** Default fee for all contract transactions. */
  fee?:     IFee                    = undefined

  /** Default fee for specific transactions. */
  fees:     Record<string, IFee>    = {}

  /** The contract represented in Fadroma ICC format (`{address, code_hash}`) */
  get asLink (): ContractLink {
    if (!this.address)  throw new Error("Can't link to contract with no address")
    if (!this.codeHash) throw new Error("Can't link to contract with no code hash")
    return { address: this.address, code_hash: this.codeHash }
  }

  /** Execute a query on the specified contract as the specified Agent. */
  async query <U> (msg: Message): Promise<U> {
    return await this.assertOperational().query(this, msg)
  }

  /** Get the recommended fee for a specific transaction. */
  getFee (msg?: string|Record<string, unknown>): IFee|undefined {
    const defaultFee = this.fee || this.agent?.fees?.exec
    if (typeof msg === 'string') {
      return this.fees[msg] || defaultFee
    } else if (typeof msg === 'object') {
      const keys = Object.keys(msg)
      if (keys.length !== 1) {
        throw new Error('Client#getFee: messages must have exactly 1 root key')
      }
      return this.fees[keys[0]] || defaultFee
    }
    return this.fee || defaultFee
  }

  /** Create a copy of this Client with all transaction fees set to the provided value.
    * If the fee is undefined, returns a copy of the client with unmodified fee config. */
  withFee (fee: IFee|undefined): this {
    const Self = this.constructor as NewContract
    if (fee) {
      return new Self(this.agent, {...this, fee, fees: {}})
    } else {
      return new Self(this.agent, {...this, fee: this.fee, fees: this.fees})
    }
  }

  /** Execute a transaction on the specified contract as the specified Agent. */
  async execute (msg: Message, opt: ExecOpts = {}): Promise<void|unknown> {
    this.assertOperational()
    opt.fee = opt.fee || this.getFee(msg)
    return await this.agent!.execute(this, msg, opt)
  }

  /** Create a copy of this Client that will execute the transactions as a different Agent. */
  as (agent: Executor): this {
    const Self = this.constructor as ContractCtor<typeof this, any>
    return new Self(agent, { ...this })
  }

  /** Throw if trying to do something with no agent or address. */
  assertOperational (): Agent {
    const name = this.constructor.name
    if (!this.address) throw new Error(
      `${name} has no Agent and can't operate. Pass an address with "new ${name}(agent, ...)"`
    )
    if (!this.agent) throw new Error(
      `${name} has no address and can't operate. Pass an address with "new ${name}(agent, addr)"`
    )
    return this.agent
  }

}

export type IntoContract = Name|Partial<Client>|Partial<Contract>
export type NewContract  = New<Contract, IntoContract>

/** Contract: instantiated template.
  * Has an `address` on a specific `chain` and can do the things that it's programmed to. */
export class Contract extends Client {

  static addPrefix = (prefix: string, name: string) => `${prefix}/${name}`

  static parse (specifier: IntoContract, options: IntoContract): Partial<Contract> {
    if (typeof specifier === 'string') {
      if (typeof options === 'string') {
        return { address: specifier, codeHash: options }
      } else {
        return { ...options, name: specifier }
      }
    } else if (typeof options === 'object') {
      return { ...specifier, ...options }
    } else {
      throw new Error('TODO')
    }
  }

  constructor (
    specifier: IntoContract,
    options:   Partial<Contract> = {},
  ) {
    const parsed = Contract.parse(specifier, options)
    const { agent, address, codeHash } = parsed
    super(agent, address, codeHash)
    this.override(parsed)
  }

  /** Client class to use. */
  Client:   NewClient<any>          = Client as NewClient<Client>

  /** Friendly name of the contract. Used for looking it up in the deployment. */
  name?:    Name                    = undefined

  /** Deployment prefix of the contract. If present, label becomes `prefix/name` */
  prefix?:  Name                    = undefined

  get (message: string = `Contract not found: ${this.name}`): this {
    if (this.name && this.context?.deployment && this.context?.deployment.has(this.name)) {
      const instance = this.context?.deployment.get(this.name)
      const client   = new this.Client(this.context.creator, instance!)
      return client
    } else if (this.value) {
      const client = new this.Client(this.context?.creator, this.value)
      return client
    } else {
      throw new Error(message)
    }
  }

  async getOr (getter: ()=>this|Promise<this>): Promise<this> {
    if (this.context?.task) {
      const value = `get or provide ${this.name??'contract'}`
      Object.defineProperty(getContractOr, 'name', { value })
      return this.context.task.subtask(getContractOr)
    }
    return await getContractOr.bind(this)()
    async function getContractOr () {
      return await Promise.resolve(getter())
    }
  }

  async getOrDeploy (
    template: IntoTemplate,
    initMsg:  Message|(()=>Message|Promise<Message>)
  ): Promise<this> {
    const self = this
    if (this.context?.task) {
      const value = `get or deploy ${this.name??'contract'}`
      Object.defineProperty(getOrDeployContract, 'name', { value })
      return this.context?.task.subtask(getOrDeployContract)
    }
    return await getOrDeployContract.call(this)
    async function getOrDeployContract (this: typeof self) {
      if (this.address) {
        console.info('Found    ', bold(this.name||'(unnamed)'), 'at', bold(this.address))
        return this
      } else if (this.name) {
        if (!this.context)            throw new ContractError.NoContext()
        if (!this.context.creator)    throw new ContractError.NoCreator()
        if (!this.context.deployment) throw new ContractError.NoDeployment()
        return await this.deploy(template, initMsg)
      }
      throw new ContractError.InvalidValue()
    }
  }

  async deploy (
    label:   Label,
    initMsg: Message|(()=>Message|Promise<Message>)
  ): Promise<this> {

    const self = this

    if (this.context?.task) {
      const value = `deploy ${this.name??'contract'}`
      Object.defineProperty(deployContract, 'name', { value })
      return this.context.task.subtask(deployContract.bind(this))
    }

    return await deployContract()

    async function deployContract () {

      const name     = self.name
      if (!name) throw new ContractError.NoName()

      const creator  = self.context?.creator ?? self.agent
      if (!creator) throw new ContractError.NoCreator()

      const template = await self.getOrUpload()
      log.beforeDeploy(self, template)

      if (initMsg instanceof Function) initMsg = await Promise.resolve(initMsg())
      const instance = creator.instantiate(template, name, initMsg)

      const client = new self.Client(creator, instance)
      log.afterDeploy(self, client, template)

      return self

    }

  }

  async deployMany (
    specifier: IntoTemplate,
    contracts: DeployArgs[] = []
  ): Promise<this[]> {
    if (!this.context)            throw new ContractError.NoContext()
    if (!this.context.creator)    throw new ContractError.NoCreator()
    if (!this.context.deployment) throw new ContractError.NoDeployment()
    // Provide the template
    const template = await new Template(specifier, { context: this.context }).getOrUpload()
    // Deploy multiple contracts from the same template with 1 tx
    const creator = this.context.creator
    let instances
    try {
      instances = await this.deployVarious(contracts.map(([name, msg])=>[template, name, msg]))
    } catch (e) {
      log.deployManyFailed(e, template, contracts)
      throw e
    }
    // Return API client to each contract
    return instances.map(instance=>this.context!.creator!.getClient(this.Client, instance))
  }

  async deployVarious (
    contracts: DeployArgsTriple[] = []
  ): Promise<this[]> {
    if (!this.agent) throw new ContractError.NoAgent()
    for (const index in contracts) {
      const triple = contracts[index]
      if (triple.length !== 3) {
        throw Object.assign(
          new Error('initVarious: contracts must be [Template, Name, Message] triples'),
          { index, contract: triple }
        )
      }
    }
    return Object.values(
      await this.agent.instantiateMany(contracts.map(([template, name, initMsg]: DeployArgsTriple)=>[
        template, this.prefix ? Contract.addPrefix(this.prefix, name) : name, initMsg
      ]) as DeployArgsTriple[])
    ) as this[]
  }

  /** The Chain on which this contract exists. */
  get chain () { return this.agent?.chain }

  async fetchLabel (expected?: CodeHash): Promise<this> {
    this.assertOperational()
    const label = await this.agent!.getLabel(this.address!)
    if (!!expected) this.assertCorrect('label', expected, label)
    this.label = label
    return this
  }

  async fetchCodeHash (expected?: CodeHash): Promise<this> {
    this.assertOperational()
    const codeHash = await this.agent!.getHash(this.address!)
    if (!!expected) this.assertCorrect('codeHash', expected, codeHash)
    this.codeHash = codeHash
    return this
  }

  async fetchCodeId (expected?: CodeHash): Promise<this> {
    this.assertOperational()
    const codeId = await this.agent!.getCodeId(this.address!)
    if (!!expected) this.assertCorrect('codeId', expected, codeId)
    this.codeId = codeId
    return this
  }

  /** Throw if fetched metadata differs from configured. */
  assertCorrect (kind: string, expected: any, actual: any) {
    const name = this.constructor.name
    if (expected !== actual) {
      throw new Error(`Wrong ${kind}: ${name} was passed ${expected} but fetched ${actual}`)
    }
  }

  /** Fetch the label, code ID, and code hash from the Chain.
    * You can override this method to populate custom contract info from the chain on your client,
    * e.g. fetch the symbol and decimals of a token contract. */
  async populate (): Promise<this> {
    this.assertOperational()
    await Promise.all([this.fetchLabel(), this.fetchCodeId(), this.fetchCodeHash()])
    return this
  }

}

export interface ContractCtor<C extends Contract, O extends Partial<Contract>> {
  new (agent?: Executor, address?: Address, hash?: CodeHash): C
  new (agent?: Executor, options?: Partial<Contract>): C
}

/** Reference to an instantiated smart contract in the format of Fadroma ICC. */
export interface ContractLink {
  readonly address:   Address
  readonly code_hash: CodeHash
}

/** Pair of name and init message. Used when instantiating multiple contracts from one template. */
export type DeployArgs = [Name, Message]

export interface UploadInitContext {
  creator?: Agent
  deployment?: {
    has      (name: string): boolean
    get      (name: string): Contract
    initMany (creator: Executor, template: Template, contracts: DeployArgs[]): Promise<Contract[]>
  }
  task?: {
    subtask <C> (cb: ()=>(C|Promise<C>)): Promise<C>
  }
}

/** Instantiates multiple contracts of the same type in one transaction.
  * For instantiating different types of contracts in 1 tx, see deployment.initVarious */
export class Contracts<C extends Contract> {

  constructor (
    _Contract: ContractCtor<C, any> = Contract as ContractCtor<C, any>,
    public readonly context?: UploadInitContext,
  ) {
    this.Contract = _Contract
  }

  public readonly Contract: ContractCtor<C, any>
}

/** A moment in time. */
export type Moment   = number

/** A period of time. */
export type Duration = number

export class ContractError extends CustomError {
  static Empty = this.define('Empty',
    () => "Tried to create ContractSlot with nullish value")
  static CantFind = this.define('CantFindContract',
    (name: string) => `No deployment, can't find contract by name: ${name}`)
  static NotFound = this.define('NotFound',
    (prefix: string, name: string) => `Contract ${name} not found in deployment ${prefix}`)
  static NotFound2 = this.define('NotFound2',
    () => "Contract not found. Try .getOrDeploy(template, init)")
  static NoAgent = this.define('NoUploadInitContext',
    () => "Missing execution agent.")
  static NoContext = this.define('NoUploadInitContext',
    () => "Missing deploy context.")
  static NoCreator = this.define('NoContractCreator',
    () => "Missing creator.")
  static NoDeployment = this.define("NoDeployment",
    () => "Missing deployment.")
  static InvalidValue = this.define("InvalidContractValue",
    () => "Value is not Client and not a name.")
  static NoName = this.define("NoContractName",
    () => "No name.")
  static DeployManyFailed = this.define('DeployManyFailed',
    (e: any) => 'Deploy of multiple contracts failed. ' + e?.message??'')
}

/** Bundle is an alternate executor that collects collects messages to broadcast
  * as a single transaction in order to execute them simultaneously. For that, it
  * uses the API of its parent Agent. You can use it in scripts with:
  *   await agent.bundle().wrap(async bundle=>{ client.as(bundle).exec(...) })
  * */
export abstract class Bundle implements Executor {

  constructor (readonly agent: Agent) {}

  depth  = 0

  Bundle = this.constructor

  bundle (): this {
    console.warn('Nest bundles with care. Depth:', ++this.depth)
    return this
  }

  get chain        () { return this.agent.chain            }

  get address      () { return this.agent.address          }

  get name         () { return `${this.agent.name}@BUNDLE` }

  get fees         () { return this.agent.fees             }

  get defaultDenom () { return this.agent.defaultDenom     }

  getCodeId (address: Address) { return this.agent.getCodeId(address) }

  getLabel  (address: Address) { return this.agent.getLabel(address)  }

  getHash   (address: Address|number) { return this.agent.getHash(address)   }

  checkHash (address: Address, codeHash?: CodeHash) {
    return this.agent.checkHash(address, codeHash)
  }

  get balance () {
    throw new Error("don't query inside bundle")
    return Promise.resolve('0')
  }

  async getBalance (denom: string) {
    throw new Error("can't get balance in bundle")
    return Promise.resolve(denom)
  }

  get height (): Promise<number> {
    throw new Error("don't query block height inside bundle")
  }

  get nextBlock (): Promise<number> {
    throw new Error("can't wait for next block inside bundle")
  }

  async send (to: Address, amounts: ICoin[], opts?: ExecOpts): Promise<void|unknown> {
    throw new Error("Bundle#send: not implemented")
  }

  async sendMany (outputs: [Address, ICoin[]][], opts?: ExecOpts): Promise<void|unknown> {
    throw new Error("Bundle#sendMany: not implemented")
  }

  async instantiate (
    template: Template, label: Label, msg: Message, funds = []
  ): Promise<Contract> {
    const init = {
      sender:   this.address,
      codeId:   String(template.codeId),
      codeHash: template.codeHash,
      label,
      msg,
      funds
    }
    this.add({ init })
    const { codeId, codeHash } = template
    // @ts-ignore
    return { chainId: this.agent.chain.id, codeId, codeHash, address: null }
  }

  async instantiateMany (configs: [Template, Label, Message][]): Promise<Contract[]> {
    return await Promise.all(configs.map(([template, label, initMsg])=>
      this.instantiate(template, label, initMsg)
    ))
  }

  async execute (
    instance: Partial<Contract>,
    msg:      Message,
    { send }: ExecOpts = {}
  ): Promise<this> {
    this.add({
      exec: {
        sender:   this.address,
        contract: instance.address,
        codeHash: instance.codeHash,
        msg,
        funds: send
      }
    })
    return this
  }

  /** Queries are disallowed in the middle of a bundle because
    * even though the bundle API is structured as multiple function calls,
    * the bundle is ultimately submitted as a single transaction and
    * it doesn't make sense to query state in the middle of that. */
  async query <U> (contract: Client, msg: Message): Promise<U> {
    throw new Error("don't query inside bundle")
  }

  /** Uploads are disallowed in the middle of a bundle because
    * it's easy to go over the max request size, and
    * difficult to know what that is in advance. */
  //@ts-ignore
  async upload (code: Uint8Array) {
    throw new Error("don't upload inside bundle")
  }

  /** Uploads are disallowed in the middle of a bundle because
    * it's easy to go over the max request size, and
    * difficult to know what that is in advance. */
  //@ts-ignore
  async uploadMany (code: Uint8Array[]) {
    throw new Error("don't upload inside bundle")
  }

  getClient <C extends Client> (
    Client: NewClient<C>, specifier: Address|Partial<C>, codeHash?: CodeHash
  ): C {
    if (typeof specifier === 'string') specifier = { address: specifier } as Partial<C>
    return new Client({ ...specifier, codeHash }).as(this)
  }

  id = 0

  msgs: any[] = []

  add (msg: Message) {
    const id = this.id++
    this.msgs[id] = msg
    return id
  }

  async wrap (
    cb:   BundleCallback<this>,
    opts: ExecOpts = { memo: "" },
    save: boolean  = false
  ): Promise<any[]> {
    await cb(this)
    return this.run(opts.memo, save)
  }

  run (memo = "", save: boolean = false): Promise<any> {
    if (this.depth > 0) {
      console.warn('Unnesting bundle. Depth:', --this.depth)
      this.depth--
      //@ts-ignore
      return null
    } else {
      if (save) {
        return this.save(memo)
      } else {
        return this.submit(memo)
      }
    }
  }

  assertCanSubmit (): true {
    if (this.msgs.length < 1) throw new Error('Trying to submit bundle with no messages')
    return true
  }

  /** Broadcast a bundle to the chain. */
  abstract submit (memo: string): Promise<unknown>

  /** Save a bundle for manual broadcast. */
  abstract save   (name: string): Promise<unknown>

}

export interface BundleCtor<B extends Bundle> {
  new (agent: Agent): B
}

/** Function passed to Bundle#wrap */
export type BundleCallback<B extends Bundle> = (bundle: B)=>Promise<void>

//@ts-ignore
Chain.Agent = Agent as AgentCtor<Agent>

//@ts-ignore
Agent.Bundle = Bundle

export const log = {
  beforeDeploy (contract: Contract, template: Template) {
    console.info(
      'Deploy   ',    bold(contract.name!),
      'from code id', bold(String(template.codeId  ||'(unknown)')),
      'hash',         bold(String(template.codeHash||'(unknown)'))
    )
  },
  afterDeploy (contract: Contract, client: Contract, template: Template) {
    console.info(
      'Deployed ',    bold(contract.name!), 'is', bold(client.address!),
      'from code id', bold(String(template.codeId  ||'(unknown)'))
    )
  }
}
