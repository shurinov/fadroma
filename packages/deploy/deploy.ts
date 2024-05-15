/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/

import {
  Console, Logged, assign, bold, hideProperties, timestamp,
  SourceCode, RustSourceCode,
  CompiledCode,
  UploadStore, UploadedCode,
  Contract,
} from '@hackbg/fadroma'
import type {
  Name, CodeId, CodeHash, Address, Agent, ChainId, Label, Into, Token, TxHash, Compiler, Message
} from '@hackbg/fadroma'

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
    this.contract.apply(this, args)
    return this
  }

  addContracts (...args: Parameters<this["template"]>) {
    this.template.apply(this, args)
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
        if (!unit.source?.status().canCompile && unit.compiled?.status().canUpload) {
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
      toCompile[Number(index)].compiled = output
      byCodeHash[output.codeHash] = output as CompiledCode & { codeHash: CodeHash }
    }

    return byCodeHash
  }

  async upload ({ units, ...options }: Parameters<ContractCode["upload"]>[0] & {
    units?: Name[]
    uploadStore?: UploadStore
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
    deployStore?: DeployStore
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

export type DeploymentState = Partial<ReturnType<Deployment["serialize"]>>

/** A deploy store collects receipts corresponding to individual instances of Deployment,
  * and can create Deployment objects with the data from the receipts. */
export class DeployStore extends Map<Name, DeploymentState> {
  log = new Console(this.constructor.name)

  constructor () {
    super()
  }

  selected?: DeploymentState = undefined

  get (name?: Name): DeploymentState|undefined {
    if (arguments.length === 0) {
      return this.selected
    }
    return super.get(name!)
  }

  set (name: Name, state: Partial<Deployment>|DeploymentState): this {
    if (state instanceof Deployment) state = state.serialize()
    return super.set(name, state)
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
    if (this.compiled?.status().canUpload && !rebuild) {
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
    if (!this.source.status().canCompile) {
      throw new Error(`can't compile: ${this.source.status().canCompileInfo??'unspecified reason'}`)
    }
    const compiled = await compiler.build(this.source, buildOptions)
    if (!compiled.status().canUpload) {
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

