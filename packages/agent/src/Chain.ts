/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import { Logged, assign, bold, timed } from './Util'
import * as Compute from './Compute'
import type {
  Address,
  Agent,
  Block,
  ChainId,
  CodeId,
  Connection,
  Identity,
  Message,
  Token,
  Uint128,
} from '../index'

export abstract class Chain extends Logged {
  constructor (properties: Partial<Chain> = {}) {
    super(properties)
    assign(this, properties, ['chainId', 'connections'])
  }
  /** Chain ID. This is a string that uniquely identifies a chain.
    * A project's mainnet and testnet have different chain IDs. */
  chainId?: ChainId
  /** RPC endpoints for this chain. */
  connections: Connection[]
  /** For now, this returns the first connection in the list.
    * The idea is for broken connections to be moved to the bottom of the list
    * (i.e. so that if a node has crashed, the script automatically tries the next one). */
  get connection (): Connection {
    if (!this.connections[0]) {
      throw new Error(`no connections available to chain: ${this.chainId}`)
    }
    return this.connections[0]
  }
  /** Authenticate with a random identity. */
  abstract authenticate (): Promise<Agent>
  /** Authenticate with a mnemonic. */
  abstract authenticate (mnemonic: string): Promise<Agent>
  /** Authenticate with the provided identity. */
  abstract authenticate (identity: Identity): Promise<Agent>

  /** Get the current block height. */
  get height (): Promise<number> {
    this.log.debug('Querying block height')
    return this.connection.fetchHeightImpl()
  }

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
          while (this.connection.alive) {
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

  /** Get info about the latest block. */
  fetchBlock ():
    Promise<Block>
  /** Get info about the block with a specific height. */
  fetchBlock ({ height }: { height: number }):
    Promise<Block>
  /** Get info about the block with a specific hash. */
  fetchBlock ({ hash }: { hash: string }):
    Promise<Block>
  fetchBlock (...args: unknown[]): Promise<Block> {
    if (args[0]) {
      if (typeof args[0] === 'object') {
        if ('height' in args[0]) {
          this.log.debug(`Querying block by height ${args[0].height}`)
          return this.connection.fetchBlockImpl({ height: args[0].height as number })
        } else if ('hash' in args[0]) {
          this.log.debug(`Querying block by hash ${args[0].hash}`)
          return this.connection.fetchBlockImpl({ hash: args[0].hash as string })
        }
      } else {
        throw new Error('Invalid arguments, pass {height:number} or {hash:string}')
      }
    } else {
      this.log.debug(`Querying latest block`)
      return this.connection.fetchBlockImpl()
    }
  }

  /** Fetch balance of 1 or many addresses in 1 or many native tokens. */
  fetchBalance (address: Address, token: string):
    Promise<Uint128>
  fetchBalance (address: Address, tokens?: string[]):
    Promise<Record<string, Uint128>>
  fetchBalance (addresses: Address[], token: string):
    Promise<Record<Address, Uint128>>
  fetchBalance (addresses: Address[], tokens?: string):
    Promise<Record<Address, Record<string, Uint128>>>
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

  /** Fetch info about all code IDs uploaded to the chain. */
  fetchCodeInfo ():
    Promise<Record<CodeId, Compute.UploadedCode>>
  /** Fetch info about a single code ID. */
  fetchCodeInfo (codeId: CodeId, options?: { parallel?: boolean }):
    Promise<Compute.UploadedCode>
  /** Fetch info about multiple code IDs. */
  fetchCodeInfo (codeIds: Iterable<CodeId>, options?: { parallel?: boolean }):
    Promise<Record<CodeId, Compute.UploadedCode>>
  fetchCodeInfo (...args: unknown[]): Promise<unknown> {
    if (args.length === 0) {
      this.log.debug('Querying all codes...')
      return timed(
        ()=>this.connection.fetchCodeInfoImpl(),
        ({ elapsed, result }) => this.log.debug(
          `Queried in ${bold(elapsed)}: all codes`
        ))
    }
    if (args.length === 1) {
      if (args[0] instanceof Array) {
        const codeIds = args[0] as Array<CodeId>
        const { parallel } = args[1] as { parallel?: boolean }
        this.log.debug(`Querying info about ${codeIds.length} code IDs...`)
        return timed(
          ()=>this.connection.fetchCodeInfoImpl({ codeIds, parallel }),
          ({ elapsed, result }) => this.log.debug(
            `Queried in ${bold(elapsed)}: info about ${codeIds.length} code IDs`
          ))
      } else {
        const codeIds = [args[0] as CodeId]
        const { parallel } = args[1] as { parallel?: boolean }
        this.log.debug(`Querying info about code id ${args[0]}...`)
        return timed(
          ()=>this.connection.fetchCodeInfoImpl({ codeIds, parallel }),
          ({ elapsed }) => this.log.debug(
            `Queried in ${bold(elapsed)}: info about code id ${codeIds[0]}`
          ))
      }
    } else {
      throw new Error('fetchCodeInfo takes 0 or 1 arguments')
    }
  }

  /** Fetch all instances of a code ID. */
  fetchCodeInstances (
    codeId: CodeId
  ): Promise<Record<Address, Compute.Contract>>
  /** Fetch all instances of a code ID, with custom client class. */
  fetchCodeInstances <C extends typeof Compute.Contract> (
    Contract: C,
    codeId: CodeId
  ): Promise<Record<Address, InstanceType<C>>>
  /** Fetch all instances of multple code IDs. */
  fetchCodeInstances (
    codeIds:  Iterable<CodeId>,
    options?: { parallel?: boolean }
  ): Promise<Record<CodeId, Record<Address, Compute.Contract>>>
  /** Fetch all instances of multple code IDs, with custom client class. */
  fetchCodeInstances <C extends typeof Compute.Contract> (
    Contract: C,
    codeIds:  Iterable<CodeId>,
    options?: { parallel?: boolean }
  ): Promise<Record<CodeId, Record<Address, InstanceType<C>>>>
  /** Fetch all instances of multple code IDs, with multiple custom client classes. */
  fetchCodeInstances (
    codeIds:  { [id: CodeId]: typeof Compute.Contract },
    options?: { parallel?: boolean }
  ): Promise<{
    [codeId in keyof typeof codeIds]: Record<Address, InstanceType<typeof codeIds[codeId]>>
  }>
  async fetchCodeInstances (...args: unknown[]): Promise<unknown> {
    let $C = Compute.Contract
    let custom = false
    if (typeof args[0] === 'function') {
      $C = args.shift() as typeof Compute.Contract
      let custom = true
    }
    if (!args[0]) {
      throw new Error('Invalid arguments')
    }
    if (args[0][Symbol.iterator]) {
      const result: Record<CodeId, Record<Address, Compute.Contract>> = {}
      const codeIds = {}
      for (const codeId of args[0] as CodeId[]) {
        codeIds[codeId] = $C
      }
      this.log.debug(`Querying contracts with code ids ${Object.keys(codeIds).join(', ')}...`)
      return timed(
        ()=>this.connection.fetchCodeInstancesImpl({ codeIds }),
        ({elapsed})=>this.log.debug(`Queried in ${elapsed}ms`))
    }
    if (typeof args[0] === 'object') {
      if (custom) {
        throw new Error('Invalid arguments')
      }
      const result: Record<CodeId, Record<Address, Compute.Contract>> = {}
      this.log.debug(`Querying contracts with code ids ${Object.keys(args[0]).join(', ')}...`)
      const codeIds = args[0] as { [id: CodeId]: typeof Compute.Contract }
      return timed(
        ()=>this.connection.fetchCodeInstancesImpl({ codeIds }),
        ({elapsed})=>this.log.debug(`Queried in ${elapsed}ms`))
    }
    if ((typeof args[0] === 'number')||(typeof args[0] === 'string')) {
      const id = args[0]
      this.log.debug(`Querying contracts with code id ${id}...`)
      const result = {}
      return timed(
        ()=>this.connection.fetchCodeInstancesImpl({ codeIds: { [id]: $C } }),
        ({elapsed})=>this.log.debug(`Queried in ${elapsed}ms`))
    }
    throw new Error('Invalid arguments')
  }

  /** Fetch a contract's details wrapped in a `Contract` instance. */
  fetchContractInfo (
    address:   Address
  ): Promise<Compute.Contract>
  /** Fetch a contract's details wrapped in a custom class instance. */
  fetchContractInfo <T extends typeof Compute.Contract> (
    Contract:  T,
    address:   Address
  ): Promise<InstanceType<T>>
  /** Fetch multiple contracts' details wrapped in `Contract` instance. */
  fetchContractInfo (
    addresses: Address[],
    options?:  { parallel?: boolean }
  ): Promise<Record<Address, Compute.Contract>>
  /** Fetch multiple contracts' details wrapped in instances of a custom class. */
  fetchContractInfo <T extends typeof Compute.Contract> (
    Contract:  T,
    addresses: Address[],
    options?:  { parallel?: boolean }
  ): Promise<Record<Address, InstanceType<T>>>
  /** Fetch multiple contracts' details, specifying a custom class for each. */
  fetchContractInfo (
    contracts: { [address: Address]: typeof Compute.Contract },
    options?:  { parallel?: boolean }
  ): Promise<{
    [address in keyof typeof contracts]: InstanceType<typeof contracts[address]>
  }>
  async fetchContractInfo (...args: unknown[]): Promise<unknown> {
    let $C = Compute.Contract
    let custom = false
    if (typeof args[0] === 'function') {
      $C = args.shift() as typeof Compute.Contract
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
        () => this.connection.fetchContractInfoImpl({
          contracts: { [args[0] as Address]: $C }
        }),
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
      const contracts = {}
      for (const address of addresses) {
        contracts[address] = $C
      }
      const results = await timed(
        ()=>this.connection.fetchContractInfoImpl({ contracts, parallel }),
        ({ elapsed }) => this.log.debug(
          `Fetched in ${bold(elapsed)}: ${addresses.length} contracts`
        ))
      if (custom) {
        return addresses.map(address=>new $C(results[address]))
      } else {
        return addresses.map(address=>results[address])
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
        ()=>this.connection.fetchContractInfoImpl({
          contracts: args[0] as { [address: Address]: typeof Compute.Contract },
          parallel 
        }),
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

  /** Query a contract by address. */
  query <T> (contract: Address, message: Message):
    Promise<T>
  /** Query a contract object. */
  query <T> (contract: { address: Address }, message: Message):
    Promise<T>
  query <T> (contract: Address|{ address: Address }, message: Message):
    Promise<T> {
    return timed(
      ()=>this.connection.queryImpl({
        ...(typeof contract === 'string') ? { address: contract } : contract,
        message
      }),
      ({ elapsed, result }) => this.log.debug(
        `Queried in ${bold(elapsed)}s: `, JSON.stringify(result)
      )
    )
  }
}
