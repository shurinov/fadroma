/**
  Fadroma
  Copyright (C) 2023 Hack.bg

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

export { Chain, Connection, Block, Transaction } from './src/Chain'
export { Identity, Agent, SigningConnection, Batch } from './src/Agent'
export { Backend } from './src/Backend'

export { Proposal, Vote } from './src/dlt/Governance'
export { Validator } from './src/dlt/Staking'
export * as Token from './src/dlt/Token'

export { SourceCode, RustSourceCode } from './src/compute/Source'
export { Compiler, CompiledCode } from './src/compute/Compile'
export { UploadedCode, UploadStore } from './src/compute/Upload'
export { Contract } from './src/compute/Contract'

export * from './src/Util'

/** An address on a chain. */
export type Address = string

/** A chain's unique ID. */
export type ChainId = string

/** A 128-bit integer. */
export type Uint128 = string

/** A 256-bit integer. */
export type Uint256 = string

/** A 128-bit decimal fraction. */
export type Decimal128 = string

/** A 256-bit decimal fraction. */
export type Decimal256 = string

/** A transaction message that can be sent to a contract. */
export type Message = string|Record<string, unknown>

/** A transaction hash, uniquely identifying an executed transaction on a chain. */
export type TxHash = string

/** A code ID, identifying uploaded code on a chain. */
export type CodeId = string

/** The hash of a contract's code. */
export type CodeHash = string

/** The name of a deployment unit. Used to generate contract label. */
export type Name = string

/** A contract's full unique on-chain label. */
export type Label = string
