<div align="center">

[![Fadroma](./banner2.svg)](https://fadroma.tech)

Distributed application framework developed at [**Hack.bg**](https://hack.bg).

|Component|Package|Docs|
|-|-|-|
|`fadroma` crate|[![Latest version](https://img.shields.io/crates/v/fadroma.svg?color=%2365b34c&style=for-the-badge)](https://crates.io/crates/fadroma)|[![Documentation](https://img.shields.io/docsrs/fadroma/latest?color=%2365b34c&style=for-the-badge)](https://docs.rs/fadroma)|
|`fadroma-dsl` crate|[![Latest version](https://img.shields.io/crates/v/fadroma-dsl.svg?color=%2365b34c&style=for-the-badge)](https://crates.io/crates/fadroma-dsl)|[![Documentation](https://img.shields.io/docsrs/fadroma-dsl/latest?color=%2365b34c&style=for-the-badge)](https://docs.rs/fadroma-dsl)|
|`@hackbg/fadroma`|[![](https://img.shields.io/npm/v/@hackbg/fadroma?color=%2365b34c&style=for-the-badge)](https://www.npmjs.com/package/@hackbg/fadroma)|[View docs](https://fadroma.tech/ts/modules/_hackbg_fadroma.html)|
|`@fadroma/agent`|[![](https://img.shields.io/npm/v/@fadroma/agent?color=%2365b34c&style=for-the-badge)](https://www.npmjs.com/package/@fadroma/agent)|[View docs](https://fadroma.tech/ts/modules/_fadroma_agent.html)|
|`@fadroma/connect`|[![](https://img.shields.io/npm/v/@fadroma/connect?color=%2365b34c&style=for-the-badge)](https://www.npmjs.com/package/@fadroma/scrt)|[View docs](https://fadroma.tech/ts/modules/_fadroma_connect.html)|
|`@fadroma/scrt`|[![](https://img.shields.io/npm/v/@fadroma/scrt?color=%2365b34c&style=for-the-badge)](https://www.npmjs.com/package/@fadroma/connect)|[View docs](https://fadroma.tech/ts/modules/_fadroma_scrt.html)|
|`@fadroma/cw`|[![](https://img.shields.io/npm/v/@fadroma/cw?color=%2365b34c&style=for-the-badge)](https://www.npmjs.com/package/@fadroma/connect)|[View docs](https://fadroma.tech/ts/modules/_fadroma_cw.html)|

See [**https://fadroma.tech**](https://fadroma.tech) for overview or try the
[**getting started guide**](https://fadroma.tech/guide.html).

See the [**Fadroma Workshop**](https://github.com/hackbg/fadroma-workshop) repo
for a real-world example, which includes a step-by-step guide on how to build smart
contracts using the Fadroma Rust crate, and the [**Fadroma Factory Example**](https://fadroma.tech/factory.html)
for a guide to deploying your Rust contracts using the Fadroma TypeScript package.

</div>

---

# Getting started

## Creating a project and defining contracts

```shell
# Create a project:
$ npx @hackbg/fadroma@latest create

# Create a project using a specific version of Fadroma:
$ npx @hackbg/fadroma@1.5.6 create

# Add a contract to the project:
$ npm exec fadroma add
```

## Building contracts

```shell
# Build a contract from the project:
$ npm exec fadroma build some-contract

# Build multiple contracts from the project in parallel:
$ npm exec fadroma build some-contract another-contract a-third-contract

# Build all contracts in the project:
$ npm exec fadroma build
```

Checksums of compiled contracts by version are stored in the build state
directory, `wasm/`.

## Uploading contracts

```shell
# Upload a contract:
$ npm exec fadroma upload CONTRACT [...CONTRACT]
```

If contract binaries are not present, the upload command will try to build them first.
Every successful upload logs the transaction as a file called an **upload receipt** under
`state/$CHAIN_ID/upload.`. This contains info about the upload transaction.

The `UploadStore` loads a collection of upload receipts and tells the `Uploader` if a
binary has already been uploaded, so it can prevent duplicate uploads.

## Deploying the project

```shell
$ npm exec fadroma deploy [...ARGS]
```

Commencing a deployment creates a corresponding file under `state/$CHAIN_ID/deploy`, called
a **deploy receipt**. As contracts are deployed as part of this deployment, their details
will be appended to this file so that they can be found later.

When a deploy receipt is created, that deployment is made active. This is so you can easily
find and interact with the contract you just deployed. The default deploy procedure is
dependency-based, so if the deployment fails, re-running `deploy` should try to resume
where you left off. Running `deploy` on a completed deployment will do nothing.

To start over, use the `redeploy` command:

```shell
$ npm exec fadroma redeploy [...ARGS]
```

This will create and activate a new deployment, and deploy everything anew.

Keeping receipts of your primary mainnet/testnet deployments in your version control system
will let you keep track of your project's footprint on public networks.

During development, receipts for deployments of a project are kept in a
human- and VCS-friendly YAML format. When publishing an API client,
you may want to include individual deployments as JSON files... TODO

### Storing and exporting deployment state

By default, the list of contracts in each deployment created by Fadroma
is stored in `state/${CHAIN_ID}/deploy/${DEPLOYMENT}.yml`.

The deployment currently selected as "active" by the CLI
(usually, the latest created deployment) is symlinked at
`state/${CHAIN_ID}/deploy/.active.yml`.

### Exporting the deployment

Deployments in YAML multi-document format are human-readable
and version control-friendly. When a list of contracts in JSON
is desired, you can use the `export` command to export a JSON
snapshot of the active deployment.

For example, to select and export a mainnet deployment:

```sh
npm run mainnet select NAME
npm run mainnet export [DIRECTORY]
```

This will create a file named `NAME_@_TIMESTAMP.json`
in the current working directory (or another specified).

Internally, the data for the export is generated by the
`deployment.snapshot` getter:

```typescript
assert.deepEqual(
  Object.keys(deployment.snapshot.contracts),
  ['kv1', 'kv2']
)
```

In a standard Fadroma project, where the Rust contracts
and TypeScript API client live in the same repo, by `export`ing
the latest mainnet and testnet deployments to JSON files
during the TypeScript build process, and adding them to your
API client package, you can publish an up-to-date "address book"
of your project's active contracts as part of your API client library.

```typescript
// in your project's api.ts:

import { Deployment } from '@fadroma/agent'

// you would load snapshots as JSON, e.g.:
// const testnet = await (await fetch('./testnet_v4.json')).json()
export const mainnet = deployment.snapshot
export const testnet = deployment.snapshot

// and create instances of your deployment with preloaded
// "address books" of contracts. for example here we restore
// a different snapshot depending on whether we're passed a
// mainnet or testnet connection.
class DeploymentC extends Deployment {
  kv1 = this.contract({ crate: 'examples/kv', name: 'kv1', initMsg: {} })
  kv2 = this.contract({ crate: 'examples/kv', name: 'kv2', initMsg: {} })

  static connect = (agent: Agent) => {
    if (agent?.chain?.isMainnet) return new this({ ...mainnet, agent })
    if (agent?.chain?.isTestnet) return new this({ ...testnet, agent })
    return new this({ agent })
  }
}
```

### Connecting to an exported deployment

Having been deployed once, contracts may be used continously.
The `Deployment`'s `connect` method loads stored data about
the contracts in the deployment, populating the contained
`Contract` instances.

With the above setup you can automatically connect to
your project in mainnet or testnet mode, depending on
what `Agent` you pass:

```typescript
const mainnetAgent = { chain: { isMainnet: true } } // mock
const testnetAgent = { chain: { isTestnet: true } } // mock

const onMainnet = DeploymentC.connect(mainnetAgent)

const onTestnet = DeploymentC.connect(testnetAgent)

assert(onMainnet.isMainnet)
assert(onTestnet.isTestnet)
assert.deepEqual(Object.keys(onMainnet.contracts), ['kv1', 'kv2'])
assert.deepEqual(Object.keys(onTestnet.contracts), ['kv1', 'kv2'])
```

Or, to connect to individual contracts from the stored deployment:

```typescript
const kv1 = DeploymentC.connect(mainnetAgent).kv1.expect()
assert(kv1 instanceof Client)

const kv2 = DeploymentC.connect(testnetAgent).kv2.expect()
assert(kv2 instanceof Client)
```

### Adding custom migrations

Migrations can be implemented as static or regular methods
of `Deployment` classes.

```typescript
// in your project's api.ts:

import { Deployment } from '@fadroma/agent'

class DeploymentD extends DeploymentC {
  kv3 = this.contract({ crate: 'examples/kv', name: 'kv3', initMsg: {} })

  // simplest client-side migration is to just instantiate
  // a new deployment with the data from the old deployment.
  static upgrade = (previous: DeploymentC) =>
    new this({ ...previous })
}

// simplest chain-side migration is to just call default deploy,
// which should reuse kv1 and kv2 and only deploy kv3.
deployment = await DeploymentD.upgrade(deployment).deploy()
```

## Template

The `Template` class represents a smart contract's source, compilation,
binary, and upload. It can have a `codeHash` and `codeId` but not an
`address`.

**Instantiating a template** refers to calling the `template.instance`
method (or its plural, `template.instances`), which returns `Contract`,
which represents a particular smart contract instance, which can have
an `address`.

### Deploying multiple contracts from a template

The `deployment.template` method adds a `Template` to the `Deployment`.

```typescript
class Deployment4 extends Deployment {

  t = this.template({ crate: 'examples/kv' })

  a = this.t.instance({ name: 'a', initMsg: {} })

  b = this.t.instances([
    {name:'b1',initMsg:{}},
    {name:'b2',initMsg:{}},
    {name:'b3',initMsg:{}}
  ])

  c = this.t.instances({
    c1:{name:'c1',initMsg:{}},
    c2:{name:'c2',initMsg:{}},
    c3:{name:'c3',initMsg:{}}
  })

}
```

You can pass either an array or an object to `template.instances`.

```typescript
deployment = await getDeployment(Deployment4).deploy()
assert(deployment.t instanceof Template)

assert([
  deployment.a,
  ...Object.values(deployment.b)
  ...Object.values(deployment.c)
].every(
  c=>(c instanceof Contract) && (c.expect() instanceof Client)
))
```

### Building from source code

To build, the `builder` property must be set to a valid `Builder`.
When obtaining instances from a `Deployment`, the `builder` property
is provided automatically from `deployment.builder`.

```typescript
import { Builder } from '@fadroma/agent'
assert(deployment.t.builder instanceof Builder)
assert.equal(deployment.t.builder, deployment.builder)
```

You can build a `Template` (or its subclass, `Contract`) by awaiting the
`built` property or the return value of the `build()` method.

```typescript
await deployment.t.built
// -or-
await deployment.t.build()
```

See [the **build guide**](./build.html) for more info.

### Uploading binaries

To upload, the `uploader` property must be set to a valid `Uploader`.
When obtaining instances from a `Deployment`, the `uploader` property
is provided automatically from `deployment.uploader`.

```typescript
import { Uploader } from '@fadroma/agent'
assert(deployment.t.uploader instanceof Uploader)
assert.equal(deployment.t.uploader, deployment.uploader)
```

You can upload a `Template` (or its subclass, `Contract`) by awaiting the
`uploaded` property or the return value of the `upload()` method.

If a WASM binary is not present (`template.artifact` is empty),
but a source and a builder are present, this will also try to build the contract.

```typescript
await deployment.t.uploaded
// -or-
await deployment.t.upload()
```

See [the **upload guide**](./upload.html) for more info.

## Contract

The `Contract` class describes an individual smart contract instance and uniquely identifies it
within the `Deployment`.

```typescript
import { Contract } from '@fadroma/agent'

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

### Naming and labels

The chain requires labels to be unique.
Labels generated by Fadroma are of the format `${deployment.name}/${contract.name}`.

### Lazy init

The `initMsg` property of `Contract` can be a function returning the actual message.
This function is only called during instantiation, and can be used to generate init
messages on the fly, such as when passing the address of one contract to another.

### Deploying contract instances

To instantiate a `Contract`, its `agent` property must be set to a valid `Agent`.
When obtaining instances from a `Deployment`, their `agent` property is provided
from `deployment.agent`.

```typescript
import { Agent } from '@fadroma/agent'
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

```typescript
import './Deploy.test.ts'
```

---

# Fadroma Guide: Devnet

Fadroma enables fully local development of projects - no remote testnet needed!
This feature is known as **Fadroma Devnet**. 

Normally, you would interact with a devnet no different than any other
`Chain`: through your `Deployment` subclass.

When using the Fadroma CLI, `Chain` instances are provided automatically
to instances `Deployment` subclasses.

So, when `FADROMA_CHAIN` is set to `ScrtDevnet`, your deployment will
be instantiated alongside a local devnet, ready to operate!

As a shortcut, projects created via the Fadroma CLI contain the `devnet`
NPM script, which is an alias to `FADROMA_CHAIN=ScrtDevnet fadroma`.

So, to deploy your project to a local devnet, you would just run:

```sh
$ npm run devnet deploy
```

## Advanced usage

Fadroma Devnet includes container images based on `localsecret`,
for versions of Secret Network 1.2 to 1.9. Under the hood, the
implementation uses the library [`@hackbg/dock`](https://www.npmjs.com/package/@hackbg/dock)
to manage Docker images and containers. There is also experimental
support for Podman.

### Creating the devnet

When scripting with the Fadroma API outside of the standard CLI/deployment
context, you can use the `getDevnet` method to configure and obtain a `Devnet`
instance.

```typescript
import { getDevnet } from '@hackbg/fadroma'

const devnet = getDevnet(/* { options } */)
```

`getDevnet` supports the following options; their default values can be
set through environment variables.

At this point you have prepared a *description* of a devnet.
To actually launch it, use the `create` then the `start` method:

```typescript
await devnet.create()
await devnet.start()
```

At this point, you should have a devnet container running,
its state represented by files in your project's `state/` directory.

To operate on the devnet thus created, you will need to wrap it
in a **Chain** object and obtain the usual **Agent** instance.

For this, the **Devnet** class has the **getChain** method.

```typescript
const chain = devnet.getChain()
```

A `Chain` object which represents a devnet has the following additional API:

|name|description|
|-|-|
|**chain.mode**|**ChainMode**: `"Devnet"` when the chain in question is a devnet|
|**chain.isDevnet**|**boolean:** `true` when the chain in question is a devnet|
|**chain.devnet**|**DevnetHandle**: allows devnet internals to be controlled from your script|
|**chain.devnet.running**|**boolean**: `true` if the devnet container is running|
|**chain.devnet.start()**|**()⇒Promise\<this\>**: starts the devnet container|
|**chain.devnet.getAccount(name)**|**(string)⇒Promise\<Partial\<Agent\>\>**: returns info about a genesis account|
|**chain.devnet.assertPresence()**|**()⇒Promise\<void\>**: throws if the devnet container ID is known, but the container itself is not found|

```typescript
assert(chain.mode === 'Devnet')
assert(chain.isDevnet)
assert(chain.devnet === devnet)
```

### Devnet accounts

Devnet state is independent from the state of mainnet or testnet.
That means existing wallets and faucets don't exist. Instead, you
have access to multiple **genesis accounts**, which are provided
with initial balance to cover gas costs for your contracts.

When getting an **Agent** on the devnet, use the `name` property
to specify which genesis account to use. Default genesis account
names are `Admin`, `Alice`, `Bob`, `Charlie`, and `Mallory`.

```typescript
const alice = chain.getAgent({ name: 'Alice' })
await alice.ready
```

This will populate the created Agent with the mnemonic for that
genesis account.

```typescript
assert(
  alice instanceof Agent
)

assert.equal(
  alice.name,
  'Alice'
)

assert.equal(
  alice.address,
  $(chain.devnet.stateDir, 'wallet', 'Alice.json').as(JSONFile).load().address,
)

assert.equal(
  alice.mnemonic,
  $(chain.devnet.stateDir, 'wallet', 'Alice.json').as(JSONFile).load().mnemonic,
)
```

That's it! You are now set to use the standard Fadroma Agent API
to operate on the local devnet as the specified identity.

#### Custom devnet accounts

You can also specify custom genesis accounts by passing an array
of account names to the `accounts` parameter of the **getDevnet**
function.

```typescript
const anotherDevnet = getDevnet({
  accounts: [ 'Alice', 'Bob' ],
})

assert.deepEqual(
  anotherDevnet.accounts,
  [ 'Alice', 'Bob' ]
)

await anotherDevnet.delete()
```

### Pausing the devnet

You can pause the devnet by stopping the container:

```typescript
await devnet.pause()
await devnet.start()
await devnet.pause()
```

### Exporting a devnet snapshot

An exported devnet snapshot is a great way to provide a
standardized development build of your project. For example,
you can use one to test the frontend/contracts stack as a
step of your integration pipeline.

To create a snapshot, use the **export** method of the **Devnet** class:

```typescript
await devnet.export()
```

When the active chain is a devnet, the `export` command,
which exports a list of contracts in the current deployment,
also saves the current state of the devnet as **a new container image**.

```sh
$ npm run devnet export
```

### Cleaning up

Devnets are local-only and thus temporary.

To delete an individual devnet, the **Devnet** class
provides the **delete** method. This will stop and remove
the devnet container, then delete all devnet state in your
project's state directory.

```typescript
await devnet.delete()
```

To delete all devnets in a project, the **Project** class
provides the **resetDevnets** method:

```typescript
import Project from '@hackbg/fadroma'
const project = new Project()
project.resetDevnets()
```

The to call **resetDevnets** from the command line, use the
`reset` command:

```sh
$ npm run devnet reset
```

## Devnet state

Each **devnet** is a stateful local instance of a chain node
(such as `secretd` or `okp4d`), and consists of two things:

1. A container named `fadroma-KIND-ID`, where:

  * `KIND` is what kind of devnet it is. For now, the only valid
    value is `devnet`. In future releases, this will be changed to
    contain the chain name and maybe the chain version.

  * `ID` is a random 8-digit hex number. This way, when you have
    multiple devnets of the same kind, you can distinguish them
    from one another.

  * The name of the container corresponds to the chain ID of the
    contained devnet.

```typescript
assert.ok(
  chain.id.match(/fadroma-devnet-[0-9a-f]{8}/)
)

assert.equal(
  chain.id,
  chain.devnet.chainId
)

assert.equal(
  (await chain.devnet.container).name,
  `/${chain.id}`
)
```

2. State files under `your-project/state/fadroma-KIND-ID/`:

  * `devnet.json` contains metadata about the devnet, such as
    the chain ID, container ID, connection port, and container
    image to use.

  * `wallet/` contains JSON files with the addresses and mnemonics
    of the **genesis accounts** that are created when the devnet
    is initialized. These are the initial holders of the devnet's
    native token, and you can use them to execute transactions.

  * `upload/` and `deploy/` contain **upload and deploy receipts**.
    These work the same as for remote testnets and mainnets,
    and enable reuse of uploads and deployments.

```typescript
await devnet.create()
await devnet.start()
await devnet.pause()

assert.equal(
  $(chain.devnet.stateDir).name,
  chain.id
)

assert.deepEqual(
  $(chain.devnet.stateDir, 'devnet.json').as(JSONFile).load(),
  {
    chainId:     chain.id,
    containerId: chain.devnet.containerId,
    port:        chain.devnet.port,
    imageTag:    chain.devnet.imageTag
  }
)

assert.deepEqual(
  $(chain.devnet.stateDir, 'wallet').as(JSONDirectory).list(),
  chain.devnet.accounts
)

await devnet.delete()
```

---

```typescript
import { Chain, Agent } from '@fadroma/agent'
import $, { JSONFile, JSONDirectory } from '@hackbg/file'
import { Devnet } from '@hackbg/fadroma'
```

---

# Building contracts from source

When deploying, Fadroma automatically builds the `Contract`s specified in the deployment,
using a procedure based on [secret-contract-optimizer](https://hub.docker.com/r/enigmampc/secret-contract-optimizer).

This either with your local Rust/WASM toolchain,
or in a pre-defined [build container](https://github.com/hackbg/fadroma/pkgs/container/fadroma).
The latter option requires Docker (which you also need for the devnet).

By default, optimized builds are output to the `wasm` subdirectory of your project.
Checksums of build artifacts are emitted as `wasm/*.wasm.sha256`: these checksums
should be equal to the code hashes returned by the chain.

We advise you to keep these
**build receipts** in version control. This gives you a quick way to keep track of the
correspondence between changes to source and resulting changes to code hashes.

Furthermore, when creating a `Project`, you'll be asked to define one or more `Template`s
corresponding to the contract crates of your project. You can

Fadroma implements **reproducible compilation** of contracts.
What to compile is specified using the primitives defined in [Fadroma Core](../client/README.md).

## Build CLI

```shell
$ fadroma build CONTRACT    # nop if already built
$ fadroma rebuild CONTRACT  # always rebuilds
```

  * **`CONTRACT`**: one of the contracts defined in the [project](../project/Project.spec.ts),
    *or* a path to a crate assumed to contain a single contract.

### Builder configuration

## Build API

* **BuildRaw**: runs the build in the current environment
* **BuildContainer**: runs the build in a container for enhanced reproducibility

### Getting a builder

```typescript
import { getBuilder } from '@hackbg/fadroma'
const builder = getBuilder(/* { ...options... } */)

import { Builder } from '@hackbg/fadroma'
assert(builder instanceof Builder)
```

#### BuildContainer

By default, you get a `BuildContainer`,
which runs the build procedure in a container
provided by either Docker or Podman (as selected
by the `FADROMA_BUILD_PODMAN` environment variable).

```typescript
import { BuildContainer } from '@hackbg/fadroma'
assert.ok(getBuilder({ raw: false }) instanceof BuildContainer)
```

`BuildContainer` uses [`@hackbg/dock`](https://www.npmjs.com/package/@hackbg/dock) to
operate the container engine.

```typescript
import * as Dokeres from '@hackbg/dock'
assert.ok(getBuilder({ raw: false }).docker instanceof Dokeres.Engine)
```

Use `FADROMA_DOCKER` or the `dockerSocket` option to specify a non-default Docker socket path.

```typescript
getBuilder({ raw: false, dockerSocket: 'test' })
```

The `BuildContainer` runs the build procedure defined by the `FADROMA_BUILD_SCRIPT`
in a container based on the `FADROMA_BUILD_IMAGE`, resulting in optimized WASM build artifacts
being output to the `FADROMA_ARTIFACTS` directory.

#### BuildRaw

If you want to execute the build procedure in your
current environment, you can switch to `BuildRaw`
by passing `raw: true` or setting `FADROMA_BUILD_RAW`.

```typescript
const rawBuilder = getBuilder({ raw: true })

import { BuildRaw } from '@hackbg/fadroma'
assert.ok(rawBuilder instanceof BuildRaw)
```

### Building a contract

Now that we've obtained a `Builder`, let's compile a contract from source into a WASM binary.

#### Building a named contract from the project

Building asynchronously returns `Template` instances.
A `Template` is an undeployed contract. You can upload
it once, and instantiate any number of `Contract`s from it.

```typescript
for (const raw of [true, false]) {
  const builder = getBuilder({ raw })
```

To build a single crate with the builder:

```typescript
  const contract_0 = await builder.build({ crate: 'examples/kv' })
```

To build multiple crates in parallel:

```typescript
  const [contract_1, contract_2] = await builder.buildMany([
    { crate: 'examples/admin' },
    { crate: 'examples/killswitch' }
  ])
```

For built contracts, the following holds true:

```typescript
  for (const [contract, index] of [ contract_0, contract_1, contract_2 ].map((c,i)=>[c,i]) {
```

* Build result will contain code hash and path to binary:

```typescript
    assert(typeof contract.codeHash === 'string', `contract_${index}.codeHash is set`)
    assert(contract.artifact instanceof URL,      `contract_${index}.artifact is set`)
```

* Build result will contain info about build inputs:

```typescript
    assert(contract.workspace, `contract_${index}.workspace is set`)
    assert(contract.crate,     `contract_${index}.crate is set`)
    assert(contract.revision,  `contract_${index}.revision is set`)
```

The above holds true equally for contracts produced
by `BuildContainer` and `BuildRaw`.

```typescript
  }
}
```

#### Specifying a contract to build

The `Template` and `Contract` classes have the following properties for specifying the source:

|field|type|description|
|-|-|-|
|**`repository`**|Path or URL|Points to the Git repository containing the contract sources. This is all you need if your smart contract is a single crate.|
|**`workspace`**|Path or URL|Cargo workspace containing the contract sources. May or may not be equal to `contract.repo`. May be empty if the contract is a single crate.|
|**`crate`**|string|Name of the Cargo crate containing the individual contract source. Required if `contract.workspace` is set.|
|**`revision`**|string|Git reference (branch or tag). Defaults to `HEAD`, otherwise builds a commit from history.|

The outputs of builds are called **artifact**s, and are represented by two properties:

|field|type|description|
|-|-|-|
|**`artifact`**|URL|Canonical location of the compiled binary.|
|**`codeHash`**|string|SHA256 checksum of artifact. should correspond to **template.codeHash** and **instance.codeHash** properties of uploaded and instantiated contracts|

```typescript
import { Contract } from '@fadroma/agent'
const contract: Contract = new Contract({ builder, crate: 'fadroma-example-kv' })
await contract.compiled
```

```typescript
import { Template } from '@fadroma/agent'
const template = new Template({ builder, crate: 'fadroma-example-kv' })
await template.compiled
```

### Building past commits of contracts

* `DotGit`, a helper for finding the contents of Git history
  where Git submodules are involved. This works in tandem with
  `build.impl.mjs` to enable:
  * **building any commit** from a project's history, and therefore
  * **pinning versions** for predictability during automated one-step deployments.

If `.git` directory is present, builders can check out and build a past commits of the repo,
as specifier by `contract.revision`.

```typescript
import { Contract } from '@fadroma/agent'
import { getGitDir, DotGit } from '@hackbg/fadroma'

assert.throws(()=>getGitDir(new Contract()))

const contractWithSource = new Contract({
  repository: 'REPO',
  revision:   'REF',
  workspace:  'WORKSPACE'
  crate:      'CRATE'
})

assert.ok(getGitDir(contractWithSource) instanceof DotGit)
```

### Build caching

When build caching is enabled, each build call first checks in `FADROMA_ARTIFACTS`
for a corresponding pre-existing build and reuses it if present.

Setting `FADROMA_REBUILD` disables build caching.

## Implementation details

### The build procedure

The ultimate build procedure, i.e. actual calls to `cargo` and such,
is implemented in the standalone script `FADROMA_BUILD_SCRIPT` (default: `build.impl.mjs`),
which is launched by the builders.

### Builders

The subclasses of the abstract base class `Builder` in Fadroma Core
implement the compilation procedure for contracts.

---

```typescript
import { fileURLToPath } from 'url'
```

---

# Fadroma Upload

Fadroma takes care of **uploading WASM files to get code IDs**.

Like builds, uploads are *idempotent*: if the same code hash is
known to already be uploaded to the same chain (as represented by
an upload receipt in `state/$CHAIN/uploads/$CODE_HASH.json`,
Fadroma will skip the upload and reues the existing code ID.

## Upload CLI

The `fadroma upload` command (available through `npm run $MODE upload`
in the default project structure) lets you access Fadroma's `Uploader`
implementation from the command line.

```shell
$ fadroma upload CONTRACT   # nil if same contract is already uploaded
$ fadroma reupload CONTRACT # always reupload
```

## Upload API

The client package, `@fadroma/agent`, exposes a base `Uploader` class,
which the global `fetch` method to obtain code from any supported URL
(`file:///` or otherwise).

This `fetch`-based implementation only supports temporary, in-memory
upload caching: if you ask it to upload the same contract many times,
it will upload it only once - but it will forget all about that
as soon as you refresh the page.

The backend package, `@hackbg/fadroma`, provides `FSUploader`.
This extension of `Uploader` uses Node's `fs` API instead, and
writes upload receipts into the upload state directory for the
given chain (e.g. `state/$CHAIN/uploads/`).

Let's try uploading an example WASM binary:

```typescript
import { fixture } from './fixtures/Fixtures.ts.md'
const artifact = fixture('fadroma-example-kv@HEAD.wasm') // replace with path to your binary
```

* Uploading with default configuration (from environment variables):

```typescript
import { upload } from '@hackbg/fadroma'
await upload({ artifact })
```

* Passing custom options to the uploader:

```typescript
import { getUploader } from '@hackbg/fadroma'
await getUploader({ /* options */ }).upload({ artifact })
```

---

# Configuration

|Env var|Default path|Description|
|-|-|-|
|`FADROMA_ROOT`        |current working directory |Root directory of project|
|`FADROMA_PROJECT`     |`@/ops.ts`                |Project command entrypoint|
|`FADROMA_BUILD_STATE` |`@/wasm`                  |Checksums of compiled contracts by version|
|`FADROMA_UPLOAD_STATE`|`@/state/uploads.csv`     |Receipts of uploaded contracts|
|`FADROMA_DEPLOY_STATE`|`@/state/deployments.csv` |Receipts of instantiated (deployed) contracts|

|name|env var|description|
|-|-|-|
|**chainId**|`FADROMA_DEVNET_CHAIN_ID`|**string**: chain ID (set to reconnect to existing devnet)|
|**platform**|`FADROMA_DEVNET_PLATFORM`|**string**: what kind of devnet to instantiate (e.g. `scrt_1.9`)|
|**deleteOnExit**|`FADROMA_DEVNET_REMOVE_ON_EXIT`|**boolean**: automatically remove the container and state when your script exits|
|**keepRunning**|`FADROMA_DEVNET_KEEP_RUNNING`|**boolean**: don't pause the container when your script exits|
|**host**|`FADROMA_DEVNET_HOST`|**string**: hostname where the devnet is running|
|**port**|`FADROMA_DEVNET_PORT`|**string**: port on which to connect to the devnet|

|env var|type|description|
|-|-|-|
|**`FADROMA_BUILD_VERBOSE`**|flag|more log output
|**`FADROMA_BUILD_QUIET`**|flag|less log output
|**`FADROMA_BUILD_SCRIPT`**|path to script|build implementation
|**`FADROMA_BUILD_RAW`**|flag|run the build script in the current environment instead of container
|**`FADROMA_DOCKER`**|host:port or socket|non-default docker socket address
|**`FADROMA_BUILD_IMAGE`**|docker image tag|image to run
|**`FADROMA_BUILD_DOCKERFILE`**|path to dockerfile|dockerfile to build image if missing
|**`FADROMA_BUILD_PODMAN`**|flag|whether to use podman instead of docker
|**`FADROMA_PROJECT`**|path|root of project
|**`FADROMA_ARTIFACTS`**|path|project artifact cache
|**`FADROMA_REBUILD`**|flag|builds always run, artifact cache is ignored
