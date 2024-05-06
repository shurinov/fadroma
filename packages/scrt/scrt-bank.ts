import { withIntoError } from './scrt-core'

export async function fetchBalance ({ api }, parameters) {
  return (await withIntoError(this.api.query.bank.balance({
    address,
    denom
  })))
    .balance!.amount!
}

export async function send ({ api }, parameters) {
  return withIntoError(this.api.tx.bank.send(
    { from_address: this.address!, to_address: recipient, amount: amounts },
    { gasLimit: Number(options?.sendFee?.gas) }
  ))
}
