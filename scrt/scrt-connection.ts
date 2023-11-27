/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import { Tx, ReadonlySigner, SecretNetworkClient, Wallet } from '@hackbg/secretjs-esm'
import type { CreateClientOptions, EncryptionUtils, TxResponse } from '@hackbg/secretjs-esm'
import { Error, console } from './scrt-base'
import { Identity } from './scrt-identity'
//import * as Mocknet from './scrt-mocknet'
import type {
  Uint128, Contract, Message, Name, Address, TxHash, ChainId, CodeId, CodeHash, Label,
} from '@fadroma/agent'
import {
  assign, Connection, into, base64, bip39, bip39EN, bold,
  Token, Batch,
  UploadedCode, ContractInstance,
} from '@fadroma/agent'

const { MsgStoreCode, MsgExecuteContract, MsgInstantiateContract } = Tx

const pickRandom = <T>(set: Set<T>): T => [...set][Math.floor(Math.random()*set.size)]

/** Connect to the Secret Network Mainnet. */
export function mainnet (options: Partial<ScrtConnection> = {}): ScrtConnection {
  return new ScrtConnection({
    chainId: 'secret-4', url: pickRandom(mainnets), ...options||{}
  })
}

/** See https://docs.scrt.network/secret-network-documentation/development/resources-api-contract-addresses/connecting-to-the-network/mainnet-secret-4#api-endpoints */
export const mainnets = new Set([
  'https://lcd.mainnet.secretsaturn.net',
  'https://lcd.secret.express',
  'https://rpc.ankr.com/http/scrt_cosmos',
  'https://1rpc.io/scrt-lcd',
  'https://lcd-secret.whispernode.com',
  'https://secret-api.lavenderfive.com',
])

/** Connect to the Secret Network Testnet. */
export function testnet (options: Partial<ScrtConnection> = {}): ScrtConnection {
  return new ScrtConnection({
    chainId: 'pulsar-3', url: pickRandom(testnets), ...options||{}
  })
}

export const testnets = new Set([
  'https://api.pulsar.scrttestnet.com',
  'https://api.pulsar3.scrttestnet.com/'
])

export const faucets: Record<ChainId, Set<string>> = {
  'secret-4': new Set([
    `https://faucet.secretsaturn.net/`
  ]),
  'pulsar-3': new Set([
    `https://faucet.pulsar.scrttestnet.com/`
  ])
}

/** Represents a Secret Network API endpoint. */
class ScrtConnection extends Connection {
  /** Smallest unit of native token. */
  static gasToken = new Token.Native('uscrt')
  /** Underlying API client. */
  declare api: SecretNetworkClient
  /** Supports multiple authentication methods. */
  declare identity: Identity
  /** Set permissive fees by default. */
  fees = {
    upload: ScrtConnection.gasToken.fee(10000000),
    init:   ScrtConnection.gasToken.fee(10000000),
    exec:   ScrtConnection.gasToken.fee(1000000),
    send:   ScrtConnection.gasToken.fee(1000000),
  }
  constructor (properties?: Partial<ScrtConnection>) {
    super(properties as Partial<Connection>)
    this.api ??= new SecretNetworkClient({ url: this.url!, chainId: this.chainId!, })
    const {chainId, url} = this
    if (!chainId) {
      throw new Error("can't authenticate without chainId")
    }
    if (!url) {
      throw new Error("can't connect without url")
    }
    if (this.identity) {
      this.api = this.identity.getApi({ chainId, url }) 
    } else {
      this.api = new SecretNetworkClient({ chainId, url })
    }
  }

  doGetBlockInfo () {
    return this.api.query.tendermint.getLatestBlock({})
  }

  doGetHeight () {
    return this.doGetBlockInfo().then((block: any)=>
      Number(block.block?.header?.height))
  }

  doGetCodes () {
    const codes: Record<CodeId, UploadedCode> = {}
    return withIntoError(this.api.query.compute.codes({}))
      .then(({code_infos})=>{
        for (const { code_id, code_hash, creator } of code_infos||[]) {
          codes[code_id!] = new UploadedCode({
            chainId:  this.chainId,
            codeId:   code_id,
            codeHash: code_hash,
            uploadBy: creator
          })
        }
        return codes
      })
  }

  async doGetCodeId (contract_address: Address): Promise<CodeId> {
    return (await withIntoError(this.api.query.compute.contractInfo({
      contract_address
    })))
      .ContractInfo!.code_id!
  }

  async doGetContractsByCodeId (code_id: CodeId): Promise<Iterable<{address: Address}>> {
    return (await withIntoError(this.api.query.compute.contractsByCodeId({ code_id })))
      .contract_infos!
      .map(({ contract_address, contract_info: { label, creator } }: any)=>({
        label,
        address: contract_address,
        initBy:  creator
      }))
  }

  async doGetCodeHashOfAddress (contract_address: Address): Promise<CodeHash> {
    return (await withIntoError(this.api.query.compute.codeHashByContractAddress({
      contract_address
    })))
      .code_hash!
  }

  async doGetCodeHashOfCodeId (code_id: CodeId): Promise<CodeHash> {
    return (await withIntoError(this.api.query.compute.codeHashByCodeId({
      code_id
    })))
      .code_hash!
  }

  async doGetBalance (denom: string = this.defaultDenom, address: string|undefined = this.address) {
    return (await withIntoError(this.api.query.bank.balance({
      address,
      denom
    })))
      .balance!.amount!
  }

  async getLabel (contract_address: Address): Promise<Label> {
    return (await withIntoError(this.api.query.compute.contractInfo({
      contract_address
    })))
      .ContractInfo!.label!
  }

  /** Query a contract.
    * @returns the result of the query */
  doQuery <U> (contract: { address: Address, codeHash: CodeHash }, message: Message): Promise<U> {
    return withIntoError(this.api.query.compute.queryContract({
      contract_address: contract.address,
      code_hash: contract.codeHash,
      query: message as Record<string, unknown>
    }))
  }

  get account (): ReturnType<SecretNetworkClient['query']['auth']['account']> {
    return this.api.query.auth.account({ address: this.address })
  }

  async doSend (
    recipient: Address,
    amounts:   Token.ICoin[],
    options?:  Parameters<Connection["doSend"]>[2]
  ) {
    return withIntoError(this.api.tx.bank.send(
      { from_address: this.address!, to_address: recipient, amount: amounts },
      { gasLimit: Number(options?.sendFee?.gas) }
    ))
  }

  doSendMany (
    outputs: [Address, Token.ICoin[]][], options?: unknown
  ): Promise<unknown> {
    throw new Error('unimplemented')
  }

  async sendMany (outputs: never, opts?: any) {
    throw new Error('ScrtConnection#sendMany: not implemented')
  }

  /** Upload a WASM binary. */
  async doUpload (data: Uint8Array): Promise<Partial<UploadedCode>> {
    const request = { sender: this.address!, wasm_byte_code: data, source: "", builder: "" }
    const gasLimit = Number(this.fees.upload?.amount[0].amount) || undefined
    const result = await withIntoError(this.api!.tx.compute.storeCode(request, { gasLimit }))
    const { code, message, details = [], rawLog  } = result as any
    if (code !== 0) {
      this.log.error(
        `Upload failed with code ${bold(code)}:`,
        bold(message ?? rawLog ?? ''),
        ...details
      )
      if (message === `account ${this.address} not found`) {
        this.log.info(`If this is a new account, send it some ${ScrtConnection.gasToken} first.`)
        if (faucets[this.chainId!]) {
          this.log.info(`Available faucets\n `, [...faucets[this.chainId!]].join('\n  '))
        }
      }
      this.log.error(`Upload failed`, { result })
      throw new Error('upload failed')
    }
    type Log = { type: string, key: string }
    const codeId = result.arrayLog
      ?.find((log: Log) => log.type === "message" && log.key === "code_id")
      ?.value
    if (!codeId) {
      this.log.error(`Code ID not found in result`, { result })
      throw new Error('upload failed')
    }
    const codeHash = await this.getCodeHashOfCodeId(codeId)
    return {
      chainId:   this.chainId,
      codeId,
      codeHash,
      uploadBy:  this.address,
      uploadTx:  result.transactionHash,
      uploadGas: result.gasUsed
    }
  }

  async doInstantiate (
    codeId: CodeId,
    options: Parameters<Connection["doInstantiate"]>[1]
  ): Promise<Partial<ContractInstance>> {
    if (!this.address) throw new Error("agent has no address")
    const parameters = {
      sender:     this.address,
      code_id:    Number(codeId),
      code_hash:  options.codeHash,
      label:      options.label!,
      init_msg:   options.initMsg,
      init_funds: options.initSend,
      memo:       options.initMemo
    }
    const instantiateOptions = { gasLimit: Number(this.fees.init?.amount[0].amount) || undefined }
    const result = await withIntoError(
      this.api.tx.compute.instantiateContract(parameters, instantiateOptions))
    if (result.code !== 0) {
      this.log.error('Init failed:', { parameters, instantiateOptions, result })
      throw new Error(`init of code id ${codeId} failed`)
    }

    type Log = { type: string, key: string }
    const address = result.arrayLog!
      .find((log: Log) => log.type === "message" && log.key === "contract_address")
      ?.value!

    return {
      chainId:  this.chainId,
      address,
      codeHash: options.codeHash,
      initBy:   this.address,
      initTx:   result.transactionHash,
      initGas:  result.gasUsed,
      label:    options.label,
    }
  }

  async doExecute (
    contract: { address: Address, codeHash: CodeHash },
    message:  Message,
    options?: Parameters<Connection["doExecute"]>[2] & {
      preSimulate?: boolean
    }
  ): Promise<TxResponse> {
    const tx = {
      sender:           this.address!,
      contract_address: contract.address,
      code_hash:        contract.codeHash,
      msg:              message as Record<string, unknown>,
      sentFunds:        options?.execSend
    }
    const txOpts = {
      gasLimit: Number(options?.execFee?.gas) || undefined
    }
    if (options?.preSimulate) {
      this.log.info('Simulating transaction...')
      let simResult
      try {
        simResult = await this.api.tx.compute.executeContract.simulate(tx, txOpts)
      } catch (e) {
        this.log.error(e)
        this.log.warn('TX simulation failed:', tx, 'from', this)
      }
      const gas_used = simResult?.gas_info?.gas_used
      if (gas_used) {
        this.log.info('Simulation used gas:', gas_used)
        const gas = Math.ceil(Number(gas_used) * 1.1)
        // Adjust gasLimit up by 10% to account for gas estimation error
        this.log.info('Setting gas to 110% of that:', gas)
        txOpts.gasLimit = gas
      }
    }
    const result = await this.api.tx.compute.executeContract(tx, txOpts)
    // check error code as per https://grpc.github.io/grpc/core/md_doc_statuscodes.html
    if (result.code !== 0) {
      throw decodeError(result)
    }
    return result as TxResponse
  }

  async setMaxGas (): Promise<this> {
    const max = ScrtConnection.gasToken.fee((await this.fetchLimits()).gas)
    this.fees = { upload: max, init: max, exec: max, send: max }
    return this
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

  async getNonce (): Promise<{ accountNumber: number, sequence: number }> {
    const result: any = await this.api.query.auth.account({ address: this.address }) ?? (() => {
      throw new Error(`Cannot find account "${this.address}", make sure it has a balance.`)
    })
    const { account_number, sequence } = result.account
    return { accountNumber: Number(account_number), sequence: Number(sequence) }
  }

  async encrypt (codeHash: CodeHash, msg: Message) {
    if (!codeHash) {
      throw new Error("can't encrypt message without code hash")
    }
    const { encryptionUtils } = this.api as any
    const encrypted = await encryptionUtils.encrypt(codeHash, msg as object)
    return base64.encode(encrypted)
  }

  batch (): Batch<this> {
    return new ScrtBatch({ connection: this }) as unknown as Batch<this>
  }

}

export function decodeError (result: TxResponse) {
  const error = `ScrtConnection#execute: gRPC error ${result.code}: ${result.rawLog}`
  // make the original result available on request
  const original = structuredClone(result)
  Object.defineProperty(result, "original", {
    enumerable: false, get () { return original }
  })
  // decode the values in the result
  const txBytes = tryDecode(result.tx as Uint8Array)
  Object.assign(result, { txBytes })
  for (const i in result.tx.signatures) {
    Object.assign(result.tx.signatures, { [i]: tryDecode(result.tx.signatures[i as any]) })
  }
  for (const event of result.events) {
    for (const attr of event?.attributes ?? []) {
      //@ts-ignore
      try { attr.key   = tryDecode(attr.key)   } catch (e) {}
      //@ts-ignore
      try { attr.value = tryDecode(attr.value) } catch (e) {}
    }
  }
  return Object.assign(new Error(error), result)
}

const withIntoError = <T>(p: Promise<T>): Promise<T> =>
  p.catch(intoError)

const intoError = async (e: object)=>{
  e = await Promise.resolve(e)
  console.error(e)
  throw Object.assign(new Error(), e)
}

/** Used to decode Uint8Array-represented UTF8 strings in TX responses. */
const decoder = new TextDecoder('utf-8', { fatal: true })

/** Marks a response field as non-UTF8 to prevent large binary arrays filling the console. */
export const nonUtf8 = Symbol('(binary data, see result.original for the raw Uint8Array)')

/** Decode binary response data or mark it as non-UTF8 */
const tryDecode = (data: Uint8Array): string|Symbol => {
  try {
    return decoder.decode(data)
  } catch (e) {
    return nonUtf8
  }
}

function removeTrailingSlash (url: string) {
  while (url.endsWith('/')) { url = url.slice(0, url.length - 1) }
  return url
}

export {
  ScrtConnection as Connection
}

export type {
  TxResponse
}

export class ScrtBatch extends Batch<ScrtConnection> {
  /** Messages to encrypt. */
  messages: Array<
    |InstanceType<typeof MsgStoreCode>
    |InstanceType<typeof MsgInstantiateContract>
    |InstanceType<typeof MsgExecuteContract>
  > = []

  /** TODO: Upload in batch. */
  upload (
    code:    Parameters<Batch<ScrtConnection>["upload"]>[0],
    options: Parameters<Batch<ScrtConnection>["upload"]>[1]
  ) {
    throw new Error('ScrtBatch#upload: not implemented')
    return this
  }

  instantiate (
    code:    Parameters<Batch<ScrtConnection>["instantiate"]>[0],
    options: Parameters<Batch<ScrtConnection>["instantiate"]>[1]
  ) {
    this.messages.push(new MsgInstantiateContract({
      //callback_code_hash: '',
      //callback_sig:       null,
      sender:     this.connection!.address!,
      code_id:    ((typeof code === 'object') ? code.codeId : code) as CodeId,
      label:      options.label!,
      init_msg:   options.initMsg,
      init_funds: options.initSend,
    }))
    return this
  }

  execute (
    contract: Parameters<Batch<ScrtConnection>["execute"]>[0],
    message:  Parameters<Batch<ScrtConnection>["execute"]>[1],
    options:  Parameters<Batch<ScrtConnection>["execute"]>[2],
  ) {
    if (typeof contract === 'object') contract = contract.address!
    this.messages.push(new MsgExecuteContract({
      //callback_code_hash: '',
      //callback_sig:       null,
      sender:           this.connection!.address!,
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
      sender:             this.connection!.address,
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
      sender:             this.connection!.address,
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
          sender: this.connection!.address,
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
--offline --from=YOUR_MULTISIG_MEMBER_ACCOUNT_NAME_HERE --multisig=${this.connection!.address} \\
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
  label?:    Label
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