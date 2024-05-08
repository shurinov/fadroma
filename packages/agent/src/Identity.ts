/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import { Logged, assign } from './Util'
import type { Address } from './Types'

/** A cryptographic identity. */
export class Identity extends Logged {
  constructor (properties?: Partial<Identity>) {
    super(properties)
    assign(this, properties, ['name', 'address'])
  }
  /** Display name. */
  name?:    Address
  /** Unique identifier. */
  address?: Address
  /** Sign some data with the identity's private key. */
  sign (doc: any): unknown {
    throw new Error("can't sign: stub")
  }
}

    //if ((this.identity && (this.identity.name||this.identity.address))) {
      //const identityColor = randomColor({ // address takes priority in determining color
        //luminosity: 'dark', seed: this.identity.address||this.identity.name
      //})
      //this.log.label += ' '
      //this.log.label += colors.bgHex(identityColor).whiteBright(
        //` ${this.identity.name||this.identity.address} `
      //)
    //}
    //if ((this.identity && (this.identity.name||this.identity.address))) {
      //let myTag = `${this.identity.name||this.identity.address}`
      //const myColor = randomColor({ luminosity: 'dark', seed: myTag })
      //myTag = colors.bgHex(myColor).whiteBright.bold(myTag)
      //tag = [tag, myTag].filter(Boolean).join(':')
    //}
