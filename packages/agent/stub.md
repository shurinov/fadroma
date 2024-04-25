<!-- @hackbg/docs: begin -->

# class *StubBackend*
This is the base class for any connection backend, such as:

  * Remote RPC endpoint.
  * Local devnet RPC endpoint.
  * Stub/mock implementation of chain.

You shouldn't need to instantiate this class directly.
Instead, see `Connection`, `Devnet`, and their subclasses.

```typescript
let stubBackend = new StubBackend(
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
```typescript
stubBackend.connect(parameter )
```

## method *stubBackend.execute*
```typescript
stubBackend.execute(args )
```

## method *stubBackend.export*
```typescript
stubBackend.export(args )
```

## method *stubBackend.getIdentity*
```typescript
stubBackend.getIdentity(name )
```

## method *stubBackend.import*
```typescript
stubBackend.import(args )
```

## method *stubBackend.instantiate*
```typescript
stubBackend.instantiate(creator codeId options )
```

## method *stubBackend.pause*
```typescript
stubBackend.pause()
```

## method *stubBackend.start*
```typescript
stubBackend.start()
```

## method *stubBackend.upload*
```typescript
stubBackend.upload(codeData )
```

# class *StubBatch*
Builder object for batched transactions.

```typescript
let stubBatch = new StubBatch(
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
```typescript
stubBatch.execute(args )
```

## method *stubBatch.instantiate*
```typescript
stubBatch.instantiate(args )
```

## method *stubBatch.submit*
```typescript
stubBatch.submit()
```

## method *stubBatch.upload*
```typescript
stubBatch.upload(args )
```

# class *StubBlock*
The building block of a blockchain is, well, the block.
Each block contains collection of transactions that are
appended to the blockchain at a given point in time.

```typescript
let stubBlock = new StubBlock(
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
```typescript
stubBlock.getTransactionsById()
```

## method *stubBlock.getTransactionsInOrder*
```typescript
stubBlock.getTransactionsInOrder()
```

# class *StubCompiler*
A compiler that does nothing. Used for testing.

```typescript
let stubCompiler = new StubCompiler(
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
```typescript
stubCompiler.build(source args )
```

## method *stubCompiler.buildMany*
```typescript
stubCompiler.buildMany(inputs )
```

# class *StubConnection*
This is the base class for a connection to a blockchain via a given endpoint.

Use one of its subclasses in `@fadroma/scrt`, `@fadroma/cw`, `@fadroma/namada`
to connect to the corresponding chain. Or, extend this class to implement
support for new kinds of blockchains.

```typescript
let stubConnection = new StubConnection(
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
```typescript
stubConnection.batch()
```

## method *stubConnection.doExecute*
```typescript
stubConnection.doExecute(contract message options )
```

## method *stubConnection.doGetBalance*
```typescript
stubConnection.doGetBalance(token address )
```

## method *stubConnection.doGetBlockInfo*
```typescript
stubConnection.doGetBlockInfo()
```

## method *stubConnection.doGetCodeHashOfAddress*
```typescript
stubConnection.doGetCodeHashOfAddress(address )
```

## method *stubConnection.doGetCodeHashOfCodeId*
```typescript
stubConnection.doGetCodeHashOfCodeId(id )
```

## method *stubConnection.doGetCodeId*
```typescript
stubConnection.doGetCodeId(address )
```

## method *stubConnection.doGetCodes*
```typescript
stubConnection.doGetCodes()
```

## method *stubConnection.doGetContractsByCodeId*
```typescript
stubConnection.doGetContractsByCodeId(id )
```

## method *stubConnection.doGetHeight*
```typescript
stubConnection.doGetHeight()
```

## method *stubConnection.doInstantiate*
```typescript
stubConnection.doInstantiate(codeId options )
```

## method *stubConnection.doQuery*
```typescript
stubConnection.doQuery(contract message )
```

## method *stubConnection.doSend*
```typescript
stubConnection.doSend(recipient sums opts )
```

## method *stubConnection.doSendMany*
```typescript
stubConnection.doSendMany(outputs opts )
```

## method *stubConnection.doUpload*
```typescript
stubConnection.doUpload(codeData )
```

## method *stubConnection.execute*
```typescript
stubConnection.execute(contract message options )
```

## method *stubConnection.getBalanceIn*
```typescript
stubConnection.getBalanceIn(token address )
```

## method *stubConnection.getBalanceOf*
```typescript
stubConnection.getBalanceOf(address token )
```

## method *stubConnection.getBlock*
```typescript
stubConnection.getBlock(height )
```

## method *stubConnection.getCodeHashOfAddress*
```typescript
stubConnection.getCodeHashOfAddress(contract )
```

## method *stubConnection.getCodeHashOfCodeId*
```typescript
stubConnection.getCodeHashOfCodeId(contract )
```

## method *stubConnection.getCodeId*
```typescript
stubConnection.getCodeId(contract )
```

## method *stubConnection.getCodes*
```typescript
stubConnection.getCodes()
```

## method *stubConnection.getContract*
```typescript
stubConnection.getContract(options )
```

## method *stubConnection.getContractsByCodeId*
```typescript
stubConnection.getContractsByCodeId(id )
```
```typescript
stubConnection.getContractsByCodeId(id $C )
```

## method *stubConnection.getContractsByCodeIds*
```typescript
stubConnection.getContractsByCodeIds(ids )
```
```typescript
stubConnection.getContractsByCodeIds(ids $C )
```
```typescript
stubConnection.getContractsByCodeIds(ids )
```

## method *stubConnection.instantiate*
```typescript
stubConnection.instantiate(contract options )
```

## method *stubConnection.query*
```typescript
stubConnection.query(contract message )
```

## method *stubConnection.send*
```typescript
stubConnection.send(recipient amounts options )
```

## method *stubConnection.upload*
```typescript
stubConnection.upload(code options )
```

## method *stubConnection.gas*
```typescript
stubConnection.gas(amount )
```<!-- @hackbg/docs: end -->