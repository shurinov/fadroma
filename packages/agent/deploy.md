

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

import { Deployment } from '@fadroma/agent'

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


# class *ContractCode*

```typescript
new ContractCode(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>compiled</strong></td>
<td><strong>CompiledCode</strong>. </td></tr>
<tr><td valign="top">
<strong>compiler</strong></td>
<td><strong>Compiler</strong>. </td></tr>
<tr><td valign="top">
<strong>deployer</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>source</strong></td>
<td><strong>SourceCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploaded</strong></td>
<td><strong>UploadedCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploader</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<br><strong>compile(__namedParameters )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>upload(__namedParameters )</strong></td>
<td></td></tr></tbody></table>

# class *ContractInstance*

A contract that is part of a deploment.
- needed for deployment-wide deduplication
- generates structured label

```typescript
new ContractInstance(
  properties: undefined
)
```

<table><tbody>
<tr><td valign="top">
<strong>address</strong></td>
<td><strong>string</strong>. Address of this contract instance. Unique per chain.</td></tr>
<tr><td valign="top">
<strong>chainId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>codeHash</strong></td>
<td><strong>string</strong>. Code hash uniquely identifying the compiled code.</td></tr>
<tr><td valign="top">
<strong>codeId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>compiled</strong></td>
<td><strong>CompiledCode</strong>. </td></tr>
<tr><td valign="top">
<strong>compiler</strong></td>
<td><strong>Compiler</strong>. </td></tr>
<tr><td valign="top">
<strong>deployer</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>deployment</strong></td>
<td><strong>Deployment</strong>. Deployment to which this unit belongs.</td></tr>
<tr><td valign="top">
<strong>initBy</strong></td>
<td><strong>undefined</strong>. Address of agent that performed the init tx.</td></tr>
<tr><td valign="top">
<strong>initFee</strong></td>
<td><strong>unknown</strong>. Fee to use for init.</td></tr>
<tr><td valign="top">
<strong>initGas</strong></td>
<td><strong>unknown</strong>. Contents of init message.</td></tr>
<tr><td valign="top">
<strong>initMemo</strong></td>
<td><strong>string</strong>. Instantiation memo.</td></tr>
<tr><td valign="top">
<strong>initMsg</strong></td>
<td><strong>Into</strong>. Contents of init message.</td></tr>
<tr><td valign="top">
<strong>initSend</strong></td>
<td><strong>undefined</strong>. Native tokens to send to the new contract.</td></tr>
<tr><td valign="top">
<strong>initTx</strong></td>
<td><strong>string</strong>. ID of transaction that performed the init.</td></tr>
<tr><td valign="top">
<strong>isTemplate</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>label</strong></td>
<td><strong>string</strong>. Full label of the instance. Unique for a given chain.</td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>name</strong></td>
<td><strong>string</strong>. Name of this unit.</td></tr>
<tr><td valign="top">
<strong>source</strong></td>
<td><strong>SourceCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploaded</strong></td>
<td><strong>UploadedCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploader</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<br><strong>compile(__namedParameters )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>connect(agent )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>deploy(__namedParameters )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>isValid()</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>serialize()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>upload(__namedParameters )</strong></td>
<td></td></tr></tbody></table>

# class *ContractTemplate*

A contract that is part of a deploment.
- needed for deployment-wide deduplication
- generates structured label

```typescript
new ContractTemplate(
  properties: undefined
)
```

<table><tbody>
<tr><td valign="top">
<strong>chainId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>codeHash</strong></td>
<td><strong>string</strong>. Code hash uniquely identifying the compiled code.</td></tr>
<tr><td valign="top">
<strong>codeId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>compiled</strong></td>
<td><strong>CompiledCode</strong>. </td></tr>
<tr><td valign="top">
<strong>compiler</strong></td>
<td><strong>Compiler</strong>. </td></tr>
<tr><td valign="top">
<strong>deployer</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>deployment</strong></td>
<td><strong>Deployment</strong>. Deployment to which this unit belongs.</td></tr>
<tr><td valign="top">
<strong>isTemplate</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>name</strong></td>
<td><strong>string</strong>. Name of this unit.</td></tr>
<tr><td valign="top">
<strong>source</strong></td>
<td><strong>SourceCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploaded</strong></td>
<td><strong>UploadedCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploader</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<br><strong>compile(__namedParameters )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>contract(name parameters )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>contracts(instanceParameters )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>serialize()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>upload(__namedParameters )</strong></td>
<td></td></tr></tbody></table>

# class *Deployment*

A collection of contracts.

```typescript
new Deployment(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>name</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>size</strong></td>
<td><strong>number</strong>. </td></tr>
<tr><td valign="top">
<strong>[species]</strong></td>
<td><strong>MapConstructor</strong>. </td></tr>
<tr><td valign="top">
<strong>[iterator]()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>addContract(args )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>addContracts(args )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>build(__namedParameters )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>clear()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>contract(name properties )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>delete(key )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>deploy(__namedParameters )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>entries()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>forEach(callbackfn thisArg )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>get(key )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>has(key )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>keys()</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>serialize()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>set(name unit )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>template(name properties )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>upload(__namedParameters )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>values()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>fromSnapshot(__namedParameters )</strong></td>
<td></td></tr></tbody></table>

# class *DeploymentUnit*

A contract that is part of a deploment.
- needed for deployment-wide deduplication
- generates structured label

```typescript
new DeploymentUnit(
  properties: undefined
)
```

<table><tbody>
<tr><td valign="top">
<strong>chainId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>codeHash</strong></td>
<td><strong>string</strong>. Code hash uniquely identifying the compiled code.</td></tr>
<tr><td valign="top">
<strong>codeId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>compiled</strong></td>
<td><strong>CompiledCode</strong>. </td></tr>
<tr><td valign="top">
<strong>compiler</strong></td>
<td><strong>Compiler</strong>. </td></tr>
<tr><td valign="top">
<strong>deployer</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>deployment</strong></td>
<td><strong>Deployment</strong>. Deployment to which this unit belongs.</td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>name</strong></td>
<td><strong>string</strong>. Name of this unit.</td></tr>
<tr><td valign="top">
<strong>source</strong></td>
<td><strong>SourceCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploaded</strong></td>
<td><strong>UploadedCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploader</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<br><strong>compile(__namedParameters )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>serialize()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>upload(__namedParameters )</strong></td>
<td></td></tr></tbody></table>

# class *UploadedCode*

An object representing the contract's binary uploaded to a given chain.

```typescript
new UploadedCode(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>chainId</strong></td>
<td><strong>string</strong>. ID of chain on which this contract is uploaded.</td></tr>
<tr><td valign="top">
<strong>codeHash</strong></td>
<td><strong>string</strong>. Code hash uniquely identifying the compiled code.</td></tr>
<tr><td valign="top">
<strong>codeId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>uploadBy</strong></td>
<td><strong>undefined</strong>. address of agent that performed the upload.</td></tr>
<tr><td valign="top">
<strong>uploadGas</strong></td>
<td><strong>undefined</strong>. address of agent that performed the upload.</td></tr>
<tr><td valign="top">
<strong>uploadTx</strong></td>
<td><strong>string</strong>. TXID of transaction that performed the upload.</td></tr>
<tr><td valign="top">
<strong>canInstantiate</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canInstantiateInfo</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>serialize()</strong></td>
<td></td></tr></tbody></table>