import type { CosmWasmClient, SigningCosmWasmClient } from '@hackbg/cosmjs-esm'
import { Deploy } from '@fadroma/agent'
import type { Address, CodeId, Chain, Message, Token, Core } from '@fadroma/agent'
import { Amino } from '@hackbg/cosmjs-esm'

type Connection = {
  chainId?: string,
  api: CosmWasmClient|Promise<CosmWasmClient>
}

export type SigningConnection = {
  log:      Core.Console,
  chainId?: string,
  address:  string,
  fees?:    any,
  api:      SigningCosmWasmClient|Promise<SigningCosmWasmClient>
}

export async function getCodes (
  { chainId, api }: Connection
) {
  api = await Promise.resolve(api)
  const codes: Record<CodeId, Deploy.UploadedCode> = {}
  const results = await api.getCodes()
  for (const { id, checksum, creator } of results||[]) {
    codes[id!] = new Deploy.UploadedCode({
      chainId:  chainId,
      codeId:   String(id),
      codeHash: checksum,
      uploadBy: creator
    })
  }
  return codes
}

export async function getCodeId (
  { api }: Connection,
  address: Address
): Promise<CodeId> {
  api = await Promise.resolve(api)
  const { codeId } = await api.getContract(address)
  return String(codeId)
}

export async function getContractsByCodeId (
  { api }: Connection,
  id: CodeId
) {
  api = await Promise.resolve(api)
  const addresses = await api.getContracts(Number(id))
  return addresses.map(address=>({address}))
}

export async function getCodeHashOfAddress (
  connection: Connection,
  address: Address
) {
  const api = await Promise.resolve(connection.api)
  const {codeId} = await api.getContract(address)
  return getCodeHashOfCodeId(connection, String(codeId))
}

export async function getCodeHashOfCodeId (
  { api }: Connection,
  codeId: CodeId
) {
  api = await Promise.resolve(api)
  const {checksum} = await api.getCodeDetails(Number(codeId))
  return checksum
}

export async function getLabel (
  { api }: Connection,
  address: Address
) {
  if (!address) {
    throw new Error('chain.getLabel: no address')
  }
  api = await Promise.resolve(api)
  const {label} = await api.getContract(address)
  return label
}

export async function query <T> (
  { api }: Connection,
  options: Parameters<Chain.Connection["queryImpl"]>[0]
): Promise<T> {
  api = await Promise.resolve(api)
  if (!options.address) {
    throw new Error('no contract address')
  }
  return await api.queryContractSmart(
    options.address,
    options.message,
  ) as T
}

export async function upload (
  { address, chainId, fees, api }: SigningConnection,
  options: Parameters<Chain.Agent["uploadImpl"]>[0]
) {
  if (!address) {
    throw new Error("can't upload contract without sender address")
  }
  api = await Promise.resolve(api)
  if (!(api?.upload)) {
    throw new Error("can't upload contract with an unauthenticated agent")
  }
  const result = await api.upload(
    address!,
    options.binary,
    fees?.upload || 'auto',
    "Uploaded by Fadroma"
  )
  return {
    chainId:   chainId,
    codeId:    String(result.codeId),
    codeHash:  result.checksum,
    uploadBy:  address,
    uploadTx:  result.transactionHash,
    uploadGas: result.gasUsed
  }
}

export async function instantiate (
  { api, address, chainId }: SigningConnection,
  options: Parameters<Chain.Agent["instantiateImpl"]>[0]
) {
  if (!this.address) {
    throw new Error("can't instantiate contract without sender address")
  }
  api = await Promise.resolve(api)
  if (!(api?.instantiate)) {
    throw new Error("can't instantiate contract without authorizing the agent")
  }
  const result = await (api as SigningCosmWasmClient).instantiate(
    address!,
    Number(options.codeId),
    options.initMsg,
    options.label!,
    options.initFee as Amino.StdFee || 'auto',
    { admin: address, funds: options.initSend, memo: options.initMemo }
  )
  return {
    codeId:   options.codeId,
    codeHash: options.codeHash,
    label:    options.label,
    initMsg:  options.initMsg,
    chainId:  chainId,
    address:  result.contractAddress,
    initTx:   result.transactionHash,
    initGas:  result.gasUsed,
    initBy:   address,
    initFee:  options.initFee || 'auto',
    initSend: options.initSend,
    initMemo: options.initMemo
  }
}

export async function execute (
  { api, address, chainId }: SigningConnection,
  options: Parameters<Chain.Agent["executeImpl"]>[0]
) {
  if (!address) {
    throw new Error("can't execute transaction without sender address")
  }
  api = await Promise.resolve(api)
  if (!(api?.execute)) {
    throw new Error("can't execute transaction without authorizing the agent")
  }
  return api.execute(
    address!,
    options.address,
    options.message,
    options.execFee!,
    options.execMemo,
    options.execSend
  )
}
