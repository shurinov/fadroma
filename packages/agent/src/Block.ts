/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import { bold } from './Util'
import type { Chain, Transaction } from '../index'

/** The building block of a blockchain, as obtained by
  * [the `fetchBlock` method of `Connection`](#method-connectionfetchblock)
  *
  * Contains zero or more transactions. */
export abstract class Block {
  constructor (properties: Pick<Block, 'chain'|'height'|'id'|'timestamp'>) {
    this.#chain    = properties.chain
    this.height    = properties.height
    this.id        = properties.id
    this.timestamp = properties.timestamp
  }

  #chain: Chain
  get chain () { return this.#chain }

  /** Unique ID of block. */
  id:         string
  /** Monotonically incrementing ID of block. */
  height:     number
  /** Timestamp of block */
  timestamp?: string
}

export async function fetchBlock (chain: Chain, ...args: Parameters<Chain["fetchBlock"]>):
  Promise<Block>
{
  if (args[0]) {
    if (typeof args[0] === 'object') {
      if ('height' in args[0]) {
        chain.log.debug(`Querying block by height ${args[0].height}`)
        return chain.getConnection().fetchBlockImpl({ height: args[0].height as number })
      } else if ('hash' in args[0]) {
        chain.log.debug(`Querying block by hash ${args[0].hash}`)
        return chain.getConnection().fetchBlockImpl({ hash: args[0].hash as string })
      }
    } else {
      throw new Error('Invalid arguments, pass {height:number} or {hash:string}')
    }
  }
  chain.log.debug(`Querying latest block`)
  return chain.getConnection().fetchBlockImpl()
}

export async function nextBlock (chain: Chain):
  Promise<number>
{
  return chain.height.then(async startingHeight=>{
    startingHeight = Number(startingHeight)
    if (isNaN(startingHeight)) {
      chain.log.warn('Current block height undetermined. Not waiting for next block')
      return Promise.resolve(NaN)
    }
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
          const height = await chain.height
          if (height > startingHeight) {
            chain.log.log(`Block height incremented to ${bold(String(height))}, proceeding`)
            return resolve(height as number)
          }
        }
        throw new Error('endpoint dead, not waiting for next block')
      } catch (e) {
        reject(e)
      }
    })
  })
}
