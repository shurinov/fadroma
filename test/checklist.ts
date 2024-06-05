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

const tests: Array<[string, Function]> = [

  ["Platform.connect", ({ platform }: any) => {
    if (platform["connect"]) return OK
  }],

  ["Platform.mocknet", ({ platform }: any) => {
    if (platform["mocknet"]) return OK
  }],

  ["Platform.devnet", ({ platform }: any) => {
    if (platform["devnet"]) return OK
  }],

  ["Platform.testnet", ({ platform }: any) => {
    if (platform === OCI) return NA
    if (platform["testnet"]) return OK
  }],

  ["Platform.mainnet", ({ platform }: any) => {
    if (platform === OCI) return NA
    if (platform["mainnet"]) return OK
  }],

  ["Platform.Chain", ({ platform }: any) => {
    if (platform["Chain"]) return OK
  }],

  ["Platform.Agent", ({ platform }: any) => {
    if (platform["Agent"]) return OK
  }],

  ["Chain#getConnection", async ({ platform, connectOptions }: any) => {
    // open devnet
    const chain = await platform.connect(connectOptions)
    if (await chain.getConnection()) return OK
  }],

  ["Chain#height", async ({ platform, connectOptions }: any) => {
    if (platform === OCI) return NA
    const chain = await platform.connect(connectOptions)
    if (await chain["height"]) return OK
  }],

  ["Chain#nextBlock", async ({ platform, connectOptions }: any) => {
    if (platform === OCI) return NA
    const chain = await platform.connect(connectOptions)
    if (await chain["nextBlock"]) return OK
  }],

  ["Chain#fetchBlock", async ({ platform, connectOptions }: any) => {
    if (platform === OCI) return NA
    const chain = await platform.connect(connectOptions)
    if (await chain.fetchBlock()) return OK
  }],

  ["Chain#fetchBalance", async ({ platform, connectOptions }: any) => {
    if (platform === OCI) return NA
    const chain = await platform.connect(connectOptions)
    if (await chain.fetchBalance()) return OK
  }],

  ["Chain#fetchCodeInfo", async ({ platform, connectOptions }: any) => {
    const chain = await platform.connect(connectOptions)
    if (await chain.fetchCodeInfo()) return OK
  }],

  ["Chain#fetchCodeInstances", async ({ platform, connectOptions }: any) => {
    const chain = await platform.connect(connectOptions)
    if (await chain.fetchCodeInstances()) return OK
  }],

  ["Chain#fetchContractInfo", async ({ platform, connectOptions }: any) => {
    const chain = await platform.connect(connectOptions)
    if (await chain.fetchContractInfo()) return OK
  }],

  ["Chain#query", async ({ platform, connectOptions }: any) => {
    const chain = await platform.connect(connectOptions)
    if (await chain.query()) return OK
  }],

  ["Chain#authenticate", async ({ platform, connectOptions }: any) => {
    if (platform === Namada) return NA
    const chain = await platform.connect(connectOptions)
    const agent = await chain.authenticate()
    if (agent instanceof Agent) return OK
  }],

  ["Agent#getConnection", async ({ platform, connectOptions }: any) => {
    if (platform === Namada) return NA
    const chain = await platform.connect(connectOptions)
    const agent = await chain.authenticate()
    if (await agent.getConnection()) return OK
  }],

  ["Agent#fetchBalance", async ({ platform, connectOptions }: any) => {
    if (platform === Namada) return NA
    if (platform === OCI) return NA
    const chain = await platform.connect(connectOptions)
    const agent = await chain.authenticate()
    if (await agent.fetchBalance()) return OK
  }],

  ["Agent#send", async ({ platform, connectOptions }: any) => {
    if (platform === Namada) return NA
    if (platform === OCI) return NA
    const chain = await platform.connect(connectOptions)
    const agent = await chain.authenticate()
    if (await agent.send()) return OK
  }],

  ["Agent#upload", async ({ platform, connectOptions }: any) => {
    if (platform === Namada) return NA
    if (platform === OCI) return NI
    const chain = await platform.connect(connectOptions)
    const agent = await chain.authenticate()
    if (await agent.upload({})) return OK
  }],

  ["Agent#instantiate", async ({ platform, connectOptions }: any) => {
    if (platform === Namada) return NA
    if (platform === OCI) return NI
    const chain = await platform.connect(connectOptions)
    const agent = await chain.authenticate()
    if (await agent.instantiate({ codeId: '1', label: 'foo' })) return OK
  }],

  ["Agent#execute", async ({ platform, connectOptions }: any) => {
    if (platform === Namada) return NA
    if (platform === OCI) return NI
    const chain = await platform.connect(connectOptions)
    const agent = await chain.authenticate()
    if (await agent.execute({ address: 'x' })) return OK
  }],

]

let table = ''
const errors = []

for (const [feature, test] of tests) {

  table += bold(feature.padEnd(25))

  for (const [platformName, platform] of Object.entries(platforms)) {

    const connectOptions: Record<any, any> = {}
    if (platform === CW) {
      connectOptions.bech32Prefix   = 'test'
      connectOptions.coinType       = 0
      connectOptions.hdAccountIndex = 0
    }

    let color = NI

    try {
      color = await Promise.resolve(test({
        platform,
        connectOptions
      })) || color
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
