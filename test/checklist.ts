#!/usr/bin/env -S node --import @ganesha/esbuild

import { Console, colors, bold } from '@hackbg/logs'
import * as SN from '@fadroma/scrt'
import * as CW from '@fadroma/cw'
import * as Namada from '@fadroma/namada'
import * as OCI from '@fadroma/oci'

const console = new Console('Checklist')

const OK = colors.black.bgGreen   // ok
const NO = colors.black.bgRed     // test fails
const NI = colors.black.bgYellow  // not implemented
const NA = colors.black.bgBlue    // not applicable

const platforms = { SN, CW, Namada, OCI }

const tests: Array<[string, Function]> = [

  ["connect", (platform: any) => {
    if (platform["connect"]) return OK
  }],

  ["devnet", (platform: any) => {
    if (platform["devnet"]) return OK
  }],

  ["testnet", (platform: any) => {
    if (platform["testnet"]) return OK
  }],

  ["mainnet", (platform: any) => {
    if (platform["mainnet"]) return OK
  }],

  ["Chain", (platform: any) => {
    if (platform["Chain"]) return OK
  }],

  ["Chain#height", async (platform: any) => {
    const Chain = platform["Chain"]
    const chain = new Chain({})
    if (await chain["height"]) return OK
  }],

  ["Chain#nextBlock", async (platform: any) => {
    const Chain = platform["Chain"]
    const chain = new Chain({})
    if (await chain["nextBlock"]) return OK
  }],

  ["Chain#fetchBlock", async (platform: any) => {
    const Chain = platform["Chain"]
    const chain = new Chain({})
    if (await chain["nextBlock"]) return OK
  }],

  ["Chain#fetchBalance", async (platform: any) => {
    const Chain = platform["Chain"]
    const chain = new Chain({})
    if (await chain.fetchBalance()) return OK
  }],

  ["Chain#fetchCodeInfo", async (platform: any) => {
    const Chain = platform["Chain"]
    const chain = new Chain({})
    if (await chain.fetchCodeInfo()) return OK
  }],

  ["Chain#fetchCodeInstances", async (platform: any) => {
    const Chain = platform["Chain"]
    const chain = new Chain({})
    if (await chain.fetchCodeInstances()) return OK
  }],

  ["Chain#fetchContractInfo", async (platform: any) => {
    const Chain = platform["Chain"]
    const chain = new Chain({})
    if (await chain.fetchContractInfo()) return OK
  }],

  ["Chain#query", async (platform: any) => {
    const Chain = platform["Chain"]
    const chain = new Chain({})
    if (await chain.query()) return OK
  }],

  ["Agent", async (platform: any) => {
    if (platform["Agent"]) return OK
  }],

  ["Agent#getConnection", async (platform: any) => {
    const Agent = platform["Chain"]
    const agent = new Agent({})
    if (await agent.getConnection()) return OK
  }],

  ["Agent#fetchBalance", async (platform: any) => {
    const Agent = platform["Chain"]
    const agent = new Agent({})
    if (await agent.fetchBalance()) return OK
  }],

  ["Agent#send", async (platform: any) => {
    const Agent = platform["Chain"]
    const agent = new Agent({})
    if (await agent.send()) return OK
  }],

  ["Agent#upload", async (platform: any) => {
    const Agent = platform["Chain"]
    const agent = new Agent({})
    if (await agent.upload()) return OK
  }],

  ["Agent#instantiate", async (platform: any) => {
    const Agent = platform["Chain"]
    const agent = new Agent({})
    if (await agent.instantiate()) return OK
  }],

]

let table = ''
const errors = []

for (const [feature, test] of tests) {
  table += bold(feature.padEnd(25))
  for (const [platformName, platform] of Object.entries(platforms)) {
    let color = NI
    try {
      color = await Promise.resolve(test(platform)) || color
    } catch (e) {
      errors.push(e)
      color = NO
    }
    table += color(' ' + platformName.padEnd(6) + ' ') + ' '
  }
  table += '\n'
}

for (const error of errors) {
  console.error(error)
  process.stdout.write('\n')
}

process.stdout.write(table)

// For SCRT, CW, Namada, OCI:
// - connect
// - devnet
// - testnet
// - mainnet
// - Chain
//   - height
//   - nextBlock
//   - fetchBlock
//   - fetchBalance
//   - fetchCodeInfo
//   - fetchCodeInstances
//   - fetchContractInfo
//   - query
// - Agent
//   - getConnection
//   - fetchBalance
//   - send
//   - upload
//   - instantiate
