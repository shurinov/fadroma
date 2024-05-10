import { base16, SHA256, Validator } from '@fadroma/agent'
import type { Address } from '@fadroma/agent'
import { Amino, Proto } from '@hackbg/cosmjs-esm'
import type { CWChain, CWConnection } from './cw-connection'

export async function getValidators <V extends typeof CWValidator> (
  connection: CWConnection,
  { pagination, details, Validator = CWValidator as V }: {
    pagination?: [number, number],
    details?:    boolean,
    Validator?:  V
  } = {}
): Promise<Array<InstanceType<V>>> {
  const tendermintClient = await connection.tendermintClient!
  let response
  if (pagination && (pagination as Array<number>).length !== 0) {
    if (pagination.length !== 2) {
      throw new Error("pagination format: [page, per_page]")
    }
    response = await tendermintClient!.validators({
      page:     pagination[0],
      per_page: pagination[1],
    })
  } else {
    response = await tendermintClient!.validatorsAll()
  }
  // Sort validators by voting power in descending order.
  const validators = [...response.validators].sort((a,b)=>(
    (a.votingPower < b.votingPower) ?  1 :
    (a.votingPower > b.votingPower) ? -1 : 0
  ))
  const result: Array<InstanceType<V>> = []
  for (const { address, pubkey, votingPower, proposerPriority } of validators) {
    const info = new Validator({
      chain:     connection.chain,
      address:   base16.encode(address),
      publicKey: pubkey?.data,
      votingPower,
      proposerPriority,
    }) as InstanceType<V>
    result.push(info)
    if (details) {
      await info.fetchDetails()
    }
  }
  return result
}

class CWValidator extends Validator {
  constructor ({
    publicKey, votingPower, proposerPriority, ...properties
  }: ConstructorParameters<typeof Validator>[0] & {
    publicKey?:        string|Uint8Array|Array<number>
    votingPower?:      string|number|bigint
    proposerPriority?: string|number|bigint
  }) {
    super(properties)
    if ((publicKey instanceof Uint8Array)||(publicKey instanceof Array)) {
      publicKey = base16.encode(new Uint8Array(publicKey))
    }
    this.publicKey = publicKey!
    if (votingPower) {
      this.votingPower = BigInt(votingPower)
    }
    if (proposerPriority) {
      this.proposerPriority = BigInt(proposerPriority)
    }
  }
  publicKey:         string
  votingPower?:      bigint
  proposerPriority?: bigint
  get publicKeyBytes () {
    return base16.decode(this.publicKey)
  }
  get publicKeyHash () {
    return base16.encode(SHA256(this.publicKeyBytes).slice(0, 20))
  }
  get chain (): CWChain {
    return super.chain as unknown as CWChain
  }

  async fetchDetails (): Promise<this> {
    const request = Proto.Cosmos.Staking.v1beta1.Query.QueryValidatorRequest.encode({
      validatorAddr: this.address
    }).finish()
    const value = await this.chain.getConnection().abciQuery(
      '/cosmos.staking.v1beta1.Query/Validator',
      request
    )
    const decoded = Proto.Cosmos.Staking.v1beta1.Query.QueryValidatorResponse.decode(value)
    return this
  }
}

export {
  CWValidator as Validator
}
