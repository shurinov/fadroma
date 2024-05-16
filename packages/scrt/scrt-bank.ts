import { withIntoError } from './scrt-base'
import type { ScrtConnection } from './scrt-chain'
import type { ScrtSigningConnection } from './scrt-identity'

export async function fetchBalance ({ api }: ScrtConnection, parameters):
  Record<string, Record<string, string>>
{
  const result = {}
  return (await withIntoError(api.query.bank.balance({
    address,
    denom
  })))
    .balance!.amount!
}

export async function send ({ api }: ScrtSigningConnection, parameters) {
  return withIntoError(api.tx.bank.send(
    { from_address: this.address!, to_address: recipient, amount: amounts },
    { gasLimit: Number(options?.sendFee?.gas) }
  ))
}
