/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>. **/

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

/** The name of a deployment unit. Used to generate contract label. */
export type Name = string

/** A contract's full unique on-chain label. */
export type Label = string

export type CodeHash = string
