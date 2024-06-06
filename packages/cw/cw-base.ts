import CLI from '@hackbg/cmds'
import { Error, Console } from '@hackbg/fadroma'

export class CWError extends Error {}

export class CWConsole extends Console {
  constructor (label: string = '@fadroma/cw') {
    super(label)
  }
}

class CWBaseCLI extends CLI {
  constructor (...args: ConstructorParameters<typeof CLI>) {
    super(...args)
    this.log.label = ``
  }
}

export {
  CWBaseCLI as CLI
}
