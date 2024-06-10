import { decode, u64 } from '@hackbg/borshest'

export async function fetchCurrentEpoch (connection: { 
  abciQuery: (path: string) => Promise<Uint8Array>
}) {
  const binary = await connection.abciQuery("/shell/epoch")
  return decode(u64, binary)
}
