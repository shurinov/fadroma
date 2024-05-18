/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import {
  Logged, assign, bold, colors, randomColor,
} from './Util'
import type {
  Address, Block, Chain, ChainId, CodeId, Message, Token, Uint128,
  UploadStore, UploadedCode, Contract, Into, Identity
} from '../index'

/** Represents a remote API endpoint.
  * 
  * * Use one of its subclasses in `@fadroma/scrt`, `@fadroma/cw`, `@fadroma/namada`
  *   to connect to the corresponding chain.
  * * Or, extend this class to implement support for new kinds of blockchains. */
export abstract class Connection extends Logged {
  constructor (
    properties: ConstructorParameters<typeof Logged>[0]
      & Pick<Connection, 'chain'|'url'>
      & Partial<Pick<Connection, 'alive'>>
  ) {
    super(properties)
    this.#chain = properties.chain
    this.url    = properties.url
    this.alive  = properties.alive ?? true
    this.log.label = [
      this.constructor.name,
      '(', this[Symbol.toStringTag] ? `(${bold(this[Symbol.toStringTag])})` : null, ')'
    ].filter(Boolean).join('')
    this.log.label = new.target.constructor.name
    const chainColor = randomColor({ luminosity: 'dark', seed: this.url })
    this.log.label = colors.bgHex(chainColor).whiteBright(` ${this.url} `)
  }
  get [Symbol.toStringTag] () {
    if (this.url) {
      const color = randomColor({ luminosity: 'dark', seed: this.url })
      return colors.bgHex(color).whiteBright(this.url)
    }
  }
  #chain: Chain
  /** Chain to which this connection points. */
  get chain (): Chain {
    return this.#chain
  }
  /** ID of chain to which this connection points. */
  get chainId (): ChainId {
    return this.chain.chainId
  }
  /** Connection URL.
    *
    * The same chain may be accessible via different endpoints, so
    * this property contains the URL to which requests are sent. */
  url:   string
  /** Setting this to false stops retries. */
  alive: boolean = true

  /** Chain-specific implementation of fetchBlock. */
  abstract fetchBlockImpl (parameters?:
    { height: number }|{ hash: string }
  ): Promise<Block>
  /** Chain-specific implementation of fetchHeight. */
  abstract fetchHeightImpl ():
    Promise<number>
  /** Chain-specific implementation of fetchBalance. */
  abstract fetchBalanceImpl (parameters: {
    addresses: Record<Address, string[]>,
    parallel?: boolean
  }): Promise<Record<Address, Record<string, Uint128>>>
  /** Chain-specific implementation of fetchCodeInfo. */
  abstract fetchCodeInfoImpl (parameters?: {
    codeIds?:  CodeId[]
    parallel?: boolean
  }): Promise<Record<CodeId, UploadedCode>>
  /** Chain-specific implementation of fetchCodeInstances. */
  abstract fetchCodeInstancesImpl (parameters: {
    codeIds:   { [id: CodeId]: typeof Contract },
    parallel?: boolean
  }): Promise<{
    [codeId in keyof typeof parameters["codeIds"]]:
      Record<Address, InstanceType<typeof parameters["codeIds"][codeId]>>
  }>
  /** Chain-specific implementation of fetchContractInfo. */
  abstract fetchContractInfoImpl (parameters: {
    contracts: { [address: Address]: typeof Contract },
    parallel?: boolean
  }): Promise<Record<Address, Contract>>
  /** Chain-specific implementation of query. */
  abstract queryImpl <T> (parameters: {
    address:   Address
    codeHash?: string
    message:   Message
  }): Promise<T>
}

/** Extend this class and implement the abstract methods to add support for a new kind of chain. */
export abstract class SigningConnection {
  constructor (properties: { chain: Chain, identity: Identity }) {
    this.#chain    = properties.chain
    this.#identity = properties.identity
  }
  #chain: Chain
  /** Chain to which this connection points. */
  get chain (): Chain {
    return this.#chain
  }
  get chainId (): ChainId {
    return this.chain.chainId
  }
  #identity: Identity
  get identity (): Identity {
    return this.#identity
  }
  get address (): Address {
    return this.identity.address!
  }
  /** Chain-specific implementation of native token transfer. */
  abstract sendImpl (parameters: {
    outputs:   Record<Address, Record<string, Uint128>>,
    sendFee?:  Token.IFee,
    sendMemo?: string,
    parallel?: boolean
  }): Promise<unknown>
  /** Chain-specific implementation of code upload. */
  abstract uploadImpl (parameters: {
    binary:       Uint8Array,
    reupload?:    boolean,
    uploadStore?: UploadStore,
    uploadFee?:   Token.IFee
    uploadMemo?:  string
  }): Promise<Partial<UploadedCode & {
    chainId: ChainId,
    codeId:  CodeId
  }>>
  /** Chain-specific implementation of contract instantiation. */
  abstract instantiateImpl (parameters: Partial<Contract> & {
    initMsg:   Into<Message>
    initFee?:  Token.IFee
    initSend?: Token.ICoin[]
    initMemo?: string
  }):
    Promise<Contract & { address: Address }>
  /** Chain-specific implementation of contract transaction. */
  abstract executeImpl <T> (parameters: {
    address:   Address
    codeHash?: string
    message:   Message
    execFee?:  Token.IFee
    execSend?: Token.ICoin[]
    execMemo?: string
  }): Promise<T>
}
