/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import type { Block } from './Block'
import type { Chain } from './Chain'
import type { Agent } from './Agent'
import { Logged } from './Util'
import * as Token from './dlt/Token'

/** A transaction in a block on a chain. */
export class Transaction {
  constructor (properties: Pick<Transaction, 'id'|'block'>) {
    this.#block = properties.block
    this.id = properties.id
  }

  #block?: Block
  get block () {
    return this.#block
  }

  id: string

}