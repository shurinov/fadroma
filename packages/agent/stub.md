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

## method *stubBackend.connect*
<pre>
<strong>const</strong> result: <em><a href="#">Connection</a></em> = <strong>await</strong> stubBackend.connect(
  parameter,
)
</pre>

## method *stubBackend.execute*
<pre>
<strong>const</strong> result: <em>unknown</em> = stubBackend.execute(
  ...args,
)
</pre>

## method *stubBackend.export*
<pre>
<strong>const</strong> result: <em>unknown</em> = stubBackend.export(
  ...args,
)
</pre>

## method *stubBackend.getIdentity*
<pre>
<strong>const</strong> result: <em><a href="#">Identity</a></em> = <strong>await</strong> stubBackend.getIdentity(
  name,
)
</pre>

## method *stubBackend.import*
<pre>
<strong>const</strong> result: <em>unknown</em> = stubBackend.import(
  ...args,
)
</pre>

## method *stubBackend.instantiate*
<pre>
stubBackend.instantiate(
  creator,
  codeId,
  options,
)
</pre>

## method *stubBackend.pause*
<pre>
<strong>const</strong> result: <em><a href="#">StubBackend</a></em> = <strong>await</strong> stubBackend.pause()
</pre>

## method *stubBackend.start*
<pre>
<strong>const</strong> result: <em><a href="#">StubBackend</a></em> = <strong>await</strong> stubBackend.start()
</pre>

## method *stubBackend.upload*
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

## method *stubBatch.execute*
Add an execute message to the batch.
<pre>
<strong>const</strong> result: <em><a href="#">StubBatch</a></em> = stubBatch.execute(
  ...args,
)
</pre>

## method *stubBatch.instantiate*
Add an instantiate message to the batch.
<pre>
<strong>const</strong> result: <em><a href="#">StubBatch</a></em> = stubBatch.instantiate(
  ...args,
)
</pre>

## method *stubBatch.submit*
Submit the batch.
<pre>
stubBatch.submit()
</pre>

## method *stubBatch.upload*
Add an upload message to the batch.
<pre>
<strong>const</strong> result: <em><a href="#">StubBatch</a></em> = stubBatch.upload(
  ...args,
)
</pre>

# class *StubBlock*
The building block of a blockchain is, well, the block.
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

## method *stubBlock.getTransactionsById*
<pre>
<strong>const</strong> result: <em>Record&lt;string, Transaction&gt;</em> = <strong>await</strong> stubBlock.getTransactionsById()
</pre>

## method *stubBlock.getTransactionsInOrder*
<pre>
stubBlock.getTransactionsInOrder()
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

## method *stubCompiler.build*
Compile a source.
`@hackbg/fadroma` implements dockerized and non-dockerized
variants using its `build.impl.mjs` script.
<pre>
<strong>const</strong> result: <em><a href="#">CompiledCode</a></em> = <strong>await</strong> stubCompiler.build(
  source,
  ...args,
)
</pre>

## method *stubCompiler.buildMany*
Build multiple sources.
Default implementation of buildMany is sequential.
Compiler classes may override this to optimize.
<pre>
stubCompiler.buildMany(
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

## method *stubConnection.batch*
Construct a transaction batch.
<pre>
<strong>const</strong> result: <em><a href="#">Batch&lt;StubConnection&gt;</a></em> = stubConnection.batch()
</pre>

## method *stubConnection.doExecute*
<pre>
<strong>const</strong> result: <em>unknown</em> = stubConnection.doExecute(
  contract,
  message: <em>Message</em>,
  options,
)
</pre>

## method *stubConnection.doGetBalance*
<pre>
<strong>const</strong> result: <em>string</em> = stubConnection.doGetBalance(
  token,
  address,
)
</pre>

## method *stubConnection.doGetBlockInfo*
<pre>
<strong>const</strong> result: <em><a href="#">StubBlock</a></em> = <strong>await</strong> stubConnection.doGetBlockInfo()
</pre>

## method *stubConnection.doGetCodeHashOfAddress*
<pre>
<strong>const</strong> result: <em>string</em> = stubConnection.doGetCodeHashOfAddress(
  address,
)
</pre>

## method *stubConnection.doGetCodeHashOfCodeId*
<pre>
<strong>const</strong> result: <em>string</em> = stubConnection.doGetCodeHashOfCodeId(
  id,
)
</pre>

## method *stubConnection.doGetCodeId*
<pre>
<strong>const</strong> result: <em>string</em> = stubConnection.doGetCodeId(
  address,
)
</pre>

## method *stubConnection.doGetCodes*
<pre>
stubConnection.doGetCodes()
</pre>

## method *stubConnection.doGetContractsByCodeId*
<pre>
stubConnection.doGetContractsByCodeId(
  id,
)
</pre>

## method *stubConnection.doGetHeight*
<pre>
<strong>const</strong> result: <em>number</em> = stubConnection.doGetHeight()
</pre>

## method *stubConnection.doInstantiate*
<pre>
stubConnection.doInstantiate(
  codeId,
  options: <em>Partial&lt;ContractInstance&gt;</em>,
)
</pre>

## method *stubConnection.doQuery*
<pre>
<strong>const</strong> result: <em>Q</em> = <strong>await</strong> stubConnection.doQuery(
  contract,
  message: <em>Message</em>,
)
</pre>

## method *stubConnection.doSend*
<pre>
<strong>const</strong> result: <em>void</em> = stubConnection.doSend(
  recipient,
  sums: <em>ICoin[]</em>,
  opts,
)
</pre>

## method *stubConnection.doSendMany*
<pre>
<strong>const</strong> result: <em>void</em> = stubConnection.doSendMany(
  outputs,
  opts,
)
</pre>

## method *stubConnection.doUpload*
<pre>
<strong>const</strong> result: <em><a href="#">UploadedCode</a></em> = <strong>await</strong> stubConnection.doUpload(
  codeData: <em>Uint8Array</em>,
)
</pre>

## method *stubConnection.execute*
Call a given program's transaction method.
<pre>
<strong>const</strong> result: <em>unknown</em> = stubConnection.execute(
  contract,
  message: <em>Message</em>,
  options,
)
</pre>

## method *stubConnection.getBalanceIn*
Get the balance in a given native token, of
either this connection's identity's address,
or of another given address.
<pre>
<strong>const</strong> result: <em>unknown</em> = stubConnection.getBalanceIn(
  token,
  address,
)
</pre>

## method *stubConnection.getBalanceOf*
Get the balance in a native token of a given address,
either in this connection's gas token,
or in another given token.
<pre>
<strong>const</strong> result: <em>unknown</em> = stubConnection.getBalanceOf(
  address,
  token,
)
</pre>

## method *stubConnection.getBlock*
Get info about a specific block.
If no height is passed, gets info about the latest block.
<pre>
<strong>const</strong> result: <em><a href="#">StubBlock</a></em> = <strong>await</strong> stubConnection.getBlock(
  height,
)
</pre>

## method *stubConnection.getCodeHashOfAddress*
Get the code hash of a given address.
<pre>
<strong>const</strong> result: <em>string</em> = stubConnection.getCodeHashOfAddress(
  contract,
)
</pre>

## method *stubConnection.getCodeHashOfCodeId*
Get the code hash of a given code id.
<pre>
<strong>const</strong> result: <em>string</em> = stubConnection.getCodeHashOfCodeId(
  contract,
)
</pre>

## method *stubConnection.getCodeId*
Get the code id of a given address.
<pre>
<strong>const</strong> result: <em>string</em> = stubConnection.getCodeId(
  contract,
)
</pre>

## method *stubConnection.getCodes*
<pre>
<strong>const</strong> result: <em>Record&lt;string, UploadedCode&gt;</em> = <strong>await</strong> stubConnection.getCodes()
</pre>

## method *stubConnection.getContract*
Get a client handle for a specific smart contract, authenticated as as this agent.
<pre>
<strong>const</strong> result: <em><a href="#">Contract</a></em> = stubConnection.getContract(
  options,
)
</pre>

## method *stubConnection.getContractsByCodeId*
Get client handles for all contracts that match a code ID
<pre>
<strong>const</strong> result: <em>Record&lt;string, Contract&gt;</em> = <strong>await</strong> stubConnection.getContractsByCodeId(
  id,
)
</pre>
<pre>
<strong>const</strong> result: <em>Record&lt;string, InstanceType&gt;</em> = <strong>await</strong> stubConnection.getContractsByCodeId(
  id,
  $C: <em>C</em>,
)
</pre>

## method *stubConnection.getContractsByCodeIds*
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

## method *stubConnection.instantiate*
Instantiate a new program from a code id, label and init message.
<pre>
stubConnection.instantiate(
  contract,
  options: <em>Partial&lt;ContractInstance&gt;</em>,
)
</pre>

## method *stubConnection.query*
Query a contract.
<pre>
<strong>const</strong> result: <em>Q</em> = <strong>await</strong> stubConnection.query(
  contract,
  message: <em>Message</em>,
)
</pre>

## method *stubConnection.send*
Send native tokens to 1 recipient.
<pre>
<strong>const</strong> result: <em>unknown</em> = stubConnection.send(
  recipient,
  amounts,
  options,
)
</pre>

## method *stubConnection.upload*
Upload a contract's code, generating a new code id/hash pair.
<pre>
stubConnection.upload(
  code,
  options,
)
</pre>

## method *stubConnection.gas*
Native token of chain.
<pre>
<strong>const</strong> result: <em><a href="#">TokenAmount</a></em> = stubConnection.gas(
  amount,
)
</pre>
<!-- @hackbg/docs: end -->