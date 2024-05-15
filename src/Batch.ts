/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/
import { Logged } from './Util'
import type { Chain, Agent } from '../index'

/** Builder object for batched transactions. */
export class Batch extends Logged {
  constructor (
    properties: ConstructorParameters<typeof Logged>[0] & Pick<Batch, 'agent'>
  ) {
    super(properties)
    this.agent = properties.agent
  }

  /** The chain targeted by the batch. */
  get chain (): Chain {
    return this.agent.chain
  }

  /** The agent that will broadcast the batch. */
  agent: Agent

  /** Add an upload message to the batch. */
  upload (...args: Parameters<Agent["upload"]>): this {
    this.log.warn('upload: stub (not implemented)')
    return this
  }
  /** Add an instantiate message to the batch. */
  instantiate (...args: Parameters<Agent["instantiate"]>): this {
    this.log.warn('instantiate: stub (not implemented)')
    return this
  }
  /** Add an execute message to the batch. */
  execute (...args: Parameters<Agent["execute"]>): this {
    this.log.warn('execute: stub (not implemented)')
    return this
  }
  /** Submit the batch. */
  async submit (...args: unknown[]): Promise<unknown> {
    this.log.warn('submit: stub (not implemented)')
    return {}
  }
}

