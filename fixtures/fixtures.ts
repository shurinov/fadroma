import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import ok from 'node:assert'
import { SyncFS, FileFormat, withTmpDir } from '@hackbg/file'
import { Console, bold, Chain, Connection, Identity, Backend } from '@hackbg/fadroma'
import { Deployment } from '@fadroma/deploy'

//@ts-ignore
export const here      = dirname(fileURLToPath(import.meta.url))
export const workspace = resolve(here)
export const fixture   = (...args: string[]) => resolve(here, ...args)
export const log       = new Console('Fadroma Testing')
export const nullWasm = readFileSync(fixture('empty.wasm'))
export const mnemonics = [
  'canoe argue shrimp bundle drip neglect odor ribbon method spice stick pilot produce actual recycle deposit year crawl praise royal enlist option scene spy',
  'bounce orphan vicious end identify universe excess miss random bench coconut curious chuckle fitness clean space damp bicycle legend quick hood sphere blur thing'
]

export const examples: Record<string, any> = {}

function example (name: string, wasm: any, hash: any) {
  const path = new SyncFS.File(fixture(wasm))
  return examples[name] = {
    name,
    path: fixture(wasm),
    data: path,
    url:  path.url,
    hash
  }
}

example('Empty',  'empty.wasm',                       'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
example('KV',     'fadroma-example-kv@HEAD.wasm',     '16dea8b55237085f24af980bbd408f1d6893384996e90e0ce2c6fc3432692a0d')
example('Echo',   'fadroma-example-echo@HEAD.wasm',   'a4983efece1306aa897651fff74cae18436fc3280fc430d11a4997519659b6fd')
example('Legacy', 'fadroma-example-legacy@HEAD.wasm', 'a5d58b42e686d9f5f8443eb055a3ac45018de2d1722985c5f77bad344fc00c3b')

export const tmpDir = () => {
  let x
  withTmpDir(dir=>x=dir)
  return x
}

export class TestProjectDeployment extends Deployment {

  t = this.template('t', {
    chainId:   'stub',
    codeId:    '1',
    cargoToml: "examples/contracts/scrt-kv/Cargo.toml"
  })

  // Single template instance with eager and lazy initMsg
  a1 = this.t.contract('a1', {
    initMsg: {}
  })

  a2 = this.t.contract('a2', {
    initMsg: () => ({})
  })

  a3 = this.t.contract('a3', {
    initMsg: async () => ({})
  })

  // Multiple contracts from the same template
  b = this.t.contracts({
    b1: { initMsg: {} },
    b2: { initMsg: () => ({}) },
    b3: { initMsg: async () => ({}) }
  })

}

export async function testConnectionWithBackend <
  A extends typeof Connection,
  I extends typeof Identity,
  B extends Backend,
> (backend: B, { Connection, Identity, code, initMsg = null }: {
  Connection: A,
  Identity:   I,
  code:       string,
  initMsg?:   any
}) {
  if ('genesisAccounts' in backend) {
    backend.genesisAccounts = { Alice: "123456789000", Bob: "987654321000" }
  }
  const console = new Console(`Testing ${bold(Connection.name)} + ${bold(backend.constructor.name)}`)
  const { equal, throws, rejects } = await import('node:assert')
  const sendFee   = Connection.gas(1000000).asFee()
  const uploadFee = Connection.gas(10000000).asFee()
  const initFee   = Connection.gas(10000000).asFee()
  const execFee   = Connection.gas(10000000).asFee()

  const [alice, bob] = await Promise.all([backend.connect('Alice'), backend.connect('Bob')])

  ok(alice.address && bob.address)

  await alice.connection.height

  const [aliceBalance, bobBalance] = await Promise.all([
    alice.fetchBalance(),
    bob.fetchBalance()
  ])

  const guest = await backend.connect({
    name: 'Guest',
    mnemonic: [
      'define abandon palace resource estate elevator',
      'relief stock order pool knock myth',
      'brush element immense task rapid habit',
      'angry tiny foil prosper water news'
    ].join(' ')
  } as any)

  equal((await guest.fetchBalance())??'0', '0')

  await alice.send(guest, [Connection.gas(1)], { sendFee })

  equal(await guest.fetchBalance(), '1')

  await bob.send(guest, [Connection.gas(11)], { sendFee })

  equal(await guest.fetchBalance(), '12')

  const uploaded = await alice.upload(code)

  equal(Object.keys(await bob.connection.fetchCodeInfo()).length, 1)

  equal(await bob.connection.fetchCodeInfo(uploaded.codeId), uploaded.codeHash)

  rejects(()=>bob.connection.fetchCodeInfo('missing'))

  const label = 'my-contract-label'

  const instance = await bob.instantiate(uploaded, { label, initMsg, initFee })

  equal(await guest.connection.fetchContractInfo(instance.address), uploaded.codeHash)

  const txResult = await alice.execute(instance, null as any, { execFee })

  const qResult = await alice.connection.query(instance, null as any)
  return { backend, alice, bob, guest }
}
