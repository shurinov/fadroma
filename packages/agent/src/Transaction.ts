/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import type { Block } from './Block'
import type { Chain } from './Chain'
import type { Agent } from './Agent'
import { Logged } from './Util'
import * as Token from './Token'

/** A transaction in a block on a chain. */
export class Transaction {
  block? :  Block
  hash:     string
  type:     unknown
  data:     unknown
  gasLimit: Token.Native[]
  gasUsed:  Token.Native[]
  status:   'Pending'|'Accepted'|'Rejected'
}
