

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
import { Client } from '@fadroma/agent'

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
import { fetchLabel } from '@fadroma/agent'

await fetchCodeId(client, agent)
await fetchLabel(client, agent)
```

The code ID is a unique identifier for compiled code uploaded to a chain.

The code hash also uniquely identifies for the code that underpins a contract.
However, unlike the code ID, which is opaque, the code hash corresponds to the
actual content of the code. Uploading the same code multiple times will give
you different code IDs, but the same code hash.


# class *LocalCompiledCode*

An object representing a given compiled binary on the local filesystem.

```typescript
new LocalCompiledCode(
  properties: Partial<...>,
)
```

<!-- @hackbg/docs: begin -->

# class *CompiledCode*
An object representing a given compiled binary.

```typescript
const compiledCode = new CompiledCode(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>codeData</strong></td>
<td><strong>Uint8Array</strong>. The compiled code.</td></tr>
<tr><td valign="top">
<strong>codeHash</strong></td>
<td><strong>string</strong>. Code hash uniquely identifying the compiled code.</td></tr>
<tr><td valign="top">
<strong>codePath</strong></td>
<td><strong>undefined</strong>. Location of the compiled code.</td></tr>
<tr><td valign="top">
<strong>canFetch</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canFetchInfo</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canUpload</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canUploadInfo</strong></td>
<td></td></tr></tbody></table>

## method *compiledCode.computeHash*
Compute the code hash if missing; throw if different.
```typescript
compiledCode.computeHash()
```

## method *compiledCode.doFetch*
```typescript
const result: Uint8Array = await compiledCode.doFetch()
```

## method *compiledCode.fetch*
```typescript
const result: Uint8Array = await compiledCode.fetch()
```

## method *compiledCode.serialize*
```typescript
compiledCode.serialize()
```

## method *compiledCode.toCodeHash*
```typescript
const result: string = compiledCode.toCodeHash(
  data,
)
```

# class *Compiler*
```typescript
const compiler = new Compiler(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>caching</strong></td>
<td><strong>boolean</strong>. Whether to enable build caching.
When set to false, this compiler will rebuild even when
binary and checksum are both present in wasm/ directory</td></tr>
<tr><td valign="top">
<strong>id</strong></td>
<td><strong>string</strong>. Unique identifier of this compiler implementation.</td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr></tbody></table>

## method *compiler.build*
Compile a source.
`@hackbg/fadroma` implements dockerized and non-dockerized
variants using its `build.impl.mjs` script.
```typescript
const result: CompiledCode = await compiler.build(
  source,
  args,
)
```

## method *compiler.buildMany*
Build multiple sources.
Default implementation of buildMany is sequential.
Compiler classes may override this to optimize.
```typescript
compiler.buildMany(
  inputs,
)
```

# class *LocalCompiledCode*
An object representing a given compiled binary on the local filesystem.

```typescript
const localCompiledCode = new LocalCompiledCode(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>codeData</strong></td>
<td><strong>Uint8Array</strong>. The compiled code.</td></tr>
<tr><td valign="top">
<strong>codeHash</strong></td>
<td><strong>string</strong>. Code hash uniquely identifying the compiled code.</td></tr>
<tr><td valign="top">
<strong>codePath</strong></td>
<td><strong>undefined</strong>. Location of the compiled code.</td></tr>
<tr><td valign="top">
<strong>canFetch</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canFetchInfo</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canUpload</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canUploadInfo</strong></td>
<td></td></tr></tbody></table>

## method *localCompiledCode.computeHash*
Compute the code hash if missing; throw if different.
```typescript
localCompiledCode.computeHash()
```

## method *localCompiledCode.doFetch*
```typescript
localCompiledCode.doFetch()
```

## method *localCompiledCode.fetch*
```typescript
const result: Uint8Array = await localCompiledCode.fetch()
```

## method *localCompiledCode.serialize*
```typescript
localCompiledCode.serialize()
```

## method *localCompiledCode.toCodeHash*
```typescript
const result: string = localCompiledCode.toCodeHash(
  data,
)
```

# class *RustSourceCode*
An object representing a given source code.

```typescript
const rustSourceCode = new RustSourceCode(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>cargoCrate</strong></td>
<td><strong>string</strong>. Name of crate.</td></tr>
<tr><td valign="top">
<strong>cargoFeatures</strong></td>
<td><strong>undefined</strong>. List of crate features to enable during build.</td></tr>
<tr><td valign="top">
<strong>cargoToml</strong></td>
<td><strong>string</strong>. Path to the crate's Cargo.toml under sourcePath</td></tr>
<tr><td valign="top">
<strong>cargoWorkspace</strong></td>
<td><strong>string</strong>. Path to the workspace's Cargo.toml in the source tree.</td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>sourceDirty</strong></td>
<td><strong>boolean</strong>. Whether the code contains uncommitted changes.</td></tr>
<tr><td valign="top">
<strong>sourceOrigin</strong></td>
<td><strong>undefined</strong>. URL pointing to Git upstream containing the canonical source code.</td></tr>
<tr><td valign="top">
<strong>sourcePath</strong></td>
<td><strong>string</strong>. Path to local checkout of the source code (with .git directory if sourceRef is set).</td></tr>
<tr><td valign="top">
<strong>sourceRef</strong></td>
<td><strong>string</strong>. Pointer to the source commit.</td></tr>
<tr><td valign="top">
<strong>canCompile</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canCompileInfo</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canFetch</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canFetchInfo</strong></td>
<td></td></tr></tbody></table>

## method *rustSourceCode.serialize*
```typescript
rustSourceCode.serialize()
```

# class *SourceCode*
An object representing a given source code.

```typescript
const sourceCode = new SourceCode(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>sourceDirty</strong></td>
<td><strong>boolean</strong>. Whether the code contains uncommitted changes.</td></tr>
<tr><td valign="top">
<strong>sourceOrigin</strong></td>
<td><strong>undefined</strong>. URL pointing to Git upstream containing the canonical source code.</td></tr>
<tr><td valign="top">
<strong>sourcePath</strong></td>
<td><strong>string</strong>. Path to local checkout of the source code (with .git directory if sourceRef is set).</td></tr>
<tr><td valign="top">
<strong>sourceRef</strong></td>
<td><strong>string</strong>. Pointer to the source commit.</td></tr>
<tr><td valign="top">
<strong>canCompile</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canCompileInfo</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canFetch</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canFetchInfo</strong></td>
<td></td></tr></tbody></table>

## method *sourceCode.serialize*
```typescript
sourceCode.serialize()
```
<!-- @hackbg/docs: end -->
