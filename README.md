# [Fadroma](https://fadroma.tech) Scriptable User Agents for the Blockchain

[![](https://img.shields.io/npm/v/@hackbg/fadroma?color=%2365b34c&label=%40fadroma%2Fagent&style=for-the-badge)](https://www.npmjs.com/package/@hackbg/fadroma)

Fadroma defines a **unified TypeScript API for interacting with blockchains
that are based on Tendermint and CosmWasm**.

The Fadroma Agent API provides the following features:

* [Connecting and authenticating to blockchain RPC endpoints](./chain.md)
* Transacting and [staking](./staking.md) with [native and custom tokens](./token.md)
* [Submitting and voting on governance proposals](./governance.md)
* [Interacting with smart contracts](./program.md)
* [Deploying groups of interconnected smart contracts from source](./deploy.md)

To talk with a particular chain, you need to install one or more of the following packages
alongside `@hackbg/fadroma`:

* [**@fadroma/scrt**](https://www.npmjs.com/package/@fadroma/scrt)
  for [Secret Network](https://scrt.network/).
* [**@fadroma/namada**](https://www.npmjs.com/package/@fadroma/namada)
  for [Namada](https://namada.net/).
* [**@fadroma/cw**](https://www.npmjs.com/package/@fadroma/cw)
  for generic CosmWasm-enabled chains, such as:
  * [Archway](https://archway.io/)
  * [Axelar](https://www.axelar.network/)
  * [Axone](https://axone.xyz/) (formerly OKP4)
  * [Injective](https://injective.com/)
  * [Osmosis](https://osmosis.zone/)
  * Other chains that are not explicitly supported may work, too!

Fadroma is truly free software developed at [Hack.bg](https://hack.bg),
available under [GNU AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html).
Custom licensing is available for paying users.
