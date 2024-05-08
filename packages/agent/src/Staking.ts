/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import { assign } from './Util'
import type { Connection, Address } from '../index'

export class Validator {
  chain?:  Connection
  address: Address
  constructor (properties: Partial<Validator> = {}) {
    assign(this, properties, ['chain', 'address'])
  }
}
