import { Contract, Token } from '@hackbg/fadroma'

/** Client to a specific SNIP-721 non-fungible token contract. */
export class Snip721 extends Contract implements Token.NonFungible {

  isFungible = () => false

  get id () {
    return this.address!
  }

}
