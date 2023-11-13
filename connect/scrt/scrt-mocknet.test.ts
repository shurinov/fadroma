import assert from 'node:assert'
import * as Mocknet from './scrt-mocknet'

export default async function testScrtMocknet () {
  const state = new Mocknet.State()
  const agent = new Mocknet.Agent({ state })
  const contract = new Mocknet.Contract(state)
  // **Base64 I/O:** Fields that are of type `Binary` (query responses and the `data` field of handle
  // responses) are returned by the contract as Base64-encoded strings
  // If `to_binary` is used to produce the `Binary`, it's also JSON encoded through Serde.
  // These functions are used by the mocknet code to encode/decode the base64.
  assert.equal(Mocknet.b64toUtf8('IkVjaG8i'), '"Echo"')
  assert.equal(Mocknet.utf8toB64('"Echo"'), 'IkVjaG8i')
}