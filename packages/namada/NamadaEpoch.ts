import { decode, u64 } from '@hackbg/borshest'

export async function fetchCurrentEpoch (connection: { 
  abciQuery: (path: string) => Promise<Uint8Array>
}) {
  const binary = await connection.abciQuery("/shell/epoch")
  return decode(u64, binary)
}

export async function fetchCurrentEpochFirstBlock (connection: {
  abciQuery: (path: string) => Promise<Uint8Array>
}) {
  const epochFirstBlock = await connection.abciQuery(
    '/shell/first_block_height_of_current_epoch'
  );
  return Number(decode(u64, epochFirstBlock));
}
