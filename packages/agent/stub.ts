/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import { assign, Console, Error, base16, SHA256, randomBech32 } from './core'
import type { ChainId, Message, Label, TxHash } from './chain'
import { Connection, Agent, Block, Backend, Contract } from './chain'
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

  batch (): Batch<StubConnection, StubAgent> {
    return new StubBatch({ connection: this }) as unknown as Batch<StubConnection, StubAgent>
  }

  protected override fetchHeightImpl () {
    return this.fetchBlockImpl().then(({height})=>height)
  }

  protected override fetchBlockImpl () {
    return Promise.resolve(new StubBlock({ height: + new Date() }))
  }

  protected override fetchBalanceImpl (
    ...args: Parameters<Connection["fetchBalanceImpl"]>
  ): Promise<string> {
    throw new Error('unimplemented!')
    //token ??= this.defaultDenom
    //const balance = (this.backend.balances.get(address!)||{})[token] ?? 0
    //return Promise.resolve(String(balance))
    return Promise.resolve('')
  }

  protected override fetchCodeInfoImpl (
    ...args: Parameters<Connection["fetchCodeInfoImpl"]>
  ):
    Promise<Record<string, UploadedCode>>
  {
    if (!args[0].codeIds) {
      return Promise.resolve(Object.fromEntries(
        [...this.backend.uploads.entries()].map(
          ([key, val])=>[key, new UploadedCode(val)]
        )
      ))
    } else {
      const results = {}
      for (const id of args[0].codeIds) {
        results[id] = new UploadedCode(this.backend.uploads.get(id))
      }
      return Promise.resolve(results)
    }
  }

  protected override async fetchCodeInstancesImpl (
    ...args: Parameters<Connection["fetchCodeInstancesImpl"]>
  ) {
    throw new Error('unimplemented!')
    return {}
    //return Promise.resolve([...this.backend.uploads.get(id)!.instances]
      //.map(address=>({address})))
  }

  protected override fetchContractInfoImpl (
    ...args: Parameters<Connection["fetchContractInfoImpl"]>
  ):
    Promise<Record<Address, Contract>>
  {
    const results = {}
    for (const address of addresses) {
      const contract = this.backend.instances.get(address)
      if (!contract) {
        throw new Error(`unknown contract ${address}`)
      }
      const { codeId } = contract
      const code = this.backend.uploads.get(codeId)
      if (!code) {
        throw new Error(`inconsistent state: missing code ${codeId} for address ${address}`)
      }
      results[address] = new Contract({
        ...code,
        ...contract,
      })
    }
    return Promise.resolve(results)
  }

  protected override queryImpl <T> (
    ...args: Parameters<Connection["queryImpl"]>
  ): Promise<T> {
    return Promise.resolve({} as T)
  }

  authenticate (identity: Identity): StubAgent {
    return new StubAgent({ connection: this, identity })
  }
}

export class StubAgent extends Agent {

  declare connection: StubConnection

  protected sendImpl (...args: Parameters<Agent["sendImpl"]>): Promise<void> {
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

  protected async uploadImpl (
    ...args: Parameters<Agent["uploadImpl"]>
  ): Promise<UploadedCode> {
    return new UploadedCode(await this.connection.backend.upload(args[0].binary))
  }

  protected async instantiateImpl (
    ...args: Parameters<Agent["instantiateImpl"]>
  ): Promise<ContractInstance & { address: Address }> {
    return new ContractInstance(await this.connection.backend.instantiate({
      initBy: this.address!,
      codeId: args[0].codeId
    })) as ContractInstance & {
      address: Address
    }
  }

  protected executeImpl <T> (
    ...args: Parameters<Agent["executeImpl"]>
  ): Promise<T> {
    return Promise.resolve({} as T)
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
  initBy: Address
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

  connect ():
    Promise<StubConnection>
  connect (name: string):
    Promise<StubAgent>
  connect (identity: Partial<Identity>):
    Promise<StubAgent>
  async connect (...args: unknown[]): Promise<StubConnection|StubAgent> {
    const connection = new StubConnection({
      chainId:  this.chainId,
      url:      'stub',
      alive:    this.alive,
      backend:  this,
    })
    if (!args[0]) {
      return connection
    }
    if (typeof args[0] === 'string') {
      return connection.authenticate(new Identity(await this.getIdentity(args[0])))
    }
    const parameter = args[0] as Partial<Identity> & { mnemonic?: string }
    if (parameter.mnemonic && !parameter.address) {
      parameter.address = `${this.prefix}${parameter.name}`
      return connection.authenticate(new Identity(parameter))
    }
    throw new Error('invalid argument')
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

  async instantiate (args: { initBy: Address, codeId: CodeId }):
    Promise<ContractInstance & { address: Address }>
  {
    const { codeId, initBy } = args
    const address = randomBech32(this.prefix)
    const code = this.uploads.get(codeId)
    if (!code) {
      throw new Error(`invalid code id ${args.codeId}`)
    }
    code.instances.add(address)
    this.instances.set(address, { address, codeId, initBy })
    return new ContractInstance({ address, codeId }) as ContractInstance & { address: Address }
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
