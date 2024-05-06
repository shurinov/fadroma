/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import { Tx, ReadonlySigner, SecretNetworkClient, Wallet } from '@hackbg/secretjs-esm'
import type { CreateClientOptions, EncryptionUtils, TxResponse } from '@hackbg/secretjs-esm'
import { ScrtError as Error, console, bold, base64 } from './scrt-base'
import { ScrtIdentity, ScrtSignerIdentity, ScrtMnemonicIdentity } from './scrt-identity'
import faucets from './scrt-faucets'
//import * as Mocknet from './scrt-mocknet'
import * as Bank from './scrt-bank'
import * as Compute from './scrt-compute'
import * as Staking from './scrt-staking'
import * as Governance from './scrt-governance'
import type { Uint128, Message, Address, TxHash, ChainId, CodeId, CodeHash } from '@fadroma/agent'
import { Core, Chain, Token, Deploy, Batch } from '@fadroma/agent'

const { MsgStoreCode, MsgExecuteContract, MsgInstantiateContract } = Tx

export type { TxResponse }

/** Represents a Secret Network API endpoint. */
export class ScrtConnection extends Chain.Connection {
  /** Smallest unit of native token. */
  static gasToken = new Token.Native('uscrt')
  /** Underlying API client. */
  declare api:
    SecretNetworkClient

  constructor (properties?: Partial<ScrtConnection>) {
    super(properties as Partial<Chain.Connection>)
    this.api ??= new SecretNetworkClient({ url: this.url!, chainId: this.chainId!, })
    const {chainId, url} = this
    if (!chainId) {
      throw new Error("can't authenticate without chainId")
    }
    if (!url) {
      throw new Error("can't connect without url")
    }
    this.api = new SecretNetworkClient({ chainId, url })
  }
  authenticate (identity: ScrtIdentity): ScrtAgent {
    return new ScrtAgent({ connection: this, identity })
  }
  batch (): Batch<ScrtConnection, ScrtAgent> {
    return new ScrtBatch({ connection: this }) as unknown as Batch<ScrtConnection, ScrtAgent>
  }
  protected override async fetchBlockImpl (parameter?): Promise<ScrtBlock> {
    if (!parameter) {
      const {
        block_id: { hash, part_set_header } = {},
        block: { header, data, evidence, last_commit } = {}
      } = await this.api.query.tendermint.getLatestBlock({})
      return new ScrtBlock({
        hash:   Core.base16.encode(hash),
        height: Number(header.height)
      })
    }
  }
  protected override async fetchHeightImpl () {
    const { height } = await this.fetchBlockImpl()
    return height
  }
  protected override async fetchBalanceImpl (parameters) {
    return await Bank.fetchBalance(this, parameters)
  }
  protected override async fetchCodeInfoImpl (parameters) {
    return await Compute.fetchCodeInfo(this, parameters)
  }
  protected override async fetchCodeInstancesImpl (parameters) {
    return await Compute.fetchCodeInstances(this, parameters)
  }
  protected override async fetchContractInfoImpl (parameters) {
    return await Compute.fetchContractInfo(this, parameters)
  }
  protected override async queryImpl <T> (parameters): Promise<T> {
    return await Compute.query(this, parameters) as T
  }
  async fetchLimits (): Promise<{ gas: number }> {
    const params = { subspace: "baseapp", key: "BlockParams" }
    const { param } = await this.api.query.params.params(params)
    let { max_bytes, max_gas } = JSON.parse(param?.value??'{}')
    this.log.debug(`Fetched default gas limit: ${max_gas} and code size limit: ${max_bytes}`)
    if (max_gas < 0) {
      max_gas = 10000000
      this.log.warn(`Chain returned negative max gas limit. Defaulting to: ${max_gas}`)
    }
    return { gas: max_gas }
  }
}

export class ScrtAgent extends Chain.Agent {

  api: SecretNetworkClient

  declare connection: ScrtConnection

  declare identity:   ScrtIdentity

  /** Set permissive fees by default. */
  fees = {
    upload: ScrtConnection.gasToken.fee(10000000),
    init:   ScrtConnection.gasToken.fee(10000000),
    exec:   ScrtConnection.gasToken.fee(1000000),
    send:   ScrtConnection.gasToken.fee(1000000),
  }

  constructor (properties: Partial<ScrtAgent> = {}) {
    super(properties)
    if (!(this.identity instanceof ScrtIdentity)) {
      if (!(typeof this.identity === 'object')) {
        throw new Error('identity must be ScrtIdentity instance, { mnemonic }, or { encryptionUtils }')
      } else if ((this.identity as { mnemonic?: string }).mnemonic) {
        this.log.debug('Identifying with mnemonic')
        this.identity = new ScrtMnemonicIdentity(this.identity)
      } else if ((this.identity as { encryptionUtils?: unknown }).encryptionUtils) {
        this.log.debug('Identifying with signer (encryptionUtils)')
        this.identity = new ScrtSignerIdentity(this.identity)
      } else {
        throw new Error('identity must be ScrtIdentity instance, { mnemonic }, or { encryptionUtils }')
      }
    }
    const { chainId, url } = this.connection
    this.api = this.identity.getApi({ chainId, url }) 
  }

  async setMaxGas (): Promise<this> {
    const { gas } = await this.connection.fetchLimits()
    const max = ScrtConnection.gasToken.fee(gas)
    this.fees = { upload: max, init: max, exec: max, send: max }
    return this
  }

  get account (): ReturnType<SecretNetworkClient['query']['auth']['account']> {
    return this.api.query.auth.account({ address: this.address })
  }

  async getNonce (): Promise<{ accountNumber: number, sequence: number }> {
    const result: any = await this.account ?? (() => {
      throw new Error(`Cannot find account "${this.address}", make sure it has a balance.`)
    })()
    const { account_number, sequence } = result.account
    return { accountNumber: Number(account_number), sequence: Number(sequence) }
  }
  async encrypt (codeHash: CodeHash, msg: Message) {
    if (!codeHash) {
      throw new Error("can't encrypt message without code hash")
    }
    const { encryptionUtils } = await Promise.resolve(this.api) as any
    const encrypted = await encryptionUtils.encrypt(codeHash, msg as object)
    return base64.encode(encrypted)
  }

  protected async sendImpl (...args: Parameters<Chain.Agent["sendImpl"]>) {
    return await Bank.send(this, ...args)
  }
  protected async uploadImpl (...args: Parameters<Chain.Agent["uploadImpl"]>) {
    return await Compute.upload(this, ...args)
  }
  protected async instantiateImpl (...args: Parameters<Chain.Agent["instantiateImpl"]>) {
    return await Compute.instantiate(this, ...args)
  }
  protected async executeImpl <T> (...args: Parameters<Chain.Agent["executeImpl"]>): Promise<T> {
    return await Compute.execute(this, ...args) as T
  }
}

export class ScrtBlock extends Chain.Block {}

function removeTrailingSlash (url: string) {
  while (url.endsWith('/')) { url = url.slice(0, url.length - 1) }
  return url
}

export class ScrtBatch extends Batch<ScrtConnection, ScrtAgent> {
  /** Messages to encrypt. */
  messages: Array<
    |InstanceType<typeof MsgStoreCode>
    |InstanceType<typeof MsgInstantiateContract>
    |InstanceType<typeof MsgExecuteContract>
  > = []

  /** TODO: Upload in batch. */
  upload (
    code:    Parameters<Batch<ScrtConnection, ScrtAgent>["upload"]>[0],
    options: Parameters<Batch<ScrtConnection, ScrtAgent>["upload"]>[1]
  ) {
    throw new Error('ScrtBatch#upload: not implemented')
    return this
  }

  instantiate (
    code:    Parameters<Batch<ScrtConnection, ScrtAgent>["instantiate"]>[0],
    options: Parameters<Batch<ScrtConnection, ScrtAgent>["instantiate"]>[1]
  ) {
    this.messages.push(new MsgInstantiateContract({
      //callback_code_hash: '',
      //callback_sig:       null,
      sender:     this.agent!.address!,
      code_id:    ((typeof code === 'object') ? code.codeId : code) as CodeId,
      label:      options.label!,
      init_msg:   options.initMsg,
      init_funds: options.initSend,
    }))
    return this
  }

  execute (
    contract: Parameters<Batch<ScrtConnection, ScrtAgent>["execute"]>[0],
    message:  Parameters<Batch<ScrtConnection, ScrtAgent>["execute"]>[1],
    options:  Parameters<Batch<ScrtConnection, ScrtAgent>["execute"]>[2],
  ) {
    if (typeof contract === 'object') contract = contract.address!
    this.messages.push(new MsgExecuteContract({
      //callback_code_hash: '',
      //callback_sig:       null,
      sender:           this.agent!.address!,
      contract_address: contract,
      sent_funds:       options?.execSend,
      msg:              message as object,
    }))
    return this
  }

  /** Format the messages for API v1 like secretjs and encrypt them. */
  private get encryptedMessages (): Promise<any[]> {
    const messages: any[] = []
    return new Promise(async resolve=>{
      for (const message of this.messages) {
        switch (true) {
          case (message instanceof MsgStoreCode): {
            messages.push(this.encryptUpload(message))
            continue
          }
          case (message instanceof MsgInstantiateContract): {
            messages.push(this.encryptInit(message))
            continue
          }
          case (message instanceof MsgExecuteContract): {
            messages.push(this.encryptExec(message))
            continue
          }
          default: {
            this.log.error(`Invalid batch message:`, message)
            throw new Error(`invalid batch message: ${message}`)
          }
        }
      }
      return messages
    })
  }

  private async encryptUpload (init: any): Promise<any> {
    throw new Error('not implemented')
  }

  private async encryptInit (init: any): Promise<any> {
    return {
      "@type":            "/secret.compute.v1beta1.MsgInstantiateContract",
      callback_code_hash: '',
      callback_sig:       null,
      sender:             this.agent!.address,
      code_id:     String(init.codeId),
      init_funds:         init.funds,
      label:              init.label,
      init_msg:           await this.connection!.encrypt(init.codeHash, init.msg),
    }
  }

  private async encryptExec (exec: any): Promise<any> {
    return {
      "@type":            '/secret.compute.v1beta1.MsgExecuteContract',
      callback_code_hash: '',
      callback_sig:       null,
      sender:             this.agent!.address,
      contract:           exec.contract,
      sent_funds:         exec.funds,
      msg:                await this.connection!.encrypt(exec.codeHash, exec.msg),
    }
  }

  simulate () {
    return Promise.resolve(this.connection!.api).then(api=>api.tx.simulate(this.messages))
  }

  async submit ({ memo = "" }: { memo: string }): Promise<ScrtBatchResult[]> {
    const api = await Promise.resolve(this.connection!.api)
    const chainId  = this.connection!.chainId!
    const messages = this.messages
    const limit    = Number(this.connection!.fees.exec?.amount[0].amount) || undefined
    const gas      = messages.length * (limit || 0)

    const results: ScrtBatchResult[] = []
    try {

      const txResult = await api.tx.broadcast(messages as any, { gasLimit: gas })
      if (txResult.code !== 0) {
        const error = `(in batch): gRPC error ${txResult.code}: ${txResult.rawLog}`
        throw Object.assign(new Error(error), txResult)
      }

      for (const i in messages) {

        const msg = messages[i]

        const result: Partial<ScrtBatchResult> = {
          chainId,
          sender: this.agent!.address,
          tx: txResult.transactionHash,
        }

        if (msg instanceof MsgInstantiateContract) {

          const findAddr = ({msg, type, key}: {
            msg: number, type: string, key: string
          }) =>
            msg  ==  Number(i) &&
            type === "message" &&
            key  === "contract_address"

          results[Number(i)] = Object.assign(result, {
            type:    'wasm/MsgInstantiateContract',
            codeId:  msg.codeId,
            label:   msg.label,
            address: txResult.arrayLog?.find(findAddr)?.value,
          }) as ScrtBatchResult

        } else if (msg instanceof MsgExecuteContract) {

          results[Number(i)] = Object.assign(result, {
            type:    'wasm/MsgExecuteContract',
            address: msg.contractAddress
          }) as ScrtBatchResult

        }
      }

    } catch (error) {
      this.log.br()
      this.log
        .error('submitting batch failed:')
        .error(bold(error.message))
        .warn('(decrypting batch errors is not implemented)')
      throw error
    }

    return results

  }

  /** Format the messages for API v1beta1 like secretcli and generate a multisig-ready
    * unsigned transaction batch; don't execute it, but save it in
    * `state/$CHAIN_ID/transactions` and output a signing command for it to the console. */
  async save (name?: string) {
    // Number of batch, just for identification in console
    name ??= name || `TX.${+new Date()}`
    // Get signer's account number and sequence via the canonical API
    const { accountNumber, sequence } = await this.connection!.getNonce()//this.chain.url, this.connection!.address)
    // Print the body of the batch
    this.log.debug(`Messages in batch:`)
    for (const msg of this.messages??[]) {
      this.log.debug(' ', JSON.stringify(msg))
    }
    // The base Batch class stores messages as (immediately resolved) promises
    const messages = await this.encryptedMessages
    // Print the body of the batch
    this.log.debug(`Encrypted messages in batch:`)
    for (const msg of messages??[]) {
      this.log.info(' ', JSON.stringify(msg))
    }
    // Compose the plaintext
    const unsigned = this.composeUnsignedTx(messages as any, name)
    // Output signing instructions to the console
    
    const output = `${name}.signed.json`
    const string = JSON.stringify(unsigned)
    const txdata = shellescape([string])
    this.log.br()
    this.log.info('Multisig batch ready.')
    this.log.info(`Run the following command to sign the batch:
\nsecretcli tx sign /dev/stdin --output-document=${output} \\
--offline --from=YOUR_MULTISIG_MEMBER_ACCOUNT_NAME_HERE --multisig=${this.agent!.address} \\
--chain-id=${this.connection!.chainId} --account-number=${accountNumber} --sequence=${sequence} \\
<<< ${txdata}`)
    this.log.br()
    this.log.debug(`Batch contents:`, JSON.stringify(unsigned, null, 2))
    this.log.br()

    return {
      name,
      accountNumber,
      sequence,
      unsignedTxBody: JSON.stringify(unsigned)
    }
  }

  private composeUnsignedTx (encryptedMessages: any[], memo?: string): any {
    const fee = ScrtConnection.gas(10000000).asFee()
    return {
      auth_info: {
        signer_infos: [],
        fee: {
          ...fee,
          gas: fee.gas,
          payer: "",
          granter: ""
        },
      },
      signatures: [],
      body: {
        memo,
        messages: encryptedMessages,
        timeout_height: "0",
        extension_options: [],
        non_critical_extension_options: []
      }
    }
  }
}

export interface ScrtBatchResult {
  sender?:   Address
  tx:        TxHash
  type:      'wasm/MsgInstantiateContract'|'wasm/MsgExecuteContract'
  chainId:   ChainId
  codeId?:   CodeId
  codeHash?: CodeHash
  address?:  Address
  label?:    Chain.Label
}

function shellescape (a: string[]) {
  const ret: string[] = [];
  a.forEach(function(s: string) {
    if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
      s = "'"+s.replace(/'/g,"'\\''")+"'";
      s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
        .replace(/\\'''/g, "\\'" ); // remove non-escaped single-quote if there are enclosed between 2 escaped
    }
    ret.push(s);
  });
  return ret.join(' ');
}
