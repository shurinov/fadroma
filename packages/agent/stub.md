<!-- @hackbg/docs: begin -->

# class *StubBackend*
This is the base class for any connection backend, such as:

  * Remote RPC endpoint.
  * Local devnet RPC endpoint.
  * Stub/mock implementation of chain.

You shouldn't need to instantiate this class directly.
Instead, see `Connection`, `Devnet`, and their subclasses.

```typescript
const stubBackend = new StubBackend(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>accounts</strong></td>
<td><strong>Map</strong>. </td></tr>
<tr><td valign="top">
<strong>alive</strong></td>
<td><strong>boolean</strong>. </td></tr>
<tr><td valign="top">
<strong>balances</strong></td>
<td><strong>Map</strong>. </td></tr>
<tr><td valign="top">
<strong>chainId</strong></td>
<td><strong>string</strong>. The chain ID that will be passed to the devnet node.</td></tr>
<tr><td valign="top">
<strong>gasToken</strong></td>
<td><strong>NativeToken</strong>. Denomination of base gas token for this chain.</td></tr>
<tr><td valign="top">
<strong>instances</strong></td>
<td><strong>Map</strong>. </td></tr>
<tr><td valign="top">
<strong>lastCodeId</strong></td>
<td><strong>number</strong>. </td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>prefix</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>uploads</strong></td>
<td><strong>Map</strong>. </td></tr>
<tr><td valign="top">
<strong>url</strong></td>
<td><strong>string</strong>. </td></tr></tbody></table>

## method [*stubBackend.connect*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L190)
<pre>
<strong>const</strong> result: <em><a href="#">Connection</a></em> = <strong>await</strong> stubBackend.connect(
  parameter: <em>string | Partial&lt;&gt;</em>,
)
</pre>

## method [*stubBackend.execute*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L258)
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> stubBackend.execute(
  ...args: <em>unknown</em>,
)
</pre>

## method [*stubBackend.export*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L229)
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> stubBackend.export(
  ...args: <em>unknown</em>,
)
</pre>

## method [*stubBackend.getIdentity*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L208)
<pre>
<strong>const</strong> result: <em><a href="#">Identity</a></em> = <strong>await</strong> stubBackend.getIdentity(
  name: <em>string</em>,
)
</pre>

## method [*stubBackend.import*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L225)
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> stubBackend.import(
  ...args: <em>unknown</em>,
)
</pre>

## method [*stubBackend.instantiate*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L243)
<pre>
stubBackend.instantiate(
  creator: <em>string</em>,
  codeId: <em>string</em>,
  options: <em>unknown</em>,
)
</pre>

## method [*stubBackend.pause*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L220)
<pre>
<strong>const</strong> result: <em><a href="#">StubBackend</a></em> = <strong>await</strong> stubBackend.pause()
</pre>

## method [*stubBackend.start*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L215)
<pre>
<strong>const</strong> result: <em><a href="#">StubBackend</a></em> = <strong>await</strong> stubBackend.start()
</pre>

## method [*stubBackend.upload*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L233)
<pre>
stubBackend.upload(
  codeData: <em>Uint8Array</em>,
)
</pre>

# class *StubBatch*
Builder object for batched transactions.

```typescript
const stubBatch = new StubBatch(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>connection</strong></td>
<td><strong>StubConnection</strong>. </td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>messages</strong></td>
<td><strong>undefined</strong>. </td></tr></tbody></table>

## method [*stubBatch.execute*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L276)
Add an execute message to the batch.
<pre>
<strong>const</strong> result: <em><a href="#">StubBatch</a></em> = stubBatch.execute(
  ...args: <em></em>,
)
</pre>

## method [*stubBatch.instantiate*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L271)
Add an instantiate message to the batch.
<pre>
<strong>const</strong> result: <em><a href="#">StubBatch</a></em> = stubBatch.instantiate(
  ...args: <em></em>,
)
</pre>

## method [*stubBatch.submit*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L281)
Submit the batch.
<pre>
<strong>const</strong> result: <em>object</em> = <strong>await</strong> stubBatch.submit()
</pre>

## method [*stubBatch.upload*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L266)
Add an upload message to the batch.
<pre>
<strong>const</strong> result: <em><a href="#">StubBatch</a></em> = stubBatch.upload(
  ...args: <em></em>,
)
</pre>

# class *StubBlock*
The building block of a blockchain.
Each block contains collection of transactions that are
appended to the blockchain at a given point in time.

```typescript
const stubBlock = new StubBlock(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>chain</strong></td>
<td><strong>Connection</strong>. Connection to the chain to which this block belongs.</td></tr>
<tr><td valign="top">
<strong>hash</strong></td>
<td><strong>string</strong>. Content-dependent ID of block.</td></tr>
<tr><td valign="top">
<strong>height</strong></td>
<td><strong>number</strong>. Monotonically incrementing ID of block.</td></tr></tbody></table>

## method [*stubBlock.getTransactionsById*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L18)
<pre>
<strong>const</strong> result: <em>Record&lt;string, Transaction&gt;</em> = <strong>await</strong> stubBlock.getTransactionsById()
</pre>

## method [*stubBlock.getTransactionsInOrder*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L21)
<pre>
<strong>const</strong> result: <em><a href="#">Transaction</a>[]</em> = <strong>await</strong> stubBlock.getTransactionsInOrder()
</pre>

# class *StubCompiler*
A compiler that does nothing. Used for testing.

```typescript
const stubCompiler = new StubCompiler(
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

## method [*stubCompiler.build*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L297)
Compile a source.
`@hackbg/fadroma` implements dockerized and non-dockerized
variants using its `build.impl.mjs` script.
<pre>
<strong>const</strong> result: <em><a href="#">CompiledCode</a></em> = <strong>await</strong> stubCompiler.build(
  source: <em>string | Partial&lt;SourceCode&gt;</em>,
  ...args: <em>any</em>,
)
</pre>

## method [*stubCompiler.buildMany*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/program.browser.ts#L27)
Build multiple sources.
Default implementation of buildMany is sequential.
Compiler classes may override this to optimize.
<pre>
<strong>const</strong> result: <em><a href="#">CompiledCode</a>[]</em> = <strong>await</strong> stubCompiler.buildMany(
  inputs: <em>Partial&lt;SourceCode&gt;[]</em>,
)
</pre>

# class *StubConnection*
This is the base class for a connection to a blockchain via a given endpoint.

Use one of its subclasses in `@fadroma/scrt`, `@fadroma/cw`, `@fadroma/namada`
to connect to the corresponding chain. Or, extend this class to implement
support for new kinds of blockchains.

```typescript
const stubConnection = new StubConnection(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>alive</strong></td>
<td><strong>boolean</strong>. Setting this to false stops retries.</td></tr>
<tr><td valign="top">
<strong>api</strong></td>
<td><strong>unknown</strong>. Instance of platform SDK. This must be provided in a subclass.

Since most chain SDKs initialize asynchronously, this is usually a `Promise`
that resolves to an instance of the underlying client class (e.g. `CosmWasmClient` or `SecretNetworkClient`).

Since transaction and query methods are always asynchronous as well, well-behaved
implementations of Fadroma Agent begin each method that talks to the chain with
e.g. `const { api } = await this.api`, making sure an initialized platform SDK instance
is available.</td></tr>
<tr><td valign="top">
<strong>backend</strong></td>
<td><strong>StubBackend</strong>. </td></tr>
<tr><td valign="top">
<strong>blockInterval</strong></td>
<td><strong>number</strong>. Time to ping for next block.</td></tr>
<tr><td valign="top">
<strong>chainId</strong></td>
<td><strong>string</strong>. Chain ID. This is a string that uniquely identifies a chain.
A project's mainnet and testnet have different chain IDs.</td></tr>
<tr><td valign="top">
<strong>fees</strong></td>
<td><strong>undefined</strong>. Default transaction fees.</td></tr>
<tr><td valign="top">
<strong>identity</strong></td>
<td><strong>Identity</strong>. Signer identity.</td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>mode</strong></td>
<td><strong>undefined</strong>. Chain mode.</td></tr>
<tr><td valign="top">
<strong>url</strong></td>
<td><strong>string</strong>. Connection URL.

The same chain may be accessible via different endpoints, so
this property contains the URL to which requests are sent.</td></tr>
<tr><td valign="top">
<strong>gasToken</strong></td>
<td><strong>NativeToken</strong>. Native token of chain.</td></tr>
<tr><td valign="top">
<strong>address</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>balance</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>block</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>defaultDenom</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>height</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>nextBlock</strong></td>
<td></td></tr></tbody></table>

## method [*stubConnection.batch*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/stub.ts#L36)
Construct a transaction batch.
<pre>
<strong>const</strong> result: <em><a href="#">Batch&lt;StubConnection&gt;</a></em> = stubConnection.batch()
</pre>

## method [*stubConnection.execute*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L568)
Call a given program's transaction method.
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> stubConnection.execute(
  contract: <em>string | Partial&lt;ContractInstance&gt;</em>,
  message: <em>Message</em>,
  options: <em>{
    execFee,
    execMemo,
    execSend,
  }</em>,
)
</pre>

## method [*stubConnection.getBalanceIn*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L389)
Get the balance in a given native token, of
either this connection's identity's address,
or of another given address.
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> stubConnection.getBalanceIn(
  token: <em>string</em>,
  address: <em>string | {
    address,
  }</em>,
)
</pre>

## method [*stubConnection.getBalanceOf*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L364)
Get the balance in a native token of a given address,
either in this connection's gas token,
or in another given token.
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> stubConnection.getBalanceOf(
  address: <em>string | {
    address,
  }</em>,
  token: <em>string</em>,
)
</pre>

## method [*stubConnection.getBlock*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L222)
Get info about a specific block.
If no height is passed, gets info about the latest block.
<pre>
<strong>const</strong> result: <em><a href="#">Block</a></em> = <strong>await</strong> stubConnection.getBlock(
  height: <em>number</em>,
)
</pre>

## method [*stubConnection.getCodeHashOfAddress*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L264)
Get the code hash of a given address.
<pre>
<strong>const</strong> result: <em>string</em> = <strong>await</strong> stubConnection.getCodeHashOfAddress(
  contract: <em>string | {
    address,
  }</em>,
)
</pre>

## method [*stubConnection.getCodeHashOfCodeId*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L248)
Get the code hash of a given code id.
<pre>
<strong>const</strong> result: <em>string</em> = <strong>await</strong> stubConnection.getCodeHashOfCodeId(
  contract: <em>string | {
    codeId,
  }</em>,
)
</pre>

## method [*stubConnection.getCodeId*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L232)
Get the code id of a given address.
<pre>
<strong>const</strong> result: <em>string</em> = <strong>await</strong> stubConnection.getCodeId(
  contract: <em>string | {
    address,
  }</em>,
)
</pre>

## method [*stubConnection.getCodes*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L294)
<pre>
<strong>const</strong> result: <em>Record&lt;string, UploadedCode&gt;</em> = <strong>await</strong> stubConnection.getCodes()
</pre>

## method [*stubConnection.getContract*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L280)
Get a client handle for a specific smart contract, authenticated as as this agent.
<pre>
<strong>const</strong> result: <em><a href="#">Contract</a></em> = stubConnection.getContract(
  options: <em>string | {
    address,
  }</em>,
)
</pre>

## method [*stubConnection.getContractsByCodeId*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L303)
Get client handles for all contracts that match a code ID
<pre>
<strong>const</strong> result: <em>Record&lt;string, Contract&gt;</em> = <strong>await</strong> stubConnection.getContractsByCodeId(
  id: <em>string</em>,
)
</pre>
<pre>
<strong>const</strong> result: <em>Record&lt;string, InstanceType&gt;</em> = <strong>await</strong> stubConnection.getContractsByCodeId(
  id: <em>string</em>,
  $C: <em>C</em>,
)
</pre>

## method [*stubConnection.getContractsByCodeIds*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L325)
Get client handles for all contracts that match multiple code IDs
<pre>
<strong>const</strong> result: <em>Record&lt;string, Record&gt;</em> = <strong>await</strong> stubConnection.getContractsByCodeIds(
  ids: <em>Iterable&lt;string&gt;</em>,
)
</pre>
<pre>
<strong>const</strong> result: <em>Record&lt;string, Record&gt;</em> = <strong>await</strong> stubConnection.getContractsByCodeIds(
  ids: <em>Iterable&lt;string&gt;</em>,
  $C: <em>C</em>,
)
</pre>
<pre>
<strong>const</strong> result: <em>Record&lt;string, Record&gt;</em> = <strong>await</strong> stubConnection.getContractsByCodeIds(
  ids: <em>Record&lt;string, C&gt;</em>,
)
</pre>

## method [*stubConnection.instantiate*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L524)
Instantiate a new program from a code id, label and init message.
<pre>
stubConnection.instantiate(
  contract: <em>string | Partial&lt;UploadedCode&gt;</em>,
  options: <em>Partial&lt;ContractInstance&gt;</em>,
)
</pre>

## method [*stubConnection.query*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L416)
Query a contract.
<pre>
<strong>const</strong> result: <em>Q</em> = <strong>await</strong> stubConnection.query(
  contract: <em>string | {
    address,
  }</em>,
  message: <em>Message</em>,
)
</pre>

## method [*stubConnection.send*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L432)
Send native tokens to 1 recipient.
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> stubConnection.send(
  recipient: <em>string | {
    address,
  }</em>,
  amounts: <em>ICoin | TokenAmount</em>,
  options: <em>{
    sendFee,
    sendMemo,
  }</em>,
)
</pre>

## method [*stubConnection.upload*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L464)
Upload a contract's code, generating a new code id/hash pair.
<pre>
stubConnection.upload(
  code: <em>string | Uint8Array | URL | Partial&lt;CompiledCode&gt;</em>,
  options: <em>{
    reupload,
    uploadFee,
    uploadMemo,
    uploadStore,
  }</em>,
)
</pre>

## method [*stubConnection.gas*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/chain.ts#L122)
Native token of chain.
<pre>
<strong>const</strong> result: <em><a href="#">TokenAmount</a></em> = stubConnection.gas(
  amount: <em>string | number</em>,
)
</pre>
<!-- @hackbg/docs: end -->