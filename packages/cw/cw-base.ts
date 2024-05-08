import CLI from '@hackbg/cmds'
import { Error, Console } from '@fadroma/agent'

export class CWError extends Error {}

export class CWConsole extends Console { label = '@fadroma/cw' }

class CWBaseCLI extends CLI {
  constructor (...args: ConstructorParameters<typeof CLI>) {
    super(...args)
    this.log.label = ``
  }
}

export {
  CWBaseCLI as CLI
}
