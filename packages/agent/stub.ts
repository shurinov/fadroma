/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import { assign, Console, Error, base16, SHA256, randomBech32 } from './core'
import type { ChainId, Message, Label, TxHash } from './chain'
import { Connection, Agent, Block, Backend } from './chain'
import type { Address } from './identity'
import { Identity } from './identity'
import { Batch } from './tx'
import type { Transaction } from './tx'
import type { CodeHash } from './program.browser'
import { Compiler, SourceCode, CompiledCode } from './program.browser'
import type { CodeId } from './deploy'
import { UploadedCode, ContractInstance } from './deploy'
import * as Token from './token'

export class StubBlock extends Block {
  async getTransactionsById (): Promise<Record<string, Transaction>> {
    return {}
  }
  async getTransactionsInOrder (): Promise<Transaction[]> {
    return []
  }
}

export class StubConnection extends Connection {
  static gasToken: Token.Native = new Token.Native('ustub')

  backend: StubBackend

  constructor (properties: Partial<StubConnection> = {}) {
    super(properties)
    assign(this, properties, ['backend'])
    this.backend ??= new StubBackend()
  }
  batch (): Batch<this, StubAgent> {
    return new StubBatch({ connection: this }) as unknown as Batch<this, StubAgent>
  }
  protected fetchHeightImpl () {
    return this.fetchBlockInfoImpl().then(({height})=>height)
  }
  protected fetchBlockInfoImpl () {
    return Promise.resolve(new StubBlock({ height: + new Date() }))
  }
  protected fetchCodesImpl () {
    return Promise.resolve(Object.fromEntries(
      [...this.backend.uploads.entries()].map(
        ([key, val])=>[key, new UploadedCode(val)]
      )
    ))
  }
  protected fetchBalanceImpl (token?: string, address?: string): Promise<string> {
    token ??= this.defaultDenom
    const balance = (this.backend.balances.get(address!)||{})[token] ?? 0
    return Promise.resolve(String(balance))
  }
  protected async getCodeIdImpl (address: Address): Promise<CodeId> {
    const contract = this.backend.instances.get(address)
    if (!contract) {
      throw new Error(`unknown contract ${address}`)
    }
    return contract.codeId
  }
  protected fetchContractsByCodeIdImpl (id: CodeId) {
    return Promise.resolve([...this.backend.uploads.get(id)!.instances]
      .map(address=>({address})))
  }
  protected fetchCodeHashOfAddressImpl (address: Address): Promise<CodeHash> {
    return this.getCodeId(address)
      .then(id=>this.getCodeHashOfCodeId(id))
  }
  protected fetchCodeHashOfCodeIdImpl (id: CodeId): Promise<CodeHash> {
    const code = this.backend.uploads.get(id)
    if (!code) {
      throw new Error(`unknown code ${id}`)
    }
    return Promise.resolve(code.codeHash)
  }
  protected fetchCodeIdImpl (options: string): Promise<string> {
    throw new Error('unimplemented!')
  }
  protected fetchCodeInfoImpl (options): Promise<Record<string, UploadedCode>> {
    throw new Error('unimplemented!')
  }
  protected fetchContractInfoImpl (): Promise<unknown> {
    throw new Error('unimplemented!')
  }
  protected fetchCodeInstancesImpl (id: CodeId): Promise<Iterable<{ address: Address }>> {
    throw new Error('unimplemented!')
  }
  protected queryImpl <Q> (contract: { address: Address }, message: Message): Promise<Q> {
    return Promise.resolve({} as Q)
  }
  authenticate (identity: Identity): StubAgent {
    return new StubAgent({ connection: this, identity })
  }
}

export class StubAgent extends Agent {
  declare connection: StubConnection
  protected sendImpl (recipient: Address, sums: Token.ICoin[], opts?: never): Promise<void> {
    if (!this.address) {
      throw new Error('not authenticated')
    }
    const { backend } = this.connection
    const senderBalances = { ...backend.balances.get(this.address) || {}}
    const recipientBalances = { ...backend.balances.get(recipient) || {}}
    for (const sum of sums) {
      if (!Object.keys(senderBalances).includes(sum.denom)) {
        throw new Error(`sender has no balance in ${sum.denom}`)
      }
      const amount = BigInt(sum.amount)
      if (senderBalances[sum.denom] < amount) {
        throw new Error(
          `sender has insufficient balance in ${sum.denom}: ${senderBalances[sum.denom]} < ${amount}`
        )
      }
      senderBalances[sum.denom] =
        senderBalances[sum.denom] - amount
      recipientBalances[sum.denom] =
        (recipientBalances[sum.denom] ?? BigInt(0)) + amount
    }
    backend.balances.set(this.address, senderBalances)
    backend.balances.set(recipient, recipientBalances)
    return Promise.resolve()
  }
  protected sendManyImpl (outputs: [Address, Token.ICoin[]][], opts?: never): Promise<void> {
    return Promise.resolve()
  }
  protected async uploadImpl (codeData: Uint8Array): Promise<UploadedCode> {
    return new UploadedCode(await this.connection.backend.upload(codeData))
  }
  protected async instantiateImpl (
    codeId: CodeId, options: Parameters<Agent["instantiateImpl"]>[1]
  ): Promise<ContractInstance & { address: Address }> {
    return new ContractInstance(await this.connection.backend.instantiate(
      this.address!, codeId, options
    )) as ContractInstance & {
      address: Address
    }
  }
  protected executeImpl (
    contract: { address: Address, codeHash: CodeHash },
    message:  Message,
    options?: Parameters<Agent["executeImpl"]>[2]
  ): Promise<void|unknown> {
    return Promise.resolve({})
  }
}

type StubAccount = {
  address: Address,
  mnemonic?: string
}

type StubBalances = Record<string, bigint>

type StubUpload = {
  chainId: ChainId,
  codeId: CodeId,
  codeHash: CodeHash,
  codeData: Uint8Array,
  instances: Set<Address>
}

type StubInstance = {
  codeId: CodeId,
  address: Address,
  creator: Address
}

export type {
  StubAccount  as Account,
  StubBalances as Balances,
  StubUpload   as Upload,
  StubInstance as Instance,
}

export class StubBackend extends Backend {
  gasToken   = new Token.Native('ustub')
  prefix     = 'stub1'
  chainId    = 'stub'
  url        = 'http://stub'
  alive      = true
  lastCodeId = 0
  accounts   = new Map<string, StubAccount>()
  balances   = new Map<Address, StubBalances>()
  uploads    = new Map<CodeId, StubUpload>()
  instances  = new Map<Address, StubInstance>()

  constructor (properties?: Partial<StubBackend & {
    genesisAccounts: Record<string, string|number>
  }>) {
    super(properties as Partial<Backend>)
    assign(this, properties, [
      "chainId", "lastCodeId", "uploads", "instances", "gasToken", "prefix"
    ])
    for (const [name, balance] of Object.entries(properties?.genesisAccounts||{})) {
      const address = randomBech32(this.prefix)
      const balances = this.balances.get(address) || {}
      balances[this.gasToken.denom] = BigInt(balance)
      this.balances.set(address, balances)
      this.accounts.set(name, { address })
    }
  }

  async connect ():
    Promise<Connection>
  async connect (parameter: string|Partial<Identity & { mnemonic?: string }>):
    Promise<Agent>
  async connect (parameter: string|Partial<Identity & { mnemonic?: string }> = {}): Promise<unknown> {
    if (typeof parameter === 'string') {
      parameter = await this.getIdentity(parameter)
    }
    if (parameter.mnemonic && !parameter.address) {
      parameter.address = `${this.prefix}${parameter.name}`
    }
    return new StubConnection({
      chainId:  this.chainId,
      url:      'stub',
      alive:    this.alive,
      backend:  this,
    }).authenticate(new Identity(parameter))
  }

  getIdentity (name: string): Promise<Identity> {
    return Promise.resolve(new Identity({
      name,
      ...this.accounts.get(name)
    }))
  }

  start (): Promise<this> {
    this.alive = true
    return Promise.resolve(this)
  }

  pause (): Promise<this> {
    this.alive = false
    return Promise.resolve(this)
  }

  import (...args: unknown[]): Promise<unknown> {
    throw new Error("StubChainState#import: not implemented")
  }

  export (...args: unknown[]): Promise<unknown> {
    throw new Error("StubChainState#export: not implemented")
  }

  async upload (codeData: Uint8Array) {
    this.lastCodeId++
    const codeId = String(this.lastCodeId)
    const chainId = this.chainId
    const codeHash = base16.encode(SHA256(codeData)).toLowerCase()
    const upload = { codeId, chainId, codeHash, codeData, instances: new Set<string>() }
    this.uploads.set(codeId, upload)
    return upload
  }

  async instantiate (
    creator: Address, codeId: CodeId, options: unknown
  ): Promise<Partial<ContractInstance> & {
    address: Address
  }> {
    const address = randomBech32(this.prefix)
    const code = this.uploads.get(codeId)
    if (!code) {
      throw new Error(`invalid code id ${codeId}`)
    }
    code.instances.add(address)
    this.instances.set(address, { address, codeId, creator })
    return { address, codeId }
  }

  async execute (...args: unknown[]): Promise<unknown> {
    throw new Error('not implemented')
  }
}

export class StubBatch extends Batch<StubConnection, StubAgent> {
  messages: object[] = []

  upload (...args: Parameters<StubAgent["upload"]>) {
    this.messages.push({ instantiate: args })
    return this
  }

  instantiate (...args: Parameters<StubAgent["instantiate"]>) {
    this.messages.push({ instantiate: args })
    return this
  }

  execute (...args: Parameters<StubAgent["execute"]>) {
    this.messages.push({ execute: args })
    return this
  }

  async submit () {
    this.log.debug('Submitted batch:\n ', this.messages
      .map(x=>Object.entries(x)[0].map(x=>JSON.stringify(x)).join(': '))
      .join('\n  '))
    return this.messages
  }
}

/** A compiler that does nothing. Used for testing. */
export class StubCompiler extends Compiler {
  caching = false

  id = 'stub'

  log = new Console('StubCompiler')

  async build (
    source: string|Partial<SourceCode>, ...args: any[]
  ): Promise<CompiledCode> {
    return new CompiledCode({
      codePath: 'stub',
      codeHash: 'stub',
    })
  }
}
