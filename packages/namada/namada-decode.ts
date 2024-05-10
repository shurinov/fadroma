import * as TX from './namada-tx'
import init, { Decode } from './pkg/fadroma_namada.js'

export function decodeTxs (txs: unknown[], height: number|bigint): TX.Transaction[] {
  const txsDecoded: TX.Transaction[] = []
  for (const i in txs) {
    try {
      txsDecoded[i] = TX.Transaction.fromDecoded(txs[i] as any)
    } catch (error) {
      console.error(error)
      console.warn(`Failed to decode transaction #${i} in block ${height}, see above for details.`)
      txsDecoded[i] = new TX.Transactions.Undecoded({
        data: txs[i] as any,
        error: error as any
      })
    }
  }
  return txsDecoded
}

export async function initDecoder (decoder: string|URL|Uint8Array) {
  if (decoder instanceof Uint8Array) {
    await init(decoder)
  } else if (decoder) {
    await init(await fetch(decoder))
  }
}

export { Decode }
