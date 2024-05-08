/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import { assign } from './Util'
import type { Connection, Address } from '../index'

export type ProposalResult = 'Pass'|'Fail'

export class Proposal {
  chain?: Connection
  id:     bigint
  votes:  Vote[]
  result: 'Pass'|'Fail'
  constructor (properties: Partial<Proposal> = {}) {
    assign(this, properties, ['chain', 'id', 'votes', 'result'])
  }
}

export type VoteValue = 'Yay'|'Nay'|'Abstain'

export class Vote {
  proposal: Proposal
  voter:    Address
  power:    bigint
  value:    VoteValue
  constructor (properties: Partial<Vote> = {}) {
    assign(this, properties, ['proposal', 'voter', 'power', 'value'])
  }
}