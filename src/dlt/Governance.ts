/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import type { Address } from '../../index.ts'

export type ProposalResult = 'Pass'|'Fail'

export class Proposal {
  id:     bigint
  votes:  Vote[]
  result: 'Pass'|'Fail'
  constructor (properties: Pick<Proposal, 'id'|'votes'|'result'>) {
    this.id     = properties.id
    this.votes  = properties.votes
    this.result = properties.result
  }
}

export type VoteValue = 'Yay'|'Nay'|'Abstain'

export class Vote {
  proposal: Proposal
  voter:    Address
  power:    bigint
  value:    VoteValue
  constructor (properties: Pick<Vote, 'proposal'|'voter'|'power'|'value'>) {
    this.proposal = properties.proposal
    this.voter    = properties.voter
    this.power    = properties.power
    this.value    = properties.value
  }
}
