/*
  Fadroma Cross-Chain Connector
  Copyright (C) 2022 Hack.bg

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/

export * from './ConnectConsole'
export { default as ConnectConsole } from './ConnectConsole'

export * from './ConnectError'
export { default as ConnectError } from './ConnectError'

export * from './ConnectConfig'
export { default as ConnectConfig } from './ConnectConfig'

export * from './Connector'
export { default as Connector } from './Connector'

export * from './ConnectCommands'
export { default as ConnectCommands } from './ConnectCommands'

import * as Scrt from '@fadroma/scrt'
export * as Scrt from '@fadroma/scrt'

import * as Mocknet from '@fadroma/mocknet'
export * as Mocknet from '@fadroma/mocknet'

import { defineDevnet } from '@fadroma/devnet'
export * as Devnet from '@fadroma/devnet'

import ConnectConfig from './ConnectConfig'
import type Connector from './Connector'

import { Chain } from '@fadroma/core'
import type { ChainRegistry } from '@fadroma/core'

/** Populate `Fadroma.Chain.variants` with catalog of possible connections. */
Object.assign(Chain.variants as ChainRegistry, {
  // Support for Mocknet
  async Mocknet_CW0 (config: unknown): Promise<Mocknet.CW0> { return new Mocknet.CW0() },
  async Mocknet_CW1 (config: unknown): Promise<Mocknet.CW1> { return new Mocknet.CW1() },
  // Support for Secret Network
  ScrtMainnet: Scrt.Chain.Mainnet,
  ScrtTestnet: Scrt.Chain.Testnet,
  ScrtDevnet:  defineDevnet(Scrt.Chain, 'scrt_1.7'),
})

export default async function connect (
  config: Partial<ConnectConfig> = new ConnectConfig()
): Promise<Connector> {
  return await new ConnectConfig(config).getConnector()
}
