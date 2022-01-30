import {
  DockerizedScrtNode, ChainNodeOptions,
  TextFile, dirname, fileURLToPath
} from '@fadroma/scrt'

const __dirname = dirname(fileURLToPath(import.meta.url))

export class DockerizedScrtNode_1_2 extends DockerizedScrtNode {

  readonly chainId: string = 'supernova-1'

  readonly image:   string = "enigmampc/secret-network-sw-dev:v1.2.0"

  readonly readyPhrase = 'indexed block'

  readonly initScript = new TextFile(__dirname, 'init.sh')

  constructor (options: ChainNodeOptions = {}) {
    super()
    if (options.image) this.image = options.image
    if (options.chainId) this.chainId = options.chainId
    if (options.identities) this.identitiesToCreate = options.identities
    this.setDirectories(options.stateRoot)
  }

}
