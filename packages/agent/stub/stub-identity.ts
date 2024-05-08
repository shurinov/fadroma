/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/

import { Agent } from '../src/Agent'
import { Identity } from '../src/Identity'
import { SigningConnection } from '../src/Connection'
import type { Address } from '../index'
import { ContractInstance, UploadedCode } from '../src/Compute'
import { StubBatch } from './stub-tx'
import type { StubChain, StubBackend } from './stub-chain'

export class StubIdentity extends Identity {}

export class StubAgent extends Agent {
  declare chain: StubChain
  declare connection: StubSigningConnection

  batch (): StubBatch {
    return new StubBatch({ agent: this })
  }
}

export class StubSigningConnection extends SigningConnection {

  backend: StubBackend
  address: Address

  sendImpl (...args: Parameters<SigningConnection["sendImpl"]>): Promise<void> {
    if (!this.address) {
      throw new Error('not authenticated')
    }
    const { backend } = this
    const senderBalances =
      { ...backend.balances.get(this.address) || {}}
    const recipientBalances =
      { ...backend.balances.get(recipient) || {}}
    for (const sum of sums) {
      if (!Object.keys(senderBalances).includes(sum.denom)) {
        throw new Error(`sender has no balance in ${sum.denom}`)
      }
      const amount = BigInt(sum.amount)
      if (senderBalances[sum.denom] < amount) {
        throw new Error(
          `sender has insufficient balance in ${sum.denom}: ${senderBalances[sum.denom]} < ${amount}`
        )
      }
      senderBalances[sum.denom] =
        senderBalances[sum.denom] - amount
      recipientBalances[sum.denom] =
        (recipientBalances[sum.denom] ?? BigInt(0)) + amount
    }
    backend.balances.set(this.address, senderBalances)
    backend.balances.set(recipient, recipientBalances)
    return Promise.resolve()
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
