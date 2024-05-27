#!/usr/bin/env -S node --import @ganesha/esbuild

import { Console, colors, bold } from '@hackbg/logs'
import { Agent } from '../src/Agent'
import * as SN from '@fadroma/scrt'
import * as CW from '@fadroma/cw'
import * as Namada from '@fadroma/namada'
import * as OCI from '@fadroma/oci'

const console = new Console('Checklist')

const OK = colors.black.bgGreen   // ok
const NO = colors.black.bgRed     // test fails
const NI = colors.black.bgYellow  // not implemented
const NA = colors.black.bgGray    // not applicable

const platforms = { SN, CW, Namada, OCI }

let connectOptions = {}

const tests: Array<[string, Function]> = [

  ["connect", (platform: any) => {
    if (platform["connect"]) return OK
  }],

  ["mocknet", (platform: any) => {
    if (platform["mocknet"]) return OK
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

  ["Chain#getConnection", async (platform: any) => {
    const chain = await platform.connect()
    if (await chain.getConnection()) return OK
  }],

  ["Chain#height", async (platform: any) => {
    if (platform === OCI) return NA
    const chain = await platform.connect()
    if (await chain["height"]) return OK
  }],

  ["Chain#nextBlock", async (platform: any) => {
    if (platform === OCI) return NA
    const chain = await platform.connect()
    if (await chain["nextBlock"]) return OK
  }],

  ["Chain#fetchBlock", async (platform: any) => {
    if (platform === OCI) return NA
    const chain = await platform.connect()
    if (await chain.fetchBlock()) return OK
  }],

  ["Chain#fetchBalance", async (platform: any) => {
    if (platform === OCI) return NA
    const chain = await platform.connect()
    if (await chain.fetchBalance()) return OK
  }],

  ["Chain#fetchCodeInfo", async (platform: any) => {
    const chain = await platform.connect()
    if (await chain.fetchCodeInfo()) return OK
  }],

  ["Chain#fetchCodeInstances", async (platform: any) => {
    const chain = await platform.connect()
    if (await chain.fetchCodeInstances()) return OK
  }],

  ["Chain#fetchContractInfo", async (platform: any) => {
    const chain = await platform.connect()
    if (await chain.fetchContractInfo()) return OK
  }],

  ["Chain#query", async (platform: any) => {
    const chain = await platform.connect()
    if (await chain.query()) return OK
  }],

  ["Chain#authenticate", async (platform: any) => {
    if (platform === Namada) return NA
    const chain = await platform.connect()
    const agent = await chain.authenticate()
    if (agent instanceof Agent) return OK
  }],

  ["Agent#getConnection", async (platform: any) => {
    if (platform === Namada) return NA
    const chain = await platform.connect()
    const agent = await chain.authenticate()
    if (await agent.getConnection()) return OK
  }],

  ["Agent#fetchBalance", async (platform: any) => {
    if (platform === Namada) return NA
    if (platform === OCI) return NA
    const chain = await platform.connect()
    const agent = await chain.authenticate()
    if (await agent.fetchBalance()) return OK
  }],

  ["Agent#send", async (platform: any) => {
    if (platform === Namada) return NA
    if (platform === OCI) return NA
    const chain = await platform.connect()
    const agent = await chain.authenticate()
    if (await agent.send()) return OK
  }],

  ["Agent#upload", async (platform: any) => {
    if (platform === Namada) return NA
    const chain = await platform.connect()
    const agent = await chain.authenticate()
    if (await agent.upload({})) return OK
  }],

  ["Agent#instantiate", async (platform: any) => {
    if (platform === Namada) return NA
    const chain = await platform.connect()
    const agent = await chain.authenticate()
    if (await agent.instantiate({ codeId: '1', label: 'foo' })) return OK
  }],

  ["Agent#execute", async (platform: any) => {
    if (platform === Namada) return NA
    const chain = await platform.connect()
    const agent = await chain.authenticate()
    if (await agent.execute({ address: 'x' })) return OK
  }],

]

let table = ''
const errors = []

for (const [feature, test] of tests) {
  table += bold(feature.padEnd(25))
  for (const [platformName, platform] of Object.entries(platforms)) {
    connectOptions = {}
    if (platform === CW) {
      connectOptions = { bech32Prefix: 'test', coinType: '0' }
    }
    let color = NI
    try {
      color = await Promise.resolve(test(platform)) || color
    } catch (e: any) {
      e.message = `${platformName}: ${feature}: ${e.message}`
      errors.push(e)
      color = NO
    }
    table += color(' ' + platformName + ' ') + ' '
  }
  table += '\n'
}

for (const error of errors) {
  console.error(error)
  process.stdout.write('\n')
}

process.stdout.write(table)
