/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import { assign } from '../Util.ts'
import type { Chain, Address } from '../../index.ts'

export class Validator {
  constructor (properties: Pick<Validator, 'chain'|'address'>) {
    this.#chain = properties.chain
    assign(this, properties, [ "address" ])
  }
  #chain: Chain
  get chain () {
    return this.#chain
  }
  address!: Address
}
