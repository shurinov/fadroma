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
const result: *Connection* = await stubBackend.connect(
  parameter,
)
</pre>

## method *stubBackend.execute*
<pre>
const result: unknown = stubBackend.execute(
  ...args,
)
</pre>

## method *stubBackend.export*
<pre>
const result: unknown = stubBackend.export(
  ...args,
)
</pre>

## method *stubBackend.getIdentity*
<pre>
const result: *Identity* = await stubBackend.getIdentity(
  name,
)
</pre>

## method *stubBackend.import*
<pre>
const result: unknown = stubBackend.import(
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
const result: *StubBackend* = await stubBackend.pause()
</pre>

## method *stubBackend.start*
<pre>
const result: *StubBackend* = await stubBackend.start()
</pre>

## method *stubBackend.upload*
<pre>
stubBackend.upload(
  codeData: Uint8Array,
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
const result: *StubBatch* = stubBatch.execute(
  ...args,
)
</pre>

## method *stubBatch.instantiate*
Add an instantiate message to the batch.
<pre>
const result: *StubBatch* = stubBatch.instantiate(
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
const result: *StubBatch* = stubBatch.upload(
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
const result: *Record<string, Transaction>* = await stubBlock.getTransactionsById()
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
const result: *CompiledCode* = await stubCompiler.build(
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
  inputs,
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
const result: *Batch<StubConnection>* = stubConnection.batch()
</pre>

## method *stubConnection.doExecute*
<pre>
const result: unknown = stubConnection.doExecute(
  contract,
  message: Message,
  options,
)
</pre>

## method *stubConnection.doGetBalance*
<pre>
const result: string = stubConnection.doGetBalance(
  token,
  address,
)
</pre>

## method *stubConnection.doGetBlockInfo*
<pre>
const result: *StubBlock* = await stubConnection.doGetBlockInfo()
</pre>

## method *stubConnection.doGetCodeHashOfAddress*
<pre>
const result: string = stubConnection.doGetCodeHashOfAddress(
  address,
)
</pre>

## method *stubConnection.doGetCodeHashOfCodeId*
<pre>
const result: string = stubConnection.doGetCodeHashOfCodeId(
  id,
)
</pre>

## method *stubConnection.doGetCodeId*
<pre>
const result: string = stubConnection.doGetCodeId(
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
const result: number = stubConnection.doGetHeight()
</pre>

## method *stubConnection.doInstantiate*
<pre>
stubConnection.doInstantiate(
  codeId,
  options: Partial<ContractInstance>,
)
</pre>

## method *stubConnection.doQuery*
<pre>
const result: *Q* = await stubConnection.doQuery(
  contract,
  message: Message,
)
</pre>

## method *stubConnection.doSend*
<pre>
const result: void = stubConnection.doSend(
  recipient,
  sums,
  opts,
)
</pre>

## method *stubConnection.doSendMany*
<pre>
const result: void = stubConnection.doSendMany(
  outputs,
  opts,
)
</pre>

## method *stubConnection.doUpload*
<pre>
const result: *UploadedCode* = await stubConnection.doUpload(
  codeData: Uint8Array,
)
</pre>

## method *stubConnection.execute*
Call a given program's transaction method.
<pre>
const result: unknown = stubConnection.execute(
  contract,
  message: Message,
  options,
)
</pre>

## method *stubConnection.getBalanceIn*
Get the balance in a given native token, of
either this connection's identity's address,
or of another given address.
<pre>
const result: unknown = stubConnection.getBalanceIn(
  token,
  address,
)
</pre>

## method *stubConnection.getBalanceOf*
Get the balance in a native token of a given address,
either in this connection's gas token,
or in another given token.
<pre>
const result: unknown = stubConnection.getBalanceOf(
  address,
  token,
)
</pre>

## method *stubConnection.getBlock*
Get info about a specific block.
If no height is passed, gets info about the latest block.
<pre>
const result: *StubBlock* = await stubConnection.getBlock(
  height,
)
</pre>

## method *stubConnection.getCodeHashOfAddress*
Get the code hash of a given address.
<pre>
const result: string = stubConnection.getCodeHashOfAddress(
  contract,
)
</pre>

## method *stubConnection.getCodeHashOfCodeId*
Get the code hash of a given code id.
<pre>
const result: string = stubConnection.getCodeHashOfCodeId(
  contract,
)
</pre>

## method *stubConnection.getCodeId*
Get the code id of a given address.
<pre>
const result: string = stubConnection.getCodeId(
  contract,
)
</pre>

## method *stubConnection.getCodes*
<pre>
const result: *Record<string, UploadedCode>* = await stubConnection.getCodes()
</pre>

## method *stubConnection.getContract*
Get a client handle for a specific smart contract, authenticated as as this agent.
<pre>
const result: *Contract* = stubConnection.getContract(
  options,
)
</pre>

## method *stubConnection.getContractsByCodeId*
Get client handles for all contracts that match a code ID
<pre>
const result: *Record<string, Contract>* = await stubConnection.getContractsByCodeId(
  id,
)
</pre>
<pre>
const result: *Record<string, InstanceType>* = await stubConnection.getContractsByCodeId(
  id,
  $C: C,
)
</pre>

## method *stubConnection.getContractsByCodeIds*
Get client handles for all contracts that match multiple code IDs
<pre>
const result: *Record<string, Record>* = await stubConnection.getContractsByCodeIds(
  ids: Iterable<string>,
)
</pre>
<pre>
const result: *Record<string, Record>* = await stubConnection.getContractsByCodeIds(
  ids: Iterable<string>,
  $C: C,
)
</pre>
<pre>
const result: *Record<string, Record>* = await stubConnection.getContractsByCodeIds(
  ids: Record<string, C>,
)
</pre>

## method *stubConnection.instantiate*
Instantiate a new program from a code id, label and init message.
<pre>
stubConnection.instantiate(
  contract,
  options: Partial<ContractInstance>,
)
</pre>

## method *stubConnection.query*
Query a contract.
<pre>
const result: *Q* = await stubConnection.query(
  contract,
  message: Message,
)
</pre>

## method *stubConnection.send*
Send native tokens to 1 recipient.
<pre>
const result: unknown = stubConnection.send(
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
const result: *TokenAmount* = stubConnection.gas(
  amount,
)
</pre>
<!-- @hackbg/docs: end -->