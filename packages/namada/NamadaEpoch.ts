import { decode, u64 } from '@hackbg/borshest'
import type { Decode } from './NamadaDecode'
import type NamadaConnection from './NamadaConnection'

export async function fetchEpoch (
  connection: Pick<NamadaConnection, 'abciQuery'>
) {
  return decode(u64, await connection.abciQuery("/shell/epoch"))
}

export async function fetchEpochFirstBlock (
  connection: Pick<NamadaConnection, 'abciQuery'>
) {
  return Number(decode(u64, await connection.abciQuery(
    '/shell/first_block_height_of_current_epoch'
  )))
}

export async function fetchEpochDuration (
  connection: Pick<NamadaConnection, 'decode'|'fetchStorageValueImpl'>
) {
  const { epochDuration } = connection.decode.storage_keys()
  const binary = await connection.fetchStorageValueImpl(epochDuration)
  return connection.decode.epoch_duration(binary)
}
