/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import { assign, bold } from './Util'
import type { Chain } from '../index'

/** The building block of a blockchain, as obtained by
  * [the `fetchBlock` method of `Connection`](#method-connectionfetchblock)
  *
  * Contains zero or more transactions. */
export abstract class Block {
  constructor (properties: Pick<Block, 'hash'|'chain'|'header'|'height'|'transactions'>) {
    const height = properties?.height ?? properties?.header?.height
    if (!height) {
      throw new Error("Can't construct Block without at least specifying height")
    }
    this.#chain       = properties?.chain
    this.hash         = properties?.hash
    this.header       = properties?.header
    this.height       = BigInt(height)
    this.transactions = properties?.transactions || []
  }
  /** Private reference to chain to which this block belongs. */
  readonly #chain?: Chain
  /** Chain to which this block belongs. */
  get chain () { return this.#chain }
  /** ID of chain to which this block belongs. */
  get chainId () { return this.chain?.id }
  /** Unique ID of block. */
  readonly hash?: string
  /** Unique identifying hash of block. */
  readonly height?: bigint
  /** Contents of block header. */
  readonly header?: { height?: string|number|bigint }
  /** Transactions in block */
  readonly transactions?: Transaction[] = []
}

/** A transaction in a block on a chain. */
export class Transaction {
  constructor (properties: Pick<Transaction, 'hash'|'block'|'data'>) {
    this.#block = properties?.block
    this.hash   = properties?.hash
    this.data   = properties?.data
  }
  readonly #block?: Block
  /** Block to which this transaction belongs. */
  get block () { return this.#block }
  /** Hash of block to which this transaction belongs. */
  get blockHash () { return this.block?.hash }
  /** Height of block to which this transaction belongs. */
  get blockHeight () { return this.block?.height }
  /** Chain to which this transaction belongs. */
  get chain () { return this.block?.chain }
  /** ID of chain to which this transaction belongs. */
  get chainId () { return this.block?.chain?.id }
  /** Unique identifying hash of transaction. */
  readonly hash?: string
  /** Any custom data attached to the transaction. */
  readonly data?: unknown
}

/** Implementation of Connection#fetchBlock -> Connection#fetchBlockImpl */
export async function fetchBlock (chain: Chain, ...args: Parameters<Chain["fetchBlock"]>):
  Promise<Block>
{
  if (args[0]) {
    if (typeof args[0] === 'object') {
      if ('height' in args[0]) {
        chain.log.debug(`Fetching block with height ${args[0].height}`)
        return chain.getConnection().fetchBlockImpl({
          raw:    args[0].raw,
          height: BigInt(args[0].height as number)
        })
      } else if ('hash' in args[0]) {
        chain.log.debug(`Fetching block with hash ${args[0].hash}`)
        return chain.getConnection().fetchBlockImpl({
          raw:  args[0].raw,
          hash: args[0].hash as string,
        })
      }
    } else {
      throw new Error('Invalid arguments, pass {height:number} or {hash:string}')
    }
  }
  chain.log.debug(`Fetching latest block`)
  return chain.getConnection().fetchBlockImpl()
}

/** Implementation of Chain#fetchNextBlock -> Connection#fetchNextBlockImpl */
export async function fetchNextBlock (chain: Chain):
  Promise<bigint>
{
  return chain.fetchHeight().then(async startingHeight=>{
    startingHeight = BigInt(startingHeight)
    chain.log.log(
      `Waiting for block > ${bold(String(startingHeight))}`,
      `(polling every ${chain.blockInterval}ms)`
    )
    const t = + new Date()
    return new Promise(async (resolve, reject)=>{
      try {
        while (chain.getConnection().alive) {
          await new Promise(ok=>setTimeout(ok, chain.blockInterval))
          chain.log(
            `Waiting for block > ${bold(String(startingHeight))} ` +
            `(${((+ new Date() - t)/1000).toFixed(3)}s elapsed)`
          )
          const height = await chain.fetchHeight()
          if (height > startingHeight) {
            chain.log.log(`Block height incremented to ${bold(String(height))}, proceeding`)
            return resolve(BigInt(height as unknown as number))
          }
        }
        throw new Error('endpoint dead, not waiting for next block')
      } catch (e) {
        reject(e)
      }
    })
  })
}
