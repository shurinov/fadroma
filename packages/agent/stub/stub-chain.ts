/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import { assign, randomBech32, base16, SHA256 } from '../agent-core'
import type { Address } from '../agent-identity'
import { Identity } from '../agent-identity'
import type { ChainId } from '../agent-chain'
import { Backend, Chain, Connection } from '../agent-chain'
import type { CodeId, CodeHash } from '../agent-compute.browser'
import { Contract, UploadedCode, ContractInstance } from '../agent-compute.browser'
import * as Token from '../agent-token'

import { StubBatch, StubBlock } from './stub-tx'
import { StubAgent } from './stub-identity'

export class StubChain extends Chain {
  async authenticate (...args: unknown[]): Promise<StubAgent> {
    return new StubAgent({ chain: this })
  }
}

export class StubConnection extends Connection {

  backend: StubBackend

  constructor (properties: Partial<StubConnection> = {}) {
    super(properties)
    assign(this, properties, ['backend'])
    this.backend ??= new StubBackend()
  }

  override fetchHeightImpl () {
    return this.fetchBlockImpl().then(({height})=>height)
  }

  override fetchBlockImpl () {
    return Promise.resolve(new StubBlock({ height: + new Date() }))
  }

  override fetchBalanceImpl (
    ...args: Parameters<Connection["fetchBalanceImpl"]>
  ): Promise<string> {
    throw new Error('unimplemented!')
    //token ??= this.defaultDenom
    //const balance = (this.backend.balances.get(address!)||{})[token] ?? 0
    //return Promise.resolve(String(balance))
    return Promise.resolve('')
  }

  override fetchCodeInfoImpl (
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

  override async fetchCodeInstancesImpl (
    ...args: Parameters<Connection["fetchCodeInstancesImpl"]>
  ) {
    throw new Error('unimplemented!')
    return {}
    //return Promise.resolve([...this.backend.uploads.get(id)!.instances]
      //.map(address=>({address})))
  }

  override fetchContractInfoImpl (
    ...args: Parameters<Connection["fetchContractInfoImpl"]>
  ):
    Promise<Record<Address, Contract>>
  {
    const results = {}
    for (const address of Object.keys(args[0].contracts)) {
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

  override queryImpl <T> (
    ...args: Parameters<Connection["queryImpl"]>
  ): Promise<T> {
    return Promise.resolve({} as T)
  }
}

export type StubAccount = { address: Address, mnemonic?: string }
export type StubBalances = Record<string, bigint>
export type StubInstance = { codeId: CodeId, address: Address, initBy: Address }
export type StubUpload = {
  chainId:   ChainId,
  codeId:    CodeId,
  codeHash:  CodeHash,
  codeData:  Uint8Array,
  instances: Set<Address>
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
