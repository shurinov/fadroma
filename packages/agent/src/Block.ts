/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import { assign, hideProperties } from './Util'
import type { Chain, Transaction } from '../index'

/** The building block of a blockchain, as obtained by
  * [the `fetchBlock` method of `Connection`](#method-connectionfetchblock)
  *
  * Contains zero or more transactions. */
export abstract class Block {
  /** Connection to the chain to which this block belongs. */
  chain?: Chain
  /** Monotonically incrementing ID of block. */
  height: number
  /** Content-dependent ID of block. */
  hash:   string

  constructor (properties: Partial<Block> = {}) {
    assign(this, properties, ["chain", "height", "hash"])
    hideProperties(this, "chain")
  }

  async fetchTransactions ():
    Promise<Transaction[]>
  async fetchTransactions (options: { byId: true }):
    Promise<Record<string, Transaction>>
  async fetchTransactions (...args: unknown[]): Promise<unknown> {
    return []
  }
}

