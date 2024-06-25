import { decode, u64 } from '@hackbg/borshest'
import type { Decode } from './NamadaDecode'

export async function fetchEpoch (connection: {
  abciQuery (path: string): Promise<Uint8Array>
}) {
  const binary = await connection.abciQuery("/shell/epoch")
  return decode(u64, binary)
}

export async function fetchEpochFirstBlock (connection: {
  abciQuery (path: string): Promise<Uint8Array>
}) {
  const epochFirstBlock = await connection.abciQuery(
    '/shell/first_block_height_of_current_epoch'
  );
  return Number(decode(u64, epochFirstBlock))
}

export async function fetchEpochDuration (connection: {
  fetchStorageValueImpl (key: string): Promise<Uint8Array>,
  decode: {
    storage_keys (): ({ epochDuration: string })
    epoch_duration (source: Uint8Array): {
      minNumOfBlocks: Number,
      minDuration:    Number,
    }
  }
}) {
  const { epochDuration } = connection.decode.storage_keys()
  const binary = await connection.fetchStorageValueImpl(epochDuration)
  return connection.decode.epoch_duration(binary)
}
