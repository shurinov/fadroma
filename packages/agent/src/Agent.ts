/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import type { Address, Uint128, ChainId, CodeId, Token, Batch, Message } from '../index'
import { assign, timed, bold, Logged, into } from './Util'
import { SigningConnection } from './Connection'
import { Chain } from './Chain'
import { Identity } from './Identity'
import * as Compute from './Compute'

/** Enables non-read-only transactions by binding an `Identity` to a `Connection`. */
export abstract class Agent extends Logged {
  constructor (
    properties: ConstructorParameters<typeof Logged>[0]
      & Pick<Agent, 'chain'|'identity'>
      & Partial<Pick<Agent, 'fees'>>
  ) {
    super()
    assign(this, properties, ["chain", "identity", "fees"])
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
    for (const [recipient, amounts] of Object.entries(outputs)) {
      this.log.debug(`Sending to ${bold(recipient)}:`)
      for (const [token, amount] of Object.entries(amounts)) {
        this.log.debug(`  ${amount} ${token}`)
      }
    }
    return await timed(
      ()=>this.getConnection().sendImpl({ ...options||{}, outputs }),
      ({elapsed})=>`Sent in ${bold(elapsed)}`
    )
  }

  /** Upload a contract's code, generating a new code id/hash pair. */
  async upload (
    code:     string|URL|Uint8Array|Partial<Compute.CompiledCode>,
    options?: Omit<Parameters<SigningConnection["uploadImpl"]>[0], 'binary'>,
  ): Promise<Compute.UploadedCode & {
    chainId: ChainId,
    codeId:  CodeId
  }> {
    let template: Uint8Array
    if (code instanceof Uint8Array) {
      template = code
    } else {
      const { CompiledCode } = _$_HACK_$_
      if (typeof code === 'string' || code instanceof URL) {
        code = new CompiledCode({ codePath: code })
      } else {
        code = new CompiledCode(code)
      }
      const t0 = performance.now()
      code = code as Compute.CompiledCode
      template = await code.fetch()
      const t1 = performance.now() - t0
      this.log.log(
        `Fetched in`, `${bold((t1/1000).toFixed(6))}s: code hash`,
        bold(code.codeHash), `(${bold(String(code.codeData?.length))} bytes`
      )
    }
    this.log.debug(`Uploading ${bold((code as any).codeHash)}`)
    const result = await timed(
      () => this.getConnection().uploadImpl({
        ...options,
        binary: template
      }),
      ({elapsed, result}: any) => this.log.debug(
        `Uploaded in ${bold(elapsed)}:`,
        `code with hash ${bold(result.codeHash)} as code id ${bold(String(result.codeId))}`,
      ))
    return new Compute.UploadedCode({
      ...template, ...result as any
    }) as Compute.UploadedCode & {
      chainId: ChainId
      codeId:  CodeId
    }
  }

  /** Instantiate a new program from a code id, label and init message. */
  async instantiate (
    contract: CodeId|Partial<Compute.UploadedCode>,
    options:  Partial<Compute.ContractInstance>
  ): Promise<Compute.ContractInstance & {
    address: Address,
  }> {
    if (typeof contract === 'string') {
      contract = new Compute.UploadedCode({ codeId: contract })
    }
    if (isNaN(Number(contract.codeId))) {
      throw new Error(`can't instantiate contract with missing code id: ${contract.codeId}`)
    }
    if (!contract.codeId) {
      throw new Error("can't instantiate contract without code id")
    }
    if (!options.label) {
      throw new Error("can't instantiate contract without label")
    }
    if (!(options.initMsg||('initMsg' in options))) {
      throw new Error("can't instantiate contract without init message")
    }
    const { codeId, codeHash } = contract
    const result = await timed(
      () => into(options.initMsg).then(initMsg=>this.getConnection().instantiateImpl({
        ...options,
        codeId,
        codeHash,
        initMsg
      })),
      ({ elapsed, result }) => this.log.debug(
        `Instantiated in ${bold(elapsed)}:`,
        `code id ${bold(String(codeId))} as `,
        `${bold(options.label)} (${result.address})`
      )
    )
    return new Compute.ContractInstance({
      ...options, ...result
    }) as Compute.ContractInstance & {
      address: Address
    }
  }

  /** Call a given program's transaction method. */
  async execute <T> (
    contract: Address|Partial<Compute.ContractInstance>,
    message:  Message,
    options?: Omit<Parameters<SigningConnection["executeImpl"]>[0], 'address'|'codeHash'|'message'>
  ): Promise<T> {
    if (typeof contract === 'string') {
      contract = new Compute.ContractInstance({ address: contract })
    }
    if (!contract.address) {
      throw new Error("agent.execute: no contract address")
    }
    const { address } = contract
    let method = (typeof message === 'string') ? message : Object.keys(message||{})[0]
    return timed(
      () => this.getConnection().executeImpl({
        ...contract as { address, codeHash },
        message,
        ...options
      }),
      ({ elapsed }) => this.log.debug(
        `Executed in ${bold(elapsed)}:`,
        `tx ${bold(method||'(???)')} of ${bold(address)}`
      )
    )
  }

}

/** The `CompiledCode` class has an alternate implementation for non-browser environments.
  * This is because Next.js tries to parse the dynamic `import('node:...')` calls used by
  * the `fetch` methods. (Which were made dynamic exactly to avoid such a dual-implementation
  * situation in the first place - but Next is smart and adds a problem where there isn't one.)
  * So, it defaults to the version that can only fetch from URL using the global fetch method;
  * but the non-browser entrypoint substitutes `CompiledCode` in `_$_HACK_$_` with the
  * version which can also load code from disk (`LocalCompiledCode`). Ugh. */
export const _$_HACK_$_ = { CompiledCode: Compute.CompiledCode }
