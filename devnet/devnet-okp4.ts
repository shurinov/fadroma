import $ from '@hackbg/file'
import type { Port } from './devnet-base'
import DevnetContainer from './devnet-base'
import { OKP4Connection, OKP4MnemonicIdentity } from '@fadroma/cw'
import { packageRoot } from './package'

type OKP4Version = '5.0'

export default class OKP4Container<V extends OKP4Version> extends DevnetContainer {
  static v: Record<OKP4Version, Partial<OKP4Container<OKP4Version>>> = {
    '5.0': okp4Version('5.0')
  }
  constructor ({
    version = '5.0', ...properties
  }: Partial<OKP4Container<V> & {
    version: keyof typeof OKP4Container.v
  }>) {
    const supported = Object.keys(new.target.v)
    if (!supported.includes(version)) {
      throw new Error(
        `Unsupported version: ${version}. ` +
        `Specify one of the following: ${Object.keys(OKP4Container.v).join(', ')}`
      )
    }
    super({ ...new.target.v[version] || {}, ...properties })
  }

  get spawnEnv () {
    return { ...super.spawnEnv, TOKEN: 'uknow' }
  }

  async connect (parameter: string|Partial<OKP4MnemonicIdentity & {
    mnemonic?: string
  }> = {}): Promise<OKP4Connection> {
    if (typeof parameter === 'string') {
      parameter = { name: parameter }
    }
    const { mnemonic } = parameter
    await this.containerStarted
    return new OKP4Connection({
      chainId:  this.chainId,
      url:      this.url?.toString(),
      alive:    this.running,
      identity: new OKP4MnemonicIdentity(mnemonic
        ? parameter as { mnemonic: string }
        : await this.getIdentity(parameter))
    })
  }
}

export function okp4Version (v: OKP4Version) {
  const w = v.replace(/\./g, '_')
  return {
    platform:          `okp4_${w}`,
    containerImage:    `ghcr.io/hackbg/fadroma-devnet-okp4-${v}:master`,
    containerManifest: $(packageRoot, `okp4_${w}.Dockerfile`).path,
    daemon:            'okp4d',
    readyString:       'indexed block',
    portMode:          'rpc' as Port,
  }
}
