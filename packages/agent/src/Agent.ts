/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import type { Address, Uint128, ChainId, CodeId, Token, Batch, Message, Into } from '../index'
import { assign, timed, bold, Logged, into } from './Util'
import { SigningConnection } from './Connection'
import { Chain } from './Chain'
import { Identity } from './Identity'
import { send } from './dlt/Bank'
import { CompiledCode } from './compute/Compile'
import { UploadedCode, upload } from './compute/Upload'
import { Contract, instantiate, execute } from './compute/Contract'

/** Enables non-read-only transactions by binding an `Identity` to a `Connection`. */
export abstract class Agent extends Logged {
  constructor (
    properties: ConstructorParameters<typeof Logged>[0]
      & Pick<Agent, 'chain'|'identity'>
      & Partial<Pick<Agent, 'fees'>>
  ) {
    super()
    this.chain    = properties.chain
    this.identity = properties.identity
    this.fees     = properties.fees
  }
  /** The connection that will broadcast the transactions. */
  chain:      Chain
  /** The identity that will sign the transactions. */
  identity:   Identity
  /** Default transaction fees. */
  fees?:      Token.FeeMap<'send'|'upload'|'init'|'exec'>
  /** Get a signing connection to the RPC endpoint. */
  abstract getConnection (): SigningConnection
  /** Construct a transaction batch that will be broadcast by this agent. */
  abstract batch (): Batch
  /** Return the address of this agent. */
  get address (): Address|undefined {
    return this.identity?.address
  }
  async fetchBalance (tokens?: string[]|string): Promise<Record<string, Uint128>> {
    throw new Error("unimplemented!")
  }
  /** Send one or more kinds of native tokens to one or more recipients. */
  async send (
    outputs:  Record<Address, Record<string, Uint128>>,
    options?: Omit<Parameters<SigningConnection["sendImpl"]>[0], 'outputs'>
  ): Promise<unknown> {
    return send(this, outputs, options)
  }
  /** Upload a contract's code, generating a new code id/hash pair. */
  async upload (
    code:     string|URL|Uint8Array|Partial<CompiledCode>,
    options?: Omit<Parameters<SigningConnection["uploadImpl"]>[0], 'binary'>,
  ): Promise<UploadedCode & {
    chainId: ChainId,
    codeId:  CodeId
  }> {
    return upload(this, code, options)
  }
  /** Instantiate a new program from a code id, label and init message. */
  async instantiate (
    contract: CodeId|Partial<UploadedCode>,
    options:  Partial<Contract> & { initMsg: Into<Message> }
  ): Promise<Contract & {
    address: Address,
  }> {
    return instantiate(this, contract, options)
  }
  /** Call a given program's transaction method. */
  async execute <T> (
    contract: Address|Partial<Contract>,
    message:  Message,
    options?: Omit<Parameters<SigningConnection["executeImpl"]>[0], 'address'|'codeHash'|'message'>
  ): Promise<T> {
    return await execute(this, contract, message, options) as T
  }
}
