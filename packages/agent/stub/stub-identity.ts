/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/

import type { Address } from '../index'
import { assign } from '../src/Util'
import { Agent } from '../src/Agent'
import { Identity } from '../src/Identity'
import { SigningConnection } from '../src/Connection'
import { ContractInstance, UploadedCode } from '../src/Compute'
import { StubBatch } from './stub-tx'
import type { StubChain } from './stub-chain'
import type { StubBackend } from './stub-backend'

export class StubIdentity extends Identity {
  constructor (properties: ConstructorParameters<typeof Identity>[0] & { mnemonic?: string } = {}) {
    super(properties)
  }
}

export class StubAgent extends Agent {

  declare chain: StubChain

  getConnection (): StubSigningConnection {
    return new StubSigningConnection({
      address: this.identity.address,
      backend: this.chain.backend
    })
  }

  batch (): StubBatch {
    return new StubBatch({
      chain: this.chain,
      agent: this
    })
  }
}

export class StubSigningConnection extends SigningConnection {
  constructor (properties: Pick<StubSigningConnection, 'backend'|'address'>) {
    super()
    assign(this, properties, ['backend', 'address'])
  }

  backend: StubBackend

  address: Address

  async sendImpl (...args: Parameters<SigningConnection["sendImpl"]>): Promise<void> {
    const { backend } = this
    const { outputs } = args[0]
    const senderBalances = { ...backend.balances.get(this.address) || {}}
    for (const [recipient, sends] of Object.entries(outputs)) {
      const recipientBalances =
        { ...backend.balances.get(recipient) || {}}
      for (const [denom, amount] of Object.entries(sends)) {
        if (!Object.keys(senderBalances).includes(denom)) {
          throw new Error(`sender has no balance in ${denom}`)
        }
        const amountN = BigInt(amount)
        if (senderBalances[denom] < amountN) {
          throw new Error(
            `sender has insufficient balance in ${denom}: ${senderBalances[denom]} < ${amountN}`
          )
        }
        senderBalances[denom] -= amountN
        recipientBalances[denom] = (recipientBalances[denom] ?? 0n) + amountN
        backend.balances.set(this.address, senderBalances)
        backend.balances.set(recipient, recipientBalances)
        // FIXME: revert balances on failure
      }
    }
  }

  async uploadImpl (
    ...args: Parameters<SigningConnection["uploadImpl"]>
  ): Promise<UploadedCode> {
    return new UploadedCode(await this.backend.upload(args[0].binary))
  }

  async instantiateImpl (
    ...args: Parameters<SigningConnection["instantiateImpl"]>
  ): Promise<ContractInstance & { address: Address }> {
    return new ContractInstance(await this.backend.instantiate({
      initBy: this.address!,
      codeId: args[0].codeId
    })) as ContractInstance & {
      address: Address
    }
  }

  async executeImpl <T> (
    ...args: Parameters<SigningConnection["executeImpl"]>
  ): Promise<T> {
    return {} as T
  }

}
