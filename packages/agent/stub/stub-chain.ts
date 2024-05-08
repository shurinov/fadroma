/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import type { Address, ChainId, CodeId, CodeHash } from '../index'
import { assign, randomBech32, base16, SHA256 } from '../src/Util'
import { Identity } from '../src/Identity'
import { Backend } from '../src/Backend'
import { Chain } from '../src/Chain'
import { Connection } from '../src/Connection'
import { Contract, UploadedCode, ContractInstance } from '../src/Compute'
import * as Token from '../src/Token'

import { StubBatch, StubBlock } from './stub-tx'
import { StubAgent, StubIdentity } from './stub-identity'
import { StubBackend } from './stub-backend'

export class StubChain extends Chain {
  constructor (
    properties: ConstructorParameters<typeof Chain>[0]
      & Pick<StubChain, 'backend'>
  ) {
    super(properties)
    assign(this, properties, ['backend'])
    this.backend ??= new StubBackend({})
  }

  backend: StubBackend

  authenticate (): Promise<StubAgent>
  authenticate (mnemonic: string): Promise<StubAgent>
  authenticate (identity: Identity): Promise<StubAgent>
  async authenticate (...args: unknown[]): Promise<StubAgent> {
    let identity: Identity
    if (!args[0]) {
      identity = new StubIdentity()
    } else if (typeof args[0] === 'string') {
      identity = new StubIdentity({ mnemonic: args[0] })
    } else if (args[0] instanceof StubIdentity) {
      identity = args[0]
    } else if (typeof args[0] === 'object') {
      identity = new StubIdentity(args[0])
    } else {
      throw Object.assign(new Error('Invalid arguments'), { args })
    }
    return new StubAgent({
      chain: this,
      identity
    })
  }

  getConnection (): StubConnection {
    return new StubConnection({
      backend: this.backend,
      chainId: this.chainId,
      url:     'stub',
      api:     {},
    })
  }
}

export class StubConnection extends Connection {
  constructor (
    properties: ConstructorParameters<typeof Connection>[0]
      & Pick<StubConnection, 'backend'>
  ) {
    super(properties)
    assign(this, properties, ['backend'])
    this.backend ??= new StubBackend()
  }

  backend: StubBackend

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
