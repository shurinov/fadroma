/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import assert, { equal, throws, rejects } from 'node:assert'
import {
  Error,
  Chain,
  Connection,
  Backend,
  Identity,
  Batch,
} from '@hackbg/fadroma'
import { fixture } from '@fadroma/fixtures'
import * as Stub from '@fadroma/stub'

import { Suite } from '@hackbg/ensuite'
export default new Suite([
  ["height", testHeight],
  ["codes",  testCodes],
  ["auth",   testAuth],
  ["batch",  testBatch],
  ["client", testClient],
])

export async function testHeight () {
  const connection = new Stub.Chain()
  assert(await connection.height)
  assert(await connection.nextBlock)
  Object.defineProperty(connection, 'height', { configurable: true, get () {
    return Promise.resolve('NaN')
  } })
  assert.equal(await connection.nextBlock, NaN)
  Object.defineProperty(connection, 'height', { configurable: true, get () {
    Object.defineProperty(connection, 'height', { configurable: true, get () {
      throw new Error('yeet')
    } })
    return Promise.resolve(0)
  } })
  assert.rejects(()=>connection.nextBlock)
  assert(await connection.query('', {}))
}

export async function testCodes () {
  const backend = new Stub.Backend({})
  backend.uploads.set("123", { codeHash: "abc", codeData: new Uint8Array() } as any)
  backend.instances.set("stub1abc", {
    codeId:  "123",
    address: 'stub1instancefoo',
    initBy:  'stub1instancefoo'
  })
  const connection = new Stub.Chain({ backend })
  const { codeId, codeHash } = await connection.fetchContractInfo('stub1abs')
  assert.equal(codeId,   "123")
  assert.equal(codeHash, "abc")
  assert.equal((await connection.fetchCodeInfo('123')).codeHash, "abc")
}

export async function testAuth () {
  throws(()=>new Identity().sign(''))
  const identity = new Identity({ name: 'foo', address: 'foo1bar' })
  const agent = await new Stub.Chain().authenticate(identity)
  //assert.equal(connection[Symbol.toStringTag], 'stub (mocknet): testing1')
  assert(agent instanceof Stub.Connection)
  assert(agent.identity?.address)
  assert(agent.identity?.name)
  agent.chain.height
  agent.chain.nextBlock
  await agent.chain.query('', {})
  await agent.send({ 'x': {} })
  //await agent.sendMany([])

  await agent.upload(fixture('empty.wasm'), {})
  await agent.upload(new Uint8Array(), {})

  await agent.instantiate('1', { label: 'foo', initMsg: 'bar' })
  await agent.instantiate({ codeId: '2' }, { label: 'foo', initMsg: {} })
  rejects(()=>agent.instantiate('foo', {}))
  rejects(()=>agent.instantiate('', {}))
  rejects(()=>agent.instantiate('1', { label: 'foo' }))
  rejects(()=>agent.instantiate('1', { initMsg: {} }))

  await agent.chain.fetchCodeInstances('1')
  rejects(agent.chain.fetchCodeInstances(null as any))
  await agent.chain.fetchCodeInstances(['1', '2'])
  await agent.chain.fetchCodeInstances({'1': Contract, '2': Contract})

  await agent.execute('stub', {}, {})
  await agent.execute('stub', 'method', {})
  await agent.execute('stub', {'method':'man'}, {})
  await agent.execute({ address: 'stub' }, {}, {})
  await agent.execute({ address: 'stub' }, 'method', {})
  await agent.execute({ address: 'stub' }, {'method':'crystal'}, {})

  //throws(()=>new Stub.Connection().balance)
  //throws(()=>new Stub.Connection().getBalanceOf(null as any))
  //throws(()=>new Stub.Connection().getBalanceOf('addr', false as any))
  //assert(await new Stub.Connection().getBalanceOf('addr'))
  //throws(()=>new Stub.Connection().getBalanceIn(null as any))
  //throws(()=>new Stub.Connection().getBalanceIn('token', null as any))
  //assert(await new Stub.Connection().getBalanceIn('token', 'addr'))
}

export async function testBatch () {
  const connection = await new Stub.Chain().authenticate(new Identity())
  const batch = connection.batch()
    .upload({})
    .upload({})
    .instantiate({}, {})
    .instantiate({}, {})
    .execute({}, {})
    .execute({}, {})
  assert(batch instanceof Batch)
  await batch.submit()
}

export async function testClient () {
  const instance = { address: 'addr', codeHash: 'code-hash-stub', codeId: '100' }
  const agent    = new Stub.Agent({ chain: new Stub.Chain(), identity: new Identity() })
  const client   = await agent.chain.fetchContractInfo('addr')
  assert.equal(client.agent, agent)
  assert.equal(client.address, 'addr')
  await client.query({foo: 'bar'})
  await client.execute({foo: 'bar'})
  await agent.chain.fetchContractInfo('addr')
  assert(new Contract({ address: 'addr' }))
  assert.throws(()=>new Contract({}).query({}))
  assert.throws(()=>new Contract({ agent }).query({}))
  assert.throws(()=>new Contract({}).execute({}))
  assert.throws(()=>new Contract({ agent }).execute({}))
  assert.throws(()=>new Contract({ agent: {} as any }).execute({}))
}
