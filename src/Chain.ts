/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import { Logged, assign, bold, timed } from './Util'
import { fetchBalance } from './dlt/Bank'
import { Contract, fetchCodeInstances, query } from './compute/Contract'
import { UploadedCode, fetchCodeInfo, } from './compute/Upload'
import { Block, fetchBlock, nextBlock } from './Block'
import { Connection } from './Connection'
import type {
  Address,
  Agent,
  ChainId,
  CodeId,
  Identity,
  Message,
  Token,
  Uint128,
} from '../index'

export abstract class Chain extends Logged {

  static get Connection () {
    return Connection
  }

  constructor (
    properties: ConstructorParameters<typeof Logged>[0]
      & Pick<Chain, 'chainId'>
      & Partial<Pick<Chain, 'blockInterval'>>
  ) {
    super(properties)
    this.chainId = properties.chainId
  }

  /** Chain ID. This is a string that uniquely identifies a chain.
    * A project's mainnet and testnet have different chain IDs. */
  chainId: ChainId

  /** Time to ping for next block. */
  blockInterval = 250

  /** Get a read-only connection to the API endpoint. */
  abstract getConnection (): Connection

  /** Authenticate to the chain, obtaining an Agent instance that can send transactions. */
  abstract authenticate (properties?: { mnemonic: string }|Identity): Promise<Agent>

  /** Get the current block height. */
  get height (): Promise<number> {
    this.log.debug('Querying block height')
    return this.getConnection().fetchHeightImpl()
  }

  /** Wait until the block height increments, or until `this.alive` is set to false. */
  get nextBlock (): Promise<number> {
    return nextBlock(this)
  }

  /** Get info about the latest block. */
  fetchBlock ():
    Promise<Block>
  /** Get info about the block with a specific height. */
  fetchBlock ({ height }: { height: number, raw?: boolean }):
    Promise<Block>
  /** Get info about the block with a specific hash. */
  fetchBlock ({ hash }: { hash: string, raw?: boolean }):
    Promise<Block>
  fetchBlock (...args: unknown[]): Promise<Block> {
    return fetchBlock(this, ...args as Parameters<Chain["fetchBlock"]>)
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
    return fetchBalance(this, ...args as Parameters<Chain["fetchBalance"]>)
  }

  /** Fetch info about all code IDs uploaded to the chain. */
  fetchCodeInfo ():
    Promise<Record<CodeId, UploadedCode>>
  /** Fetch info about a single code ID. */
  fetchCodeInfo (codeId: CodeId, options?: { parallel?: boolean }):
    Promise<UploadedCode>
  /** Fetch info about multiple code IDs. */
  fetchCodeInfo (codeIds: Iterable<CodeId>, options?: { parallel?: boolean }):
    Promise<Record<CodeId, UploadedCode>>
  fetchCodeInfo (...args: unknown[]): Promise<unknown> {
    return fetchCodeInfo(this, ...args as Parameters<Chain["fetchCodeInfo"]>)
  }

  /** Fetch all instances of a code ID. */
  fetchCodeInstances (
    codeId: CodeId
  ): Promise<Record<Address, Contract>>
  /** Fetch all instances of a code ID, with custom client class. */
  fetchCodeInstances <C extends typeof Contract> (
    Contract: C,
    codeId: CodeId
  ): Promise<Record<Address, InstanceType<C>>>
  /** Fetch all instances of multple code IDs. */
  fetchCodeInstances (
    codeIds:  Iterable<CodeId>,
    options?: { parallel?: boolean }
  ): Promise<Record<CodeId, Record<Address, Contract>>>
  /** Fetch all instances of multple code IDs, with custom client class. */
  fetchCodeInstances <C extends typeof Contract> (
    Contract: C,
    codeIds:  Iterable<CodeId>,
    options?: { parallel?: boolean }
  ): Promise<Record<CodeId, Record<Address, InstanceType<C>>>>
  /** Fetch all instances of multple code IDs, with multiple custom client classes. */
  fetchCodeInstances (
    codeIds:  { [id: CodeId]: typeof Contract },
    options?: { parallel?: boolean }
  ): Promise<{
    [codeId in keyof typeof codeIds]: Record<Address, InstanceType<typeof codeIds[codeId]>>
  }>
  async fetchCodeInstances (...args: unknown[]): Promise<unknown> {
    return fetchCodeInstances(this, ...args as Parameters<Chain["fetchCodeInstances"]>)
  }

  /** Fetch a contract's details wrapped in a `Contract` instance. */
  fetchContractInfo (
    address:   Address
  ): Promise<Contract>
  /** Fetch a contract's details wrapped in a custom class instance. */
  fetchContractInfo <T extends typeof Contract> (
    Contract:  T,
    address:   Address
  ): Promise<InstanceType<T>>
  /** Fetch multiple contracts' details wrapped in `Contract` instance. */
  fetchContractInfo (
    addresses: Address[],
    options?:  { parallel?: boolean }
  ): Promise<Record<Address, Contract>>
  /** Fetch multiple contracts' details wrapped in instances of a custom class. */
  fetchContractInfo <T extends typeof Contract> (
    Contract:  T,
    addresses: Address[],
    options?:  { parallel?: boolean }
  ): Promise<Record<Address, InstanceType<T>>>
  /** Fetch multiple contracts' details, specifying a custom class for each. */
  fetchContractInfo (
    contracts: { [address: Address]: typeof Contract },
    options?:  { parallel?: boolean }
  ): Promise<{
    [address in keyof typeof contracts]: InstanceType<typeof contracts[address]>
  }>
  async fetchContractInfo (...args: unknown[]): Promise<unknown> {
    return fetchCodeInstances(this, ...args as Parameters<Chain["fetchContractInfo"]>)
  }

  /** Query a contract by address. */
  query <T> (contract: Address, message: Message):
    Promise<T>
  /** Query a contract object. */
  query <T> (contract: { address: Address }, message: Message):
    Promise<T>
  query <T> (...args: unknown[]): Promise<unknown> {
    return query(this, ...args as Parameters<Chain["query"]>)
  }
}
