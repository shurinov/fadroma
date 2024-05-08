/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import type { CodeHash, Name } from '../index'
import { Console } from './Util'
import * as Compute from './Compute'

/** A deploy store collects receipts corresponding to individual instances of Deployment,
  * and can create Deployment objects with the data from the receipts. */
export class DeployStore extends Map<Name, Compute.DeploymentState> {
  log = new Console(this.constructor.name)

  constructor () {
    super()
  }

  selected?: Compute.DeploymentState = undefined

  get (name?: Name): Compute.DeploymentState|undefined {
    if (arguments.length === 0) {
      return this.selected
    }
    return super.get(name!)
  }

  set (name: Name, state: Partial<Compute.Deployment>|Compute.DeploymentState): this {
    if (state instanceof Compute.Deployment) state = state.serialize()
    return super.set(name, state)
  }
}

export class UploadStore extends Map<CodeHash, Compute.UploadedCode> {
  log = new Console(this.constructor.name)

  constructor () {
    super()
  }

  get (codeHash: CodeHash): Compute.UploadedCode|undefined {
    return super.get(codeHash)
  }

  set (codeHash: CodeHash, value: Partial<Compute.UploadedCode>): this {
    if (!(value instanceof Compute.UploadedCode)) {
      value = new Compute.UploadedCode(value)
    }
    if (value.codeHash && (value.codeHash !== codeHash)) {
      throw new Error('tried to store upload under different code hash')
    }
    return super.set(codeHash, value as Compute.UploadedCode)
  }
}
