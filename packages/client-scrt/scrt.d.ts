declare module '@fadroma/client-scrt' {

  import {
    Address,
    Fee, Fees,
    Chain, ChainOptions,
    Executor, Agent, AgentOptions,
    Template,
    Instance, Client, ClientCtor, ClientOptions,
  } from '@fadroma/client'

  export class ScrtGas extends Fee {
    static denom: string
    static defaultFees: Fees
    constructor (x: number)
  }

  export class ScrtChain extends Chain {}

  export abstract class ScrtAgent extends Agent {

    /** Default fees to use for this agent. */
    fees: typeof ScrtGas.defaultFees

    /** Default denomination for fees. */
    defaultDenomination: typeof ScrtGas.denom

    /** What TX bundle implementation to use. */
    abstract Bundle: unknown
    
    /** Create a new TX bundle. */
    bundle <T> (): T

    /** Instantiate multiple contracts from a bundled transaction. */
    instantiateMany (configs: [Template, string, object][]): Promise<Instance[]>

    /** Execute a transaction. */
    execute <M> (contract: Instance, msg: M, ...args: any[]): Promise<ExecuteResult>

  }

  export interface ScrtBundleCtor <B extends ScrtBundle> {
    new (agent: ScrtAgent): B
  }

  export type ScrtBundleWrapper = (bundle: ScrtBundle) => Promise<any>

  export interface ScrtBundleResult {
    tx:        string
    type:      string
    chainId:   string
    codeId?:   string
    codeHash?: string
    address?:  string
    label?:    string
  }

  export abstract class ScrtBundle implements Executor {

    constructor (agent: Agent)

    /** The Agent that will submit the bundle. */
    readonly agent: Agent

    /** Nesting depth. Careful! */
    private depth: number

    /** Opening a bundle from within a bundle
      * returns the same bundle with incremented depth. */
    bundle (): this

    /** Populate and execute bundle */
    wrap (cb: ScrtBundleWrapper, memo?: string): Promise<ScrtBundleResult[]|null>

    /** Execute the bundle if not nested;
      * decrement the depth if nested. */
    run (memo: string): Promise<ScrtBundleResult[]|null>

    /** Index of bundle. */
    protected id: number

    /** Messages contained in bundle. */
    protected msgs: Array<any>

    /** Add a message to the bundle, incrementing
      * the bundle's internal message counter. */
    protected add (msg: any): number

    /** Get an instance of a Client subclass that adds messages to the bundle. */
    getClient <C extends Client> (Client: ClientCtor<C>, options: ClientOptions): C

    getCodeId (address): Promise<string>

    get chain (): ScrtChain

    get name (): string

    get address (): string

    getLabel (address: string): Promise<string>

    getHash (address): Promise<string>

    get balance (): Promise<bigint>

    getBalance (denom): Promise<bigint>

    get defaultDenom (): string

    /** Queries are disallowed in the middle of a bundle because
      * even though the bundle API is structured as multiple function calls,
      * the bundle is ultimately submitted as a single transaction and
      * it doesn't make sense to query state in the middle of that. */
    query <T, U> (contract: Instance, msg: T): Promise<U>

    /** Uploads are disallowed in the middle of a bundle because
      * it's easy to go over the max request size, and
      * difficult to know what that is in advance. */
    upload (data): Promise<Template>

    /** Uploads are disallowed in the middle of a bundle because
      * it's easy to go over the max request size, and
      * difficult to know what that is in advance. */
    uploadMany (data): Promise<Template[]>

    /** Add a single MsgInstantiateContract to the bundle. */
    instantiate (template: Template, label, msg, init_funds?): Promise<Instance>

    /** Add multiple MsgInstantiateContract messages to the bundle,
      * one for each contract config. */
    instantiateMany (configs: [Template, string, object][],): Promise<Instance[]>

    init (template: Template, label, msg, funds?): Promise<this>

    // @ts-ignore
    execute (instance: Instance, msg, funds?): Promise<this>

    protected assertCanSubmit (): void

    abstract submit (memo: string): Promise<ScrtBundleResult[]>

    abstract save (name: string): Promise<void>

  }

  export interface ExecuteResult {
    transactionHash: string,
    logs: any
    data: any
  }

  export function mergeAttrs (attrs: {key:string,value:string}[]): any

  export interface Permit<T> {
    params: {
      permit_name:    string,
      allowed_tokens: Address[]
      chain_id:       string,
      permissions:    T[]
    },
    signature: Signature
  }

  // This type is case sensitive!
  export interface Signature {
    readonly pub_key: Pubkey
    readonly signature: string
  }

  export interface Pubkey {
    /** Must be: `tendermint/PubKeySecp256k1` */
    readonly type: string
    readonly value: any
  }

  export interface Signer {
    chain_id: string
    signer:  Address
    sign <T> (permit_msg: PermitAminoMsg<T>): Promise<Permit<T>>
  }

  /** Data used for creating a signature as per the SNIP-24 spec:
    * https://github.com/SecretFoundation/SNIPs/blob/master/SNIP-24.md#permit-content---stdsigndoc
    * This type is case sensitive! */
  export interface SignDoc {
    readonly chain_id:       string;
    /** Always 0. */
    readonly account_number: string;
    /** Always 0. */
    readonly sequence:       string;
    /** Always 0 uscrt + 1 gas */
    readonly fee:            Fee;
    /** Always 1 message of type query_permit */
    readonly msgs:           readonly AminoMsg[];
    /** Always empty. */
    readonly memo:           string;
  }

  export interface AminoMsg {
    readonly type: string;
    readonly value: any;
  }

  /** Used as the `value` field of the {@link AminoMsg} type. */
  export interface PermitAminoMsg<T> {
    permit_name:    string,
    allowed_tokens: Address[],
    permissions:    T[],
  }

  /** Helper function to create a {@link SignDoc}.
    * All other fields on that type must be constant. */
  export function createSignDoc <T> (chain_id: string, permit_msg: PermitAminoMsg<T>): SignDoc

  export class KeplrSigner implements Signer {

    constructor (chain_id: string, signer: Address, keplr: any)

    /** The id of the chain which permits will be signed for. */
    readonly chain_id: string

    /** The address which will do the signing and
      * which will be the address used by the contracts. */
    readonly signer:   Address

    /** Must be a pre-configured instance. */
    readonly keplr:    any

    sign <T> (
      /** Query-specific parameters that will be created by the consuming contract. */
      permit_msg: PermitAminoMsg<T>
    ): Promise<Permit<T>>

  }

  export class ViewingKeyClient extends Client {
    /** Create viewing key for the agent */
    create (entropy: string): Promise<unknown>
    /** Set viewing key for the agent  */
    set    (key: string):     Promise<void>
  }

  export * from '@fadroma/client'

}
