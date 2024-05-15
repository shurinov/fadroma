<div align="center">

[![Fadroma](./assets/banner2.svg)](https://fadroma.tech)

---

**[Distributed application groundwork](https://fadroma.tech) developed at
[Hack.bg](https://hack.bg).** Fadroma is a scriptable orchestrator
for building next-generation dApps on CosmWasm-enabled backends.

---

</div>

|Component|Package|Description|
|-|-|-|
|**@hackbg/fadroma**|[![](https://img.shields.io/npm/v/@hackbg/fadroma?color=%2365b34c)](https://www.npmjs.com/package/@hackbg/fadroma)|[**View docs.**](https://fadroma.tech/ts/modules/_hackbg_fadroma.html) Cross-chain connector and deployer.|
|**@hackbg/fadroma**|[![](https://img.shields.io/npm/v/@hackbg/fadroma?color=%2365b34c)](https://www.npmjs.com/package/@hackbg/fadroma)|[**View docs.**](https://fadroma.tech/ts/modules/_fadroma_agent.html) Core API model.|
|**@fadroma/scrt**|[![](https://img.shields.io/npm/v/@fadroma/scrt?color=%2365b34c)](https://www.npmjs.com/package/@fadroma/connect)|[**View docs.**](https://fadroma.tech/ts/modules/_fadroma_scrt.html) Secret Network support.|
|**@fadroma/cw**|[![](https://img.shields.io/npm/v/@fadroma/cw?color=%2365b34c)](https://www.npmjs.com/package/@fadroma/connect)|[**View docs.**](https://fadroma.tech/ts/modules/_fadroma_cw.html) Other CosmWasm chain support.|
|**@fadroma/create**|[![](https://img.shields.io/npm/v/@fadroma/create?color=%2365b34c)](https://www.npmjs.com/package/@fadroma/scrt)|[**View docs.**](https://fadroma.tech/ts/modules/_fadroma_create.html) Project setup utility.|
|**@fadroma/compile**|[![](https://img.shields.io/npm/v/@fadroma/compile?color=%2365b34c)](https://www.npmjs.com/package/@fadroma/scrt)|[**View docs.**](https://fadroma.tech/ts/modules/_fadroma_compile.html) Smart contact compilation helper.|
|**@fadroma/devnet**|[![](https://img.shields.io/npm/v/@fadroma/devnet?color=%2365b34c)](https://www.npmjs.com/package/@fadroma/scrt)|[**View docs.**](https://fadroma.tech/ts/modules/_fadroma_devnets.html) Local instances of chains for integration testing.|
|**@fadroma/schema**|[![](https://img.shields.io/npm/v/@fadroma/schema?color=%2365b34c)](https://www.npmjs.com/package/@fadroma/scrt)|[**View docs.**](https://fadroma.tech/ts/modules/_fadroma_schema.html) Local instances of chains for integration testing.|
|**fadroma-dsl**|[![Latest version](https://img.shields.io/crates/v/fadroma-dsl.svg?color=%2365b34c)](https://crates.io/crates/fadroma-dsl)|[![Documentation](https://img.shields.io/docsrs/fadroma-dsl/latest?color=%2365b34c)](https://docs.rs/fadroma-dsl) Macro-based smart contract DSL.|
|**fadroma**|[![Latest version](https://img.shields.io/crates/v/fadroma.svg?color=%2365b34c)](https://crates.io/crates/fadroma)|[![Documentation](https://img.shields.io/docsrs/fadroma/latest?color=%2365b34c)](https://docs.rs/fadroma) Library for smart contracts.|

# Getting started

## Creating a project

```sh
# Create a project:
$ npx @hackbg/fadroma@latest create

# Create a project using a specific version of Fadroma:
$ npx @hackbg/fadroma@2.0.0 create
```

The newly created project will contain the following modules:

* **api.ts** is the root module of your project's TypeScript SDK. It contains `Client` subclasses
  that correspond to your contracts, and a `Deployment` subclass which describes how the
  contracts relate to each other. See the [Fadroma Agent API](./agent/README.md) documentation
  for details.

* **config.ts** is your project's deploy configuration. Here, you can customize the
  build/upload/deploy procedures and define project-specific commands that you can then
  access from the Fadroma CLI.

* **test.ts** is where you can write integration tests for your project.

## Building contracts

```sh
# Build all contracts in the project:
$ npm run fadroma build

# Build a single contract:
$ npm run fadroma build some-contract

# Build multiple contracts:
$ npm run fadroma build some-contract another-contract a-third-contract

# Build contract by path:
$ npm run fadroma /path/to/crate
```

By default, builds happen in a Docker container. Set `FADROMA_BUILD_RAW=1` to instead use
your local Rust toolchain.

The production builds of your contracts are stored as `.wasm` binaries in your project's
`wasm/` directory. Every binary has a corresponding `.wasm.sha256` checksum file whose contents
correspond to the on-chain code hash.

To rebuild a contract, do one of the following:
* delete the contract and its checksum from `wasm/`;
* use the `rebuild` command instead of `build`;
* set the `FADROMA_REBUILD=1` when calling `build`, `upload` or `deploy`.

```sh
# Rebuild all contracts:
$ npm run fadroma rebuild
```

## Selecting deploy targets

The supported deploy targets are `mainnet`, `testnet`, and `devnet`. Projects created by Fadroma
define NPM scripts to select them:

```sh
# Deploy to mainnet
$ npm run mainnet deploy

# Deploy to testnet
$ npm run testnet deploy

# Deploy to devnet
$ npm run devnet deploy
```

In the examples below, we will use those interchangeably.

Alternatively, use the `FADROMA_CHAIN` environment variable with `npm run fadroma`.
See [Fadroma Connect](./connect/README.md) for a list of supported values.

## Using the local devnet

Fadroma allows you to easily run local instances of the supported chains,
in order to test your contracts without uploading them to testnet.

```sh
# Pause the devnet
$ npm run devnet pause

# Export a snapshot of the devnet to a new Docker image
$ npm run devnet export

# Resume the devnet
$ npm run devnet resume

# Stop the devnet and erase all state
$ npm run devnet reset
```

An exported **devnet snapshot** is a great way to provide a standardized dev build
of your project that can be run locally by frontend devs, by your CI pipeline, etc.

## Uploading contracts

```sh
# Build and upload all contracts in the project
$ npm testnet upload

# Build and upload a single contract
$ npm testnet upload some-contract

# Build and upload multiple contracts
$ npm testnet upload some-contract another-contract a-third-contract
```

If contract binaries are not present, the upload command will try to build them first.

Uploading a contract adds an **upload receipt** in `state/$CHAIN_ID/uploads/$CODE_ID.json`.
This prevents duplicate uploads.

To force a reupload, either use the `reupload` command (in place of `upload`), or set
`FADROMA_REUPLOAD=1` (e.g. when invoking `upload` or `deploy`).

```sh
# Reupload all contracts, getting new code ids:
$ npm testnet reupload

# Redeploy with new code ids
$ FADROMA_REUPLOAD=1 npm testnet redeploy
```

## Deploying your project

Use the `deploy` command to deploy your project:

```sh
# Deploy your project to testnet
$ npm run testnet deploy [...ARGS]
```

When deploying, Fadroma will automatically build and upload any contracts that are
specified in the deployment and are not already built or uploaded to the given chain.

Running `deploy` on a completed deployment will do nothing (unless you've updated the
description of the deployment, in which case it will try to apply the updates).
To deploy everything anew, use `redeploy`:

```sh
# Deploy everything anew
$ npm run testnet redeploy [...ARGS]
```

If deploying fails, you should be able to re-run `deploy` and continue where you left off.

## Managing deployments

Deploying a project results in a [deploy receipt](#deploy-receipts) being created -
a simple file containing the state of the deployment. You can have more than one of
these, corresponding to multiple independent deployments of the same code. To see
a list of them, use the `list` command:

```sh
# List deployments in this project
$ npm run testnet list
```

After a deploy, the newly created deployment will be marked as *active*. To switch
to another deployment, use the `select` command:

```sh
# Select another deployment
$ npm run testnet select my-deployment
```

Deployments in YAML multi-document format are human-readable and version control-friendly.
When a list of contracts in JSON is desired, you can use the `export` command to export a JSON
snapshot of the active deployment.

```sh
# Export the state of the active testnet deployment to ./my-deployment_@_timestamp.json
$ npm run testnet export

# Export state to ./some-directory/my-deployment_@_timestamp.json
$ npm run testnet export ./some-directory
```

## Connecting to a deployment

In a standard Fadroma project, where the Rust contracts
and TypeScript API client live in the same repo, by `export`ing
the latest mainnet and testnet deployments to JSON files
during the TypeScript build process, and adding them to your
API client package, you can publish an up-to-date "address book"
of your project's active contracts as part of your API client library.

```typescript
// TODO
```

Having been deployed once, contracts may be used continously.
The `Deployment`'s `connect` method loads stored data about
the contracts in the deployment, populating the contained
`Contract` instances.

With the above setup you can automatically connect to
your project in mainnet or testnet mode, depending on
what `Agent` you pass:

```typescript
// TODO
```

Or, to connect to individual contracts from the stored deployment:

```typescript
// TODO
```

## Upgrading a deployment

Migrations can be implemented as static or regular methods
of `Deployment` classes.

```typescript
// TODO
```

## Further reading

* [**Fadroma Agent Core**](./agent/README.md), our core API defining portable user agents
  for smart contract-based backends.
    * [**Fadroma Agent for Secret Network**](./scrt/README.md)
    * [**Fadroma Agent for CosmWasm**](./scrt/README.md)

* [Example: **Fadroma Workshop**](https://github.com/hackbg/fadroma-workshop) repo,
  a step-by-step guide on how to build smart contracts using the Fadroma Rust crate.

* [Example: **Fadroma Factory**](https://fadroma.tech/factory.html),
  a guide to deploying your Rust contracts using the Fadroma TypeScript package,
  via a factory pattern that enables your users to instantiate contracts in a controlled way.

---

This package is the core of Fadroma. It defines a TypeScript API for
interacting with blockchains based on Tendermint and CosmWasm.

Since different chains provide different client libraries and connection methods,
you need a concrete implementation of Fadroma Agent to actually talk to a chain:

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

## Connecting to a chain

Instances of the **Chain** class represents blockchains.

A chain may exists in one of several modes,
represented by the **chain.mode** property
and the **ChainMode** enum:

* ****mainnet**** is a production chain storing real value;
* ****testnet**** is a persistent remote chain used for testing;
* ****devnet**** is a locally run chain node in a Docker container;
* ****mocknet**** is a mock implementation of a chain.

The **Chain.mainnet**, **Chain.testnet**, **Chain.devnet** and **Chain.mocknet**
static methods construct a chain in the given mode.

You can also check whether a chain is in a given mode using the
**chain.isMainnet**, **chain.isTestnet**, **chain.isDevnet** and **chain.isMocknet**
read-only boolean properties.

The **chain.devMode** property is true when the chain is a devnet or mocknet.
Devnets and mocknets are under your control - i.e. you can delete them and
start over. On the other hand, mainnet and testnet are global and persistent.

The **chain.id** property is a string that uniquely identifies a given blockchain.
Examples are `secret-4` (Secret Network mainnet), `pulsar-3` (Secret Network testnet),
or `okp4-nemeton-1` (OKP4 testnet). Chains in different modes usually have distinct IDs.

The same chain may be accessible via different URLs. The **chain.url** property
identifies the URL to which requests are sent.

Since the underlying API classes (e.g. `CosmWasmClient` or `SecretNetworkClient`) are
initialized asynchronously, and JavaScript does not have async constructors, chains start
out in an unitialized state, where the **chain.api** property is not populated. Awaiting the
**chain.ready** one-shot promise returns the same chain object, but with the API client populated.
Normally, this is done automatically when calling the chain's async methods; but if you want to
access the API handle directly, you would need to **await chain.ready**. This is useful if you
want to access a chain-specific feature that is not part of the Fadroma Agent API

Examples:

```typescript
const { api } = await chain.ready
```

### Block height

The **chain.height** getter returns a **Promise** wrapping the current block height.

The **chain.nextBlock** getter returns a **Promise** which resolves when the
block height increments, and contains the new block height.

Examples:

```typescript
// Get the current block height
const height = await chain.height

// Wait until the block height increments
await chain.nextBlock
```

### Native tokens

The **Chain.defaultDenom** and **chain.defaultDenom** properties contain the default
denomination of the chain's native token.

The **chain.getBalance(denom, address)** async method queries the balance of a given
address in a given token.

Examples:

```typescript
// TODO
```

### Querying contracts

The **chain.query(contract, message)** async method calls a read-only query method of a smart
contract.

The **chain.getCodeId(address)**, **chain.getHash(addressOrCodeId)** and
**chain.getLabel(address)** async methods query the corresponding metadata of a smart contract.

The **chain.checkHash(address, codeHash)** method warns if the code hash of a contract
is not the expected one.

Examples:

```typescript
// TODO
```

## Authenticating an agent

To transact on a given chain, you need to authorize an **Agent**.
This is done using the **chain.authenticate(...)** method, which synchonously
returns a new **Agent** instance for the given chain.

Instantiating multiple agents allows the same program to interact with the chain
from multiple distinct identities.

This method may be called with one of the following signatures:

* **chain.authenticate(options)**
* **chain.authenticate(CustomAgentClass, options)**
* **chain.authenticate(CustomAgentClass)**

The returned **Agent** starts out uninitialized. Awaiting the **agent.ready** property makes sure
the agent is initialized. Usually, agents are initialized the first time you call one of the
async methods described below.

If you don't pass a mnemonic, a random mnemonic and address will be generated.

Examples:

```typescript
// TODO
```

### Agent identity

The **agent.address** property is the on-chain address that uniquely identifies the agent.

The **agent.name** property is a user-friendly name for an agent. On devnet, the name is
also used to access the initial accounts that are created during devnet genesis.

### Agents and block height

The **agent.height** and **agent.nextBlock** methods are equivalent to the same methods
on the chain object, and are replicated on the Agent class purely for convenience.

```typescript
const height = await agent.height

await agent.nextBlock
```

### Native token transactions

The **agent.getBalance(denom, address)** async method works the same as **chain.getBalance(...)**
but defaults to the agent's address.

The **agent.balance** readonly property is a shorthand for querying the current agent's balance
in the chain's main native token.

The **agent.send(address, amounts, options)** async method sends one or more amounts of
native tokens to the specified address.

The **agent.sendMany([[address, coin], [address, coin]...])** async method sends native tokens
to multiple addresses.

Examples:

```typescript
await agent.balance // In the default native token

await agent.getBalance() // In the default native token

await agent.getBalance('token') // In a non-default native token

await agent.send('recipient-address', 1000)

await agent.send('recipient-address', '1000')

await agent.send('recipient-address', [
  {denom:'token1', amount: '1000'}
  {denom:'token2', amount: '2000'}
])
```

### Uploading and instantiating contracts

The **agent.upload(...)** uploads a contract binary to the chain.

The **agent.instantiate(...)** async method takes a code ID and returns a contract
instance.

The **agent.instantiateMany(...)** async method instantiates multiple contracts within
the same transaction.

On Secret Network, it's not possible to send multiple separate upload transactions
within the same block. Therefore, when uploading multiple contracts, **agent.nextBlock**
needs to be awaited between them. **agent.uploadMany(...)** does this automatically.

Examples:

```typescript
import { examples } from './fixtures/Fixtures.ts.md'
import { readFileSync } from 'node:fs'

// uploading from a Buffer
await agent.upload(readFileSync(examples['KV'].path), {
  // optional metadata
  codePath: examples['KV'].path
})

// Uploading from a filename
await agent.upload('example.wasm') // TODO

// Uploading an Uploadable object
await agent.upload({ artifact: './example.wasm', codeHash: 'expectedCodeHash' }) // TODO

const c1 = await agent.instantiate({
  codeId:   '1',
  codeHash: 'verify!',
  label:    'unique1',
  initMsg:  { arg: 'val' }
})

const [ c2, c3 ] = await agent.instantiateMany([
  { codeId: '2', label: 'unique2', initMsg: { arg: 'values' } },
  { codeId: '3', label: 'unique3', initMsg: { arg: 'values' } }
])
```

### Executing transactions and performing queries

The **agent.query(contract, message)** async method calls a query method of a smart contract.
This is equivalent to **chain.query(...)**.

The **agent.execute(contract, message)** async method calls a transaction method of a smart
contract, signing the transaction as the given agent.

Examples:

```typescript
const response = await agent.query(c1, { get: { key: '1' } })
assert.rejects(agent.query(c1, { invalid: "query" }))

const result = await agent.execute(c1, { set: { key: '1', value: '2' } })
assert.rejects(agent.execute(c1, { invalid: "tx" }))
```

### Batching transactions

The **agent.batch(...)** method creates an instance of **Batch**.

Conceptually, you can view a batch as a kind of agent that does not execute transactions
immediately - it collects them, and waits for the **batch.broadcast()** method. You can
pass a batch anywhere you can pass an agent.

The main difference between a batch and and agent is that *you cannot query from a batch*.
This is because a batch is an atomic action, and queries made inbetween individual transactions
of a batch would return the state as it was before *all* the transactions. Therefore, to avoid
confusion and outdated state, the query methods of the batch "agent" throw errors.
If you need to perform queries, use a regular agent before or after the batch.

Instead of broadcasting, you can also export an unsigned batch, and pass it around manually
as part of a multisig transaction.

To create and submit a batch in a single expression,
you can use `batch.wrap(async (batch) => { ... })`:

Examples:

```typescript
const results = await agent.batch(async batch=>{
  await batch.execute(c1, { del: { key: '1' } })
  await batch.execute(c2, { set: { key: '3', value: '4' } })
}).run()
```

## Gas fees

Transacting creates load on the network, which incurs costs on node operators.
Compensations for transactions are represented by the gas metric.

You can specify default gas limits for each method by defining the `fees: Record<string, IFee>`
property of your client class:

```typescript
const fee1 = new Fee('100000', 'uscrt')
client.fees['my_method'] = fee1

assert.deepEqual(client.getFee('my_method'), fee1)
assert.deepEqual(client.getFee({'my_method':{'parameter':'value'}}), fee1)
```

You can also specify one fee for all transactions, using `client.withFee({ gas, amount: [...] })`.
This method works by returning a copy of `client` with fees overridden by the provided value.

```typescript
const fee2 = new Fee('200000', 'uscrt')

assert.deepEqual(await client.withFee(fee2).getFee('my_method'), fee2)
```

## Contracts

### Contract clients

The **Client** class represents a handle to a smart contract deployed to a given chain.

To provide a robust SDK to users of your project, simply publish a NPM package
containing subclasses of **Client** that correspond to your contracts and invoke
their methods.

To operate a smart contract through a `Client`,
you need an `agent`, an `address`, and a `codeHash`:

Example:

```typescript
import { Client } from '@hackbg/fadroma'

class MyClient extends Client {

  myMethod = (param) => this.execute({
    my_method: { param }
  })

  myQuery = (param) => this.query({
    my_query: { param }
  })

}

let address  = Symbol('some-addr')
let codeHash = Symbol('some-hash')
let client: Client = new MyClient({ agent, address, codeHash })

assert.equal(client.agent,    agent)
assert.equal(client.address,  address)
assert.equal(client.codeHash, codeHash)
client = agent.getClient(MyClient, address, codeHash)
await client.execute({ my_method: {} })
await client.query({ my_query: {} })
```

#### Client agent

By default, the `Client`'s `agent` property is equal to the `agent`
which deployed the contract. This property determines the address from
which subsequent transactions with that `Client` will be sent.

In case you want to deploy the contract as one identity, then interact
with it from another one as part of the same procedure, you can set `agent`
to another instance of `Agent`:

```typescript
assert.equal(client.agent, agent)
client.agent = await chain.authenticate()
assert.notEqual(client.agent, agent)
```

Similarly to `withFee`, the `as` method returns a new instance of your
client class, bound to a different `agent`, thus allowing you to execute
transactions as a different identity.

```typescript
const agent1 = await chain.authenticate(/*...*/)
const agent2 = await chain.authenticate(/*...*/)

client = agent1.getClient(Client, "...")

// executed by agent1:
client.execute({ my_method: {} })

// executed by agent2
client.withAgent(agent2).execute({ my_method: {} })
```

#### Client metadata

The original `Contract` object from which the contract
was deployed can be found on the optional `meta` property of the `Client`.

```typescript
import { Contract } from '@hackbg/fadroma'
assert.ok(client.meta instanceof Contract)
```

Fetching metadata:

```typescript
import { fetchLabel } from '@hackbg/fadroma'

await fetchCodeId(client, agent)
await fetchLabel(client, agent)
```

The code ID is a unique identifier for compiled code uploaded to a chain.

The code hash also uniquely identifies for the code that underpins a contract.
However, unlike the code ID, which is opaque, the code hash corresponds to the
actual content of the code. Uploading the same code multiple times will give
you different code IDs, but the same code hash.

### Contract deployments

These classes are used for describing systems consisting of multiple smart contracts,
such as when deploying them from source. By defining such a system as one or more
subclasses of `Deployment`, Fadroma enables declarative, idempotent, and reproducible
smart contract deployments.

The `Deployment` class represents a set of interrelated contracts.
To define your deployment, extend the `Deployment` class, and use the
`this.template({...})` and `this.contract({...})` methods to specify
what contracts to deploy:

```typescript
// in your project's api.ts:

import { Deployment } from '@hackbg/fadroma'

export class DeploymentA extends Deployment {

  kv1 = this.contract({
    name: 'kv1',
    crate: 'examples/kv',
    initMsg: {}
  })

  kv2 = this.contract({
    name: 'kv2',
    crate: 'examples/kv',
    initMsg: {}
  })

}
```

#### Preparing

To prepare a deployment for deploying, use `getDeployment`.
This will provide a populated instance of your deployment class.

```typescript
import { getDeployment } from '@hackbg/fadroma'
deployment = getDeployment(DeploymentA, /* ...constructor args */)
```

#### Deploying everything

Then, call its `deploy` method:

```typescript
await deployment.deploy()
```

For each contract defined in the deployment, this will do the following:

* If it's not compiled yet, this will **build** it.
* If it's not uploaded yet, it will **upload** it.
* If it's not instantiated yet, it will **instantiate** it.

#### Expecting contracts to be deployed

Having deployed a contract, you want to obtain a `Client` instance
that points to it, so you can call the contract's methods.

Using the `contract.expect()` method you can get an instance
of the `Client` specified in the contract options, provided
the contract is already deployed (i.e. its address is known).

```typescript
assert(deployment.kv1.expect() instanceof Client)
assert(deployment.kv2.expect() instanceof Client)
```

This is the recommended method for passing handles to contracts
to your UI code after deploying or connecting to a stored deployment
(see below).

If the address of the request contract is not available,
this will throw an error.

#### Deploying individual contracts with dependencies

By `await`ing a `Contract`'s `deployed` property, you say:
"give me a handle to this contract; if it's not deployed,
deploy it, and all of its dependencies (as specified by the `initMsg` method)".

```typescript
assert(await deployment.kv1.deployed instanceof Client)
assert(await deployment.kv2.deployed instanceof Client)
```

Since this does not call the deployment's `deploy` method,
it *only* deploys the requested contract and its dependencies
but not any other contracts defined in the deployment.

#### Deploying with custom logic

The `deployment.deploy` method simply instantiates
all contracts in order. You are free to override it
and deploy the defined contracts according to some
custom logic:

```typescript
class DeploymentB extends Deployment {
  kv1 = this.contract({ crate: 'examples/kv', name: 'kv1', initMsg: {} })
  kv2 = this.contract({ crate: 'examples/kv', name: 'kv2', initMsg: {} })

  deploy = async (deployBoth: boolean = false) => {
    await this.kv1.deployed
    if (deployBoth) await this.kv2.deployed
    return this
  }
}
```

### Contract instances

The `Contract` class describes an individual smart contract instance and uniquely identifies it
within the `Deployment`.

```typescript
import { Contract } from '@hackbg/fadroma'

new Contract({
  repository: 'REPO',
  revision:   'REF',
  workspace:  'WORKSPACE'
  crate:      'CRATE',
  artifact:   'ARTIFACT',
  chain:      { /* ... */ },
  agent:      { /* ... */ },
  deployment: { /* ... */ },
  codeId:     0,
  codeHash:   'CODEHASH'
  client:     Client,
  name:       'NAME',
  initMsg:    async () => ({})
})
```

#### Naming and labels

The chain requires labels to be unique.
Labels generated by Fadroma are of the format `${deployment.name}/${contract.name}`.

#### Lazy init

The `initMsg` property of `Contract` can be a function returning the actual message.
This function is only called during instantiation, and can be used to generate init
messages on the fly, such as when passing the address of one contract to another.

#### Deploying contract instances

To instantiate a `Contract`, its `agent` property must be set to a valid `Agent`.
When obtaining instances from a `Deployment`, their `agent` property is provided
from `deployment.agent`.

```typescript
import { Agent } from '@hackbg/fadroma'
assert(deployment.a.agent instanceof Agent)
assert.equal(deployment.a.agent, deployment.agent)
```

You can instantiate a `Contract` by awaiting the `deployed` property or the return value of the
`deploy()` method. Since distributed ledgers are append-only, deployment is an idempotent operation,
so the deploy will run only once and subsequent calls will return the same `Contract` with the
same `address`.

```typescript
await deployment.a.deploy()
await deployment.a.deployed
```

If `contract.codeId` is not set but either source code or a WASM binary is present,
this will try to upload and build the code first.

```typescript
await deployment.a.uploaded
await deployment.a.upload()

await deployment.a.built
await deployment.a.build()
```

### Contract templates

The `Template` class represents a smart contract's source, compilation,
binary, and upload. It can have a `codeHash` and `codeId` but not an
`address`.

**Instantiating a template** refers to calling the `template.instance`
method (or its plural, `template.instances`), which returns `Contract`,
which represents a particular smart contract instance, which can have
an `address`.

#### Deploying multiple contracts from a template

The `deployment.template` method adds a `Template` to the `Deployment`.

```typescript
// TODO
```

You can pass either an array or an object to `template.instances`.

```typescript
// TODO
```

#### Building from source code

To build, the `compiler` property must be set to a valid `Compiler`.
When obtaining instances from a `Deployment`, the `compiler` property
is provided automatically from `deployment.compiler`.

```typescript
// TODO
```

You can build a `Template` (or its subclass, `Contract`) by awaiting the
`built` property or the return value of the `build()` method.

```typescript
// TODO
```

#### Uploading binaries

To upload, the `uploader` property must be set to a valid `Uploader`.
When obtaining instances from a `Deployment`, the `uploader` property
is provided automatically from `deployment.uploader`.

```typescript
// TODO
```

You can upload a `Template` (or its subclass, `Contract`) by awaiting the
`uploaded` property or the return value of the `upload()` method.

If a WASM binary is not present (`template.artifact` is empty),
but a source and a compiler are present, this will also try to build the contract.

```typescript
// TODO
```

## Services

### Compiler

### Uploader
