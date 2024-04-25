# Fadroma Agent API: Connecting to chains

The standard Fadroma workflow starts with connecting to a chain.

For this, you need at least the URL of a RPC endpoint. To develop
with a local blockchain node instead, see `@fadroma/devnet`.

<!-- @hackbg/docs: begin -->

# class *Backend*
This is the base class for any connection backend, such as:

  * Remote RPC endpoint.
  * Local devnet RPC endpoint.
  * Stub/mock implementation of chain.

You shouldn't need to instantiate this class directly.
Instead, see `Connection`, `Devnet`, and their subclasses.

```typescript
let backend = new Backend(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>chainId</strong></td>
<td><strong>string</strong>. The chain ID that will be passed to the devnet node.</td></tr>
<tr><td valign="top">
<strong>gasToken</strong></td>
<td><strong>NativeToken</strong>. Denomination of base gas token for this chain.</td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<br><strong>connect(parameter )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>getIdentity(name )</strong></td>
<td></td></tr></tbody></table>

# class *Block*
The building block of a blockchain is, well, the block.
Each block contains collection of transactions that are
appended to the blockchain at a given point in time.

```typescript
let block = new Block(
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
<td><strong>number</strong>. Monotonically incrementing ID of block.</td></tr>
<tr><td valign="top">
<strong>getTransactionsById()</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>getTransactionsInOrder()</strong></td>
<td></td></tr></tbody></table>

# class *Connection*
This is the base class for a connection to a blockchain via a given endpoint.

Use one of its subclasses in `@fadroma/scrt`, `@fadroma/cw`, `@fadroma/namada`
to connect to the corresponding chain. Or, extend this class to implement
support for new kinds of blockchains.

```typescript
let connection = new Connection(
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
<td></td></tr>
<tr><td valign="top">
<strong>batch()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doExecute(contract message options )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doGetBalance(token address )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doGetBlockInfo(height )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doGetCodeHashOfAddress(contract )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doGetCodeHashOfCodeId(codeId )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doGetCodeId(contract )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>doGetCodes()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doGetContractsByCodeId(id )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>doGetHeight()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doInstantiate(codeId options )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doQuery(contract message )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doSend(recipient amounts options )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doSendMany(outputs options )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>doUpload(data options )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>execute(contract message options )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>getBalanceIn(token address )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>getBalanceOf(address token )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>getBlock(height )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>getCodeHashOfAddress(contract )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>getCodeHashOfCodeId(contract )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>getCodeId(contract )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>getCodes()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>getContract(options )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>getContractsByCodeId(id )</strong>
<br><strong>getContractsByCodeId(id $C )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>getContractsByCodeIds(ids )</strong>
<br><strong>getContractsByCodeIds(ids $C )</strong>
<br><strong>getContractsByCodeIds(ids )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>instantiate(contract options )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>query(contract message )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>send(recipient amounts options )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>upload(code options )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>gas(amount )</strong></td>
<td></td></tr></tbody></table>

# class *Contract*
Base class representing the API of a particular instance of a smart contract.
Subclass this to add custom query and transaction methods.

```typescript
let contract = new Contract(
  properties: undefined
)
```

<table><tbody>
<tr><td valign="top">
<strong>connection</strong></td>
<td><strong>Connection</strong>. Connection to the chain on which this contract is deployed.</td></tr>
<tr><td valign="top">
<strong>instance</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<br><strong>execute(message options )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>query(message )</strong></td>
<td></td></tr></tbody></table>

# class *Endpoint*
This is the base class for a remote endpoint.

You shouldn't need to instantiate this class directly.
Instead, see `Connection` and its subclasses.

```typescript
let endpoint = new Endpoint(
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
<strong>chainId</strong></td>
<td><strong>string</strong>. Chain ID. This is a string that uniquely identifies a chain.
A project's mainnet and testnet have different chain IDs.</td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>url</strong></td>
<td><strong>string</strong>. Connection URL.

The same chain may be accessible via different endpoints, so
this property contains the URL to which requests are sent.</td></tr></tbody></table><!-- @hackbg/docs: end -->
