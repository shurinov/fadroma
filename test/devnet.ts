#!/usr/bin/env -S node --import @ganesha/esbuild

import * as Devnet from '@fadroma/devnet'
import * as OCI from '@fadroma/oci'
const config = Devnet.devnetPlatforms['scrt'].versions['1.12']
console.log({config})
const devnet = new Devnet.DevnetContainer(config)
console.log({devnet})
await devnet.created
await devnet.started
await devnet.paused
await devnet.removed
