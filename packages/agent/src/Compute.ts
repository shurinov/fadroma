/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import {
  Console,
  Logged,
  SHA256,
  assign,
  base16,
  bold,
  hideProperties, 
  timestamp,
} from './Util'
import type {
  Address,
  Agent,
  Chain,
  ChainId,
  CodeId,
  Connection,
  Into,
  Label,
  Message,
  Name,
  Store,
  Token,
  TxHash,
} from '../index'

/** Represents a particular instance of a smart contract.
  *
  * Subclass this to add custom query and transaction methods corresponding
  * to the contract's API. */
export class Contract extends Logged {
  /** Connection to the chain on which this contract is deployed. */
  chain?:      Chain
  /** Connection to the chain on which this contract is deployed. */
  agent?:      Agent
  /** Code upload from which this contract is created. */
  codeId?:     CodeId
  /** The code hash uniquely identifies the contents of the contract code. */
  codeHash?:   CodeHash
  /** The address uniquely identifies the contract instance. */
  address?:    Address
  /** The label is a human-friendly identifier of the contract. */
  label?:      Label
  /** The address of the account which instantiated the contract. */
  initBy?:     Address

  constructor (properties: Partial<Contract>) {
    super((typeof properties === 'string')?{}:properties)
    if (typeof properties === 'string') {
      properties = { address: properties }
    }
    assign(this, properties, [
      'chain',
      'agent',
      'codeId',
      'codeHash',
      'address',
      'label',
      'initBy'
    ])
  }

  /** Execute a query on the specified instance as the specified Connection. */
  query <Q> (message: Message): Promise<Q> {
    if (!this.chain) {
      throw new Error("can't query instance without connection")
    }
    if (!this.address) {
      throw new Error("can't query instance without address")
    }
    return this.chain.query<Q>(this as { address }, message)
  }

  /** Execute a transaction on the specified instance as the specified Connection. */
  execute (message: Message, options: Parameters<Agent["execute"]>[2] = {}): Promise<unknown> {
    if (!this.chain) {
      throw new Error("can't transact with instance without connection")
    }
    if (!this.agent?.execute) {
      throw new Error("can't transact with instance without authorizing the connection")
    }
    if (!this.address) {
      throw new Error("can't transact with instance without address")
    }
    return this.agent?.execute(this as { address }, message, options)
  }
}

/** Represents a contract's code in all its forms, and the contract's lifecycle
  * up to and including uploading it, but not instantiating it. */
export class ContractCode extends Logged {
  source?:   SourceCode
  compiler?: Compiler
  compiled?: CompiledCode
  uploader?: Agent|Address
  uploaded?: UploadedCode
  deployer?: Agent|Address

  constructor (properties?: Partial<ContractCode>) {
    super(properties)
    assign(this, properties, [
      'source', 'compiler', 'compiled', 'uploader', 'uploaded', 'deployer'
    ])
  }

  /** Compile this contract.
    *
    * If a valid binary is present and a rebuild is not requested,
    * this does not compile it again, but reuses the binary. */
  async compile ({
    compiler = this.compiler,
    rebuild  = false,
    ...buildOptions
  }: {
    compiler?: Compiler
    rebuild?: boolean
  } = {}): Promise<CompiledCode & Parameters<Compiler["build"]>[1] & {
    codeHash: CodeHash
  }> {
    if (this.compiled?.canUpload && !rebuild) {
      return Promise.resolve(
        this.compiled as typeof this["compiled"] & { codeHash: CodeHash }
      )
    }
    if (!compiler) {
      throw new Error("can't compile: no compiler")
    }
    if (!this.source) {
      throw new Error(`can't compile: no source`)
    }
    if (!this.source.canCompile) {
      throw new Error(`can't compile: ${this.source.canCompileInfo??'unspecified reason'}`)
    }
    const compiled = await compiler.build(this.source, buildOptions)
    if (!compiled.canUpload) {
      throw new Error("build failed")
    }
    return this.compiled = compiled as typeof compiled & { codeHash: CodeHash }
  }

  /** Upload this contract.
    *
    * If a valid binary is not present, compile it first.
    *
    * If a valid code ID is present and reupload is not requested,
    * this does not upload it again, but reuses the code ID.
    *
    * If a valid binary is not present, but valid source is present,
    * this compiles the source code first to obtain a binary. */
  async upload ({
    compiler = this.compiler,
    rebuild  = false,
    uploader = this.uploader,
    reupload = rebuild,
    ...uploadOptions
  }: Parameters<this["compile"]>[0] & Parameters<Agent["upload"]>[1] & {
    uploader?: Address|{ upload: Agent["upload"] }
    reupload?: boolean,
  } = {}): Promise<UploadedCode & {
    codeId: CodeId
  }> {
    if (this.uploaded?.canInstantiate && !reupload && !rebuild) {
      return this.uploaded as typeof uploaded & { codeId: CodeId }
    }
    if (!uploader || (typeof uploader === 'string')) {
      throw new Error("can't upload: no uploader agent")
    }
    const compiled = await this.compile({ compiler, rebuild })
    const uploaded = await uploader.upload(compiled, uploadOptions)
    if (!uploaded.canInstantiate) {
      throw new Error("upload failed")
    }
    return this.uploaded = uploaded
  }
}

/** Represents a contract's code, in binary form, uploaded to a given chain. */
export class UploadedCode {
  /** Code hash uniquely identifying the compiled code. */
  codeHash?:  CodeHash
  /** ID of chain on which this contract is uploaded. */
  chainId?:   ChainId
  /** Code ID representing the identity of the contract's code on a specific chain. */
  codeId?:    CodeId
  /** TXID of transaction that performed the upload. */
  uploadTx?:  TxHash
  /** address of agent that performed the upload. */
  uploadBy?:  Address
  /** address of agent that performed the upload. */
  uploadGas?: string|number

  constructor (properties: Partial<UploadedCode> = {}) {
    assign(this, properties, [
      'codeHash', 'chainId', 'codeId', 'uploadTx', 'uploadBy', 'uploadGas',
    ])
  }

  get [Symbol.toStringTag] () {
    return [
      this.codeId   || 'no code id',
      this.chainId  || 'no chain id',
      this.codeHash || '(no code hash)'
    ].join('; ')
  }

  serialize (): {
    codeHash?:     CodeHash
    chainId?:      ChainId
    codeId?:       CodeId
    uploadTx?:     TxHash
    uploadBy?:     Address
    uploadGas?:    string|number
    uploadInfo?:   string
    [key: string]: unknown
  } {
    let { codeHash, chainId, codeId, uploadTx, uploadBy, uploadGas } = this
    if ((typeof this.uploadBy === 'object')) {
      uploadBy = (uploadBy as any).identity?.address
    }
    return { codeHash, chainId, codeId, uploadTx, uploadBy: uploadBy as string, uploadGas }
  }

  get canInstantiate (): boolean {
    return !!(this.chainId && this.codeId)
  }

  get canInstantiateInfo (): string|undefined {
    return (
      (!this.chainId) ? "can't instantiate: no chain id" :
      (!this.codeId)  ? "can't instantiate: no code id"  :
      undefined
    )
  }
}

/** A contract that is part of a deploment.
  * - needed for deployment-wide deduplication
  * - generates structured label */
export class DeploymentUnit extends ContractCode {
  /** Name of this unit. */
  name?:       string
  /** Deployment to which this unit belongs. */
  deployment?: Deployment
  /** Code hash uniquely identifying the compiled code. */
  codeHash?:   CodeHash
  /** Code ID representing the identity of the contract's code on a specific chain. */
  chainId?:    ChainId
  /** Code ID representing the identity of the contract's code on a specific chain. */
  codeId?:     CodeId

  constructor (
    properties: ConstructorParameters<typeof ContractCode>[0] & Partial<DeploymentUnit> = {}
  ) {
    super(properties)
    assign(this, properties, [
      'name', 'deployment', 'isTemplate', 'codeHash', 'chainId', 'codeId', 
    ] as any)
  }

  serialize () {
    const { name, codeHash, chainId, codeId } = this
    return { name, codeHash, chainId, codeId }
  }
}

export class ContractTemplate extends DeploymentUnit {
  readonly isTemplate = true
  /** Create a new instance of this contract. */
  contract (
    name: Name, parameters?: Partial<ContractInstance>
  ): ContractInstance {
    return new ContractInstance({ ...this, name, ...parameters||{} })
  }
  /** Create multiple instances of this contract. */
  contracts (
    instanceParameters: Record<Name, Parameters<ContractTemplate["contract"]>[1]> = {}
  ): Record<keyof typeof instanceParameters, ContractInstance> {
    const instances: Record<keyof typeof instanceParameters, ContractInstance> = {}
    for (const [name, parameters] of Object.entries(instanceParameters)) {
      instances[name] = this.contract(name, parameters)
    }
    return instances
  }
}

export class ContractInstance extends DeploymentUnit {
  readonly isTemplate = false
  /** Full label of the instance. Unique for a given chain. */
  label?:    Label
  /** Address of this contract instance. Unique per chain. */
  address?:  Address
  /** Contents of init message. */
  initMsg?:  Into<Message>
  /** Address of agent that performed the init tx. */
  initBy?:   Address
  /** Native tokens to send to the new contract. */
  initSend?: Token.ICoin[]
  /** Fee to use for init. */
  initFee?:  unknown
  /** Instantiation memo. */
  initMemo?: string
  /** ID of transaction that performed the init. */
  initTx?:   TxHash
  /** Contents of init message. */
  initGas?:  unknown

  constructor (
    properties?: ConstructorParameters<typeof DeploymentUnit>[0] & Partial<ContractInstance>
  ) {
    super(properties)
    assign(this, properties, [
      'label', 'address',
      'initMsg', 'initBy', 'initSend', 'initFee', 'initMemo', 'initTx', 'initGas'
    ])
  }

  async deploy ({
    deployer = this.deployer,
    redeploy = false,
    uploader = this.uploader||deployer,
    reupload = false,
    compiler = this.compiler,
    rebuild  = false,
    ...initOptions
  }: Parameters<this["upload"]>[0] & Parameters<Agent["instantiate"]>[1] & {
    deployer?: Address|{ instantiate: Agent["instantiate"] }
    redeploy?: boolean
  } = {}): Promise<ContractInstance & {
    address: Address
  }> {
    if (this.isValid() && !redeploy && !reupload && !rebuild) {
      return this
    }
    if (!deployer || (typeof deployer === 'string')) {
      throw new Error("can't deploy: no deployer agent")
    }
    const uploaded = await this.upload({
      compiler, rebuild, uploader, reupload
    })
    const instance = await deployer.instantiate(uploaded, this)
    if (!instance.isValid()) {
      throw new Error("init failed")
    }
    return instance
  }

  serialize () {
    const { label, address, initMsg, initBy, initSend, initFee, initMemo, initTx, initGas } = this
    return {
      ...super.serialize(),
      label, address, initMsg, initBy, initSend, initFee, initMemo, initTx, initGas
    }
  }

  /** Returns a client to this contract instance. */
  connect (agent?: Agent):
    Contract
  connect <C extends typeof Contract> (
    agent?: Agent, $C: C = Contract as C
  ) {
    return new $C({
      ...this,
      agent,
    })
  }

  isValid (): this is ContractInstance & { address: Address } {
    return !!this.address
  }
}

export type DeploymentState = Partial<ReturnType<Deployment["serialize"]>>

/** A collection of contracts. */
export class Deployment extends Map<Name, DeploymentUnit> {
  log = new Console('Deployment')

  name: string = timestamp()

  static fromSnapshot ({ name, units = {} }: DeploymentState) {
    const deployment = new this({ name })
    for (const [key, value] of Object.entries(units)) {
      deployment.set(key, value)
    }
    return deployment
  }

  constructor (properties: Partial<Deployment> = {}) {
    super()
    assign(this, properties, [ 'name' ])
    this.name ??= timestamp()
    this.log.label = `deployment(${bold(this.name)})`
  }

  serialize () {
    const units: Record<Name, ReturnType<DeploymentUnit["serialize"]>> = {}
    for (const [key, value] of this.entries()) {
      units[key] = value.serialize()
    }
    return { name: this.name, units: Object.fromEntries(this.entries()) }
  }

  set (name: string, unit: DeploymentUnit): this {
    if (!(unit instanceof DeploymentUnit)) {
      throw new Error('a Deployment can only contain instances of DeploymentUnit')
    }
    return super.set(name, unit)
  }

  /** Define a template, representing code that can be compiled
    * and uploaded, but will not be automatically instantiated.
    * This can then be used to define multiple instances of
    * the same code. */
  template (name: string, properties?:
    (
      |({ language: 'rust' } & Partial<RustSourceCode>)
      |({ language?: undefined } & Partial<SourceCode>)
    )&
    Partial<CompiledCode> &
    Partial<UploadedCode>
  ): ContractTemplate {
    const source =
      properties?.language === 'rust' ? new RustSourceCode(properties)
        : new SourceCode(properties)
    const compiled = new CompiledCode(properties)
    const uploaded = new UploadedCode(properties)
    const unit = new ContractTemplate({
      deployment: this, name, source, compiled, uploaded
    })
    hideProperties(unit, 'name', 'deployment', 'isTemplate')
    this.set(name, unit)
    return unit
  }

  /** Define a contract that will be automatically compiled, uploaded,
    * and instantiated as part of this deployment. */ 
  contract (name: string, properties?:
    (
      |({ language: 'rust' } & Partial<RustSourceCode>)
      |({ language?: undefined } & Partial<SourceCode>)
    )&
    Partial<CompiledCode> &
    Partial<UploadedCode> &
    Partial<ContractInstance>
  ): ContractInstance {
    const source =
      properties?.language === 'rust' ? new RustSourceCode(properties)
        : new SourceCode(properties)
    const compiled = new CompiledCode(properties)
    const uploaded = new UploadedCode(properties)
    const unit = new ContractInstance({
      deployment: this, name, source, compiled, uploaded, ...properties
    })
    hideProperties(unit, 'name', 'deployment', 'isTemplate')
    this.set(name, unit)
    return unit
  }

  addContract (...args: Parameters<this["contract"]>) {
    this.contract(
      //@ts-ignore
      ...args
    )
    return this
  }

  addContracts (...args: Parameters<this["template"]>) {
    this.template(
      //@ts-ignore
      ...args
    )
    return this
  }

  async build ({ units = [...this.keys()], ...options }: Parameters<ContractCode["compile"]>[0] & {
    units?: Name[]
  } = {}):
    Promise<Record<CodeHash, CompiledCode & { codeHash: CodeHash }>>
  {
    const toCompile: Array<DeploymentUnit & { source: SourceCode }> = []

    if (units && units.length > 0) {
      for (const name of units) {
        const unit = this.get(name)
        if (!unit) {
          throw new Error(`requested to build unknown unit "${unit}"`)
        }
        if (!unit.source?.canCompile && unit.compiled?.canUpload) {
          this.log.warn(`Missing source for ${bold(name)} (${unit.compiled.codeHash})`)
        } else {
          toCompile.push(unit as DeploymentUnit & { source: SourceCode })
        }
      }
    }

    const compiled = await options.compiler!.buildMany(toCompile.map(unit=>unit.source!))

    const byCodeHash: Record<CodeHash, CompiledCode & { codeHash: CodeHash }> = {}

    for (const index in compiled) {
      const output = compiled[index]
      if (!output.codeHash) {
        throw new Error('build output did not contain codeHash')
      }
      toCompile[index].compiled = output
      byCodeHash[output.codeHash] = output as CompiledCode & { codeHash: CodeHash }
    }

    return byCodeHash
  }

  async upload ({ units, ...options }: Parameters<ContractCode["upload"]>[0] & {
    units?: Name[]
    uploadStore?: Store.UploadStore
  } = {}):
    Promise<Record<CodeId, UploadedCode & { codeId: CodeId }>>
  {
    const uploading: Array<Promise<UploadedCode & { codeId: CodeId }>> = []
    for (const [name, unit] of this.entries()) {
      uploading.push(unit.upload(options))
    }
    const uploaded: Record<CodeId, UploadedCode & { codeId: CodeId }> = {}
    for (const output of await Promise.all(uploading)) {
      uploaded[output.codeId] = output
    }
    return uploaded
  }

  async deploy ({ units, ...options }: Parameters<ContractInstance["deploy"]>[0] & {
    units?: Name[],
    deployStore?: Store.DeployStore
  } = {}):
    Promise<Record<Address, ContractInstance & { address: Address }>>
  {
    const deploying: Array<Promise<ContractInstance & { address: Address }>> = []
    for (const [name, unit] of this.entries()) {
      if (unit instanceof ContractInstance) {
        deploying.push(unit.deploy(options))
      }
    }
    const deployed: Record<Address, ContractInstance & { address: Address }> = {}
    for (const output of await Promise.all(deploying)) {
      deployed[output.address] = output
    }
    return deployed
  }
}

/** The default Git ref when not specified. */
export const HEAD = 'HEAD'

/** A code hash, uniquely identifying a particular smart contract implementation. */
export type CodeHash = string

export abstract class Compiler extends Logged {
  /** Whether to enable build caching.
    * When set to false, this compiler will rebuild even when
    * binary and checksum are both present in wasm/ directory */
  caching: boolean = true

  /** Unique identifier of this compiler implementation. */
  abstract id: string

  /** Compile a source.
    * `@hackbg/fadroma` implements dockerized and non-dockerized
    * variants using its `build.impl.mjs` script. */
  abstract build (source: string|Partial<SourceCode>, ...args: unknown[]):
    Promise<CompiledCode>

  /** Build multiple sources.
    * Default implementation of buildMany is sequential.
    * Compiler classes may override this to optimize. */
  async buildMany (inputs: Partial<SourceCode>[]): Promise<CompiledCode[]> {
    const templates: CompiledCode[] = []
    for (const source of inputs) templates.push(await this.build(source))
    return templates
  }
}

/** An object representing a given source code. */
export class SourceCode extends Logged {
  /** URL pointing to Git upstream containing the canonical source code. */
  sourceOrigin?: string|URL
  /** Pointer to the source commit. */
  sourceRef?:    string
  /** Path to local checkout of the source code (with .git directory if sourceRef is set). */
  sourcePath?:   string
  /** Whether the code contains uncommitted changes. */
  sourceDirty?:  boolean

  constructor (properties: Partial<SourceCode> = {}) {
    super(properties)
    assign(this, properties, [
      'sourcePath', 'sourceOrigin', 'sourceRef', 'sourceDirty'
    ])
  }

  get [Symbol.toStringTag] () {
    return [
      this.sourcePath ? this.sourcePath : `(missing source)`,
      this.sourceOrigin && `(from ${this.sourceOrigin})`,
      this.sourceRef    && `(at ${this.sourceRef})`,
      this.sourceDirty  && `(modified)`
    ].filter(Boolean).join(' ')
  }

  serialize (): {
    sourceOrigin?: string
    sourceRef?:    string
    sourcePath?:   string
    sourceDirty?:  boolean
    [key: string]: unknown
  } {
    const { sourcePath, sourceOrigin, sourceRef, sourceDirty } = this
    return { sourcePath, sourceOrigin: sourceOrigin?.toString(), sourceRef, sourceDirty }
  }

  get canFetch (): boolean {
    return !!this.sourceOrigin
  }

  get canFetchInfo (): string|undefined {
    if (!this.sourceOrigin) return "missing sourceOrigin"
  }

  get canCompile (): boolean {
    return !!this.sourcePath || this.canFetch
  }

  get canCompileInfo (): string|undefined {
    if (!this.sourcePath) return "missing sourcePath"
  }
}

export class RustSourceCode extends SourceCode {
  /** Path to the crate's Cargo.toml under sourcePath */
  cargoToml?:      string
  /** Path to the workspace's Cargo.toml in the source tree. */
  cargoWorkspace?: string
  /** Name of crate. */
  cargoCrate?:     string
  /** List of crate features to enable during build. */
  cargoFeatures?:  string[]|Set<string>

  constructor (properties?: Partial<RustSourceCode>) {
    super(properties)
    assign(this, properties, [
      'cargoToml', 'cargoWorkspace', 'cargoCrate', 'cargoFeatures'
    ])
  }

  get [Symbol.toStringTag] () {
    return [
      this.cargoWorkspace
        ? ((this.cargoCrate ? `crate ${this.cargoCrate} from` : 'unknown crate from')
           +this.cargoWorkspace)
        : this.cargoToml,
      super[Symbol.toStringTag],
    ].filter(Boolean).join(' ')
  }

  serialize (): ReturnType<SourceCode["serialize"]> & {
    cargoWorkspace?: string
    cargoCrate?:     string
    cargoFeatures?:  string[]
    [key: string]:   unknown
  } {
    const {
      cargoToml,
      cargoWorkspace,
      cargoCrate,
      cargoFeatures
    } = this
    return {
      ...super.serialize(),
      cargoToml,
      cargoWorkspace,
      cargoCrate,
      cargoFeatures: cargoFeatures ? [...cargoFeatures] : undefined
    }
  }

  get canCompile (): boolean {
    const hasWorkspace = !!this.cargoWorkspace
    const hasCrateToml = !!this.cargoToml
    const hasCrateName = !!this.cargoCrate
    return (
      ( hasWorkspace && !hasCrateToml &&  hasCrateName) ||
      (!hasWorkspace &&  hasCrateToml && !hasCrateName)
    )
  }

  get canCompileInfo (): string|undefined {
    let result = super.canCompileInfo
    let error
    const hasWorkspace = !!this.cargoWorkspace
    const hasCrateToml = !!this.cargoToml
    const hasCrateName = !!this.cargoCrate
    if (hasWorkspace) {
      if (hasCrateToml) {
        error = "cargoWorkspace is set, cargoToml must be unset"
      }
      if (!hasCrateName) {
        error = "when cargoWorkspace is set, cargoCrate must also be set"
      }
    } else if (hasCrateToml) {
      if (hasCrateName) {
        error = "when cargoToml is set, cargoCrate must be unset"
      }
    } else {
      error = "set either cargoToml or cargoWorkspace & cargoCrate"
    }
    if (result || error) {
      return [result, error].filter(Boolean).join('; ')
    }
  }
}

/** An object representing a given compiled binary. */
export class CompiledCode {
  /** Code hash uniquely identifying the compiled code. */
  codeHash?: CodeHash
  /** Location of the compiled code. */
  codePath?: string|URL
  /** The compiled code. */
  codeData?: Uint8Array

  constructor (properties: Partial<CompiledCode> = {}) {
    assign(this, properties, [ 'codeHash', 'codePath', 'codeData' ])
  }

  get [Symbol.toStringTag] () {
    return [
      this.codePath && `${this.codePath}`,
      this.codeHash && `${this.codeHash}`,
      this.codeData && `(${this.codeData.length} bytes)`
    ].filter(Boolean).join(' ')
  }

  serialize (): {
    codeHash?: CodeHash
    codePath?: string
    [key: string]: unknown
  } {
    const { codeHash, codePath } = this
    return { codeHash, codePath: codePath?.toString() }
  }

  get canFetch (): boolean {
    return !!this.codePath
  }

  get canFetchInfo (): string|undefined {
    if (!this.codePath) {
      return "can't fetch binary: codePath is not set"
    }
  }

  get canUpload (): boolean {
    return !!this.codeData || this.canFetch
  }

  get canUploadInfo (): string|undefined {
    if (!this.codeData && this.canFetch) {
      return "uploading will fetch the binary from the specified path"
    }
    if (this.codeData && !this.codePath) {
      return "uploading from buffer, codePath is unspecified"
    }
  }

  async fetch (): Promise<Uint8Array> {
    const console = new Console(`CompiledCode(${bold(this[Symbol.toStringTag])})`)
    if (this.codeData) {
      console.debug("not fetching: codeData found; unset to refetch")
      return this.codeData
    }
    if (!this.codePath) {
      throw new Error("can't fetch: missing codePath")
    }
    this.codeData = await this.fetchImpl()
    if (this.codeHash) {
      const hash0 = String(this.codeHash).toLowerCase()
      const hash1 = CompiledCode.toCodeHash(this.codeData)
      if (hash0 !== hash1) {
        throw new Error(`code hash mismatch: expected ${hash0}, computed ${hash1}`)
      }
    } else {
      this.codeHash = CompiledCode.toCodeHash(this.codeData)
      console.warn(
        "\n  TOFU: Computed code hash from fetched data:" +
        `\n  ${bold(this.codeHash)}` +
        '\n  Pin the expected code hash by setting the codeHash property.')
    }
    return this.codeData
  }

  protected async fetchImpl () {
    if (!this.codePath) {
      throw new Error("can't fetch: codePath not set")
    }
    const request = await fetch(this.codePath!)
    const response = await request.arrayBuffer()
    return new Uint8Array(response)
  }

  /** Compute the code hash if missing; throw if different. */
  async computeHash (): Promise<this & { codeHash: CodeHash }> {
    const hash = CompiledCode.toCodeHash(await this.fetch())
    if (this.codeHash) {
      if (this.codeHash.toLowerCase() !== hash.toLowerCase()) {
        throw new Error(`computed code hash ${hash} did not match preexisting ${this.codeHash}`)
      }
    } else {
      this.codeHash = hash
    }
    return this as this & { codeHash: CodeHash }
  }

  static toCodeHash (data: Uint8Array): string {
    return base16.encode(SHA256(data)).toLowerCase()
  }
}

