# Fadroma Project Scope

## Project CLI

```shell
$ npx fadroma project create
$ npx fadroma project contract add
$ npx fadroma project contract list
$ npx fadroma project contract del
```

### Project configuration

|Env var|Default path|Description|
|-|-|-|
|`FADROMA_CONFIG`     |`@/fadroma.json`          |Global project configuration|
|`FADROMA_ARTIFACTS`  |`@/artifacts.sha256`      |Checksums of compiled contracts by version|
|`FADROMA_UPLOADS`    |`@/state/uploads.csv`     |Receipts of uploaded contracts|
|`FADROMA_DEPLOYMENTS`|`@/state/deployments.csv` |Receipts of instantiated (deployed) contracts|

## Project API

### Creating a project

```typescript
import { fixture } from '../fixtures/Fixtures.ts.md'
const root = fixture('project') // replace with path to your project

import Project from '@fadroma/ops'
const project = new Project({
  root,
  name: 'my-project',
  templates: {
    foo: {},
    bar: {},
  }
}).create()
```

### Adding contracts to the project scope

```shell
$ npx fadroma contract list
$ npx fadroma contract add
$ npx fadroma contract del
```

```typescript
const foo = project.getTemplate('foo')
assert(foo instanceof Template)

const baz = project.setTemplate('baz')
assert(baz instanceof Template)
```

## Project state

### Build artifacts

Checksums of compiled contracts by version.

### Upload receipts

Records of a single uploaded contract binary.

Stored in `state/$CHAIN_ID/upload/$CODE_ID.yml`.

### Deploy receipts

Records of one or more deployed contract instances.

The **deployment receipt system** keeps track of the addresses, code ids, code hashes, and other
info about the smart contracts that you deployed, in the form of files under
`state/$CHAIN_ID/deploy/$DEPLOYMENT.yml`.

Besides `context.contract.get()` and `.getOrDeploy()`, you can access it directly via:
* `context.deployment: Deployment`: handle to currently selected deployment.
* `context.deployments: Deployments`: deployment directory for current project and chain,
  listing other deployments.

The deployments system prefixes all contract labels with the name of the deployment.
This is because labels are expected to be both meaningful and globally unique.

* So if you `name` your contracts `ALICE` and `BOB`, and your deployment is called `20220706`,
  the on-chain labels of the contracts will be `20220706/ALICE` and `20220706/BOB`.

* The timestamp here corresponds to the moment the deployment was created, and not the moment
  when a particular contract was deployed. You can get the latter by looking at `initTx` in the
  deployment receipt, and querying that transaction in the transaction explorer.

* We recommend that you keep receipts of your primary mainnet and testnet deployments in your
  VCS system, in order to keep track of your project's footprint on public networks.

```typescript
import assert from 'node:assert'
import { Template } from '@fadroma/agent'
```