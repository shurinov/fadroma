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
const backend = new Backend(
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
<td><strong>Console</strong>. </td></tr></tbody></table>

## method [*backend.connect*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L105)
<pre>
<strong>const</strong> result: <em><a href="#">Connection</a></em> = <strong>await</strong> backend.connect(
  parameter,
)
</pre>

## method [*backend.getIdentity*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L107)
<pre>
backend.getIdentity(
  name,
)
</pre>

# class *Block*
The building block of a blockchain.
Each block contains collection of transactions that are
appended to the blockchain at a given point in time.

```typescript
const block = new Block(
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

## method [*block.getTransactionsById*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L605)
<pre>
<strong>const</strong> result: <em>Record&lt;string, Transaction&gt;</em> = <strong>await</strong> block.getTransactionsById()
</pre>

## method [*block.getTransactionsInOrder*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L608)
<pre>
block.getTransactionsInOrder()
</pre>

# class *Connection*
This is the base class for a connection to a blockchain via a given endpoint.

Use one of its subclasses in `@fadroma/scrt`, `@fadroma/cw`, `@fadroma/namada`
to connect to the corresponding chain. Or, extend this class to implement
support for new kinds of blockchains.

```typescript
const connection = new Connection(
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
<td></td></tr></tbody></table>

## method [*connection.batch*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L584)
Construct a transaction batch.
<pre>
<strong>const</strong> result: <em><a href="#">Batch&lt;Connection&gt;</a></em> = connection.batch()
</pre>

## method [*connection.doExecute*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L579)
<pre>
<strong>const</strong> result: <em>unknown</em> = connection.doExecute(
  contract,
  message: <em>Message</em>,
  options,
)
</pre>

## method [*connection.doGetBalance*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L406)
<pre>
connection.doGetBalance(
  token,
  address,
)
</pre>

## method [*connection.doGetBlockInfo*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L215)
<pre>
<strong>const</strong> result: <em><a href="#">Block</a></em> = <strong>await</strong> connection.doGetBlockInfo(
  height,
)
</pre>

## method [*connection.doGetCodeHashOfAddress*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L272)
<pre>
<strong>const</strong> result: <em>string</em> = connection.doGetCodeHashOfAddress(
  contract,
)
</pre>

## method [*connection.doGetCodeHashOfCodeId*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L256)
<pre>
<strong>const</strong> result: <em>string</em> = connection.doGetCodeHashOfCodeId(
  codeId,
)
</pre>

## method [*connection.doGetCodeId*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L240)
<pre>
<strong>const</strong> result: <em>string</em> = connection.doGetCodeId(
  contract,
)
</pre>

## method [*connection.doGetCodes*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L296)
<pre>
<strong>const</strong> result: <em>Record&lt;string, UploadedCode&gt;</em> = <strong>await</strong> connection.doGetCodes()
</pre>

## method [*connection.doGetContractsByCodeId*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L316)
<pre>
<strong>const</strong> result: <em>Iterable&lt;&gt;</em> = <strong>await</strong> connection.doGetContractsByCodeId(
  id,
)
</pre>

## method [*connection.doGetHeight*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L207)
<pre>
<strong>const</strong> result: <em>number</em> = connection.doGetHeight()
</pre>

## method [*connection.doInstantiate*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L552)
<pre>
<strong>const</strong> result: <em>Partial&lt;ContractInstance&gt;</em> = <strong>await</strong> connection.doInstantiate(
  codeId,
  options: <em>Partial&lt;ContractInstance&gt;</em>,
)
</pre>

## method [*connection.doQuery*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L422)
<pre>
<strong>const</strong> result: <em>unknown</em> = connection.doQuery(
  contract,
  message: <em>Message</em>,
)
</pre>

## method [*connection.doSend*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L450)
<pre>
<strong>const</strong> result: <em>unknown</em> = connection.doSend(
  recipient,
  amounts: <em>ICoin[]</em>,
  options,
)
</pre>

## method [*connection.doSendMany*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L454)
<pre>
<strong>const</strong> result: <em>unknown</em> = connection.doSendMany(
  outputs,
  options,
)
</pre>

## method [*connection.doUpload*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L503)
<pre>
<strong>const</strong> result: <em>Partial&lt;UploadedCode&gt;</em> = <strong>await</strong> connection.doUpload(
  data: <em>Uint8Array</em>,
  options,
)
</pre>

## method [*connection.execute*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L557)
Call a given program's transaction method.
<pre>
<strong>const</strong> result: <em>unknown</em> = connection.execute(
  contract,
  message: <em>Message</em>,
  options,
)
</pre>

## method [*connection.getBalanceIn*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L384)
Get the balance in a given native token, of
either this connection's identity's address,
or of another given address.
<pre>
<strong>const</strong> result: <em>unknown</em> = connection.getBalanceIn(
  token,
  address,
)
</pre>

## method [*connection.getBalanceOf*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L359)
Get the balance in a native token of a given address,
either in this connection's gas token,
or in another given token.
<pre>
<strong>const</strong> result: <em>unknown</em> = connection.getBalanceOf(
  address,
  token,
)
</pre>

## method [*connection.getBlock*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L219)
Get info about a specific block.
If no height is passed, gets info about the latest block.
<pre>
<strong>const</strong> result: <em><a href="#">Block</a></em> = <strong>await</strong> connection.getBlock(
  height,
)
</pre>

## method [*connection.getCodeHashOfAddress*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L261)
Get the code hash of a given address.
<pre>
<strong>const</strong> result: <em>string</em> = connection.getCodeHashOfAddress(
  contract,
)
</pre>

## method [*connection.getCodeHashOfCodeId*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L245)
Get the code hash of a given code id.
<pre>
<strong>const</strong> result: <em>string</em> = connection.getCodeHashOfCodeId(
  contract,
)
</pre>

## method [*connection.getCodeId*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L229)
Get the code id of a given address.
<pre>
<strong>const</strong> result: <em>string</em> = connection.getCodeId(
  contract,
)
</pre>

## method [*connection.getCodes*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L291)
<pre>
<strong>const</strong> result: <em>Record&lt;string, UploadedCode&gt;</em> = <strong>await</strong> connection.getCodes()
</pre>

## method [*connection.getContract*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L277)
Get a client handle for a specific smart contract, authenticated as as this agent.
<pre>
<strong>const</strong> result: <em><a href="#">Contract</a></em> = connection.getContract(
  options,
)
</pre>

## method [*connection.getContractsByCodeId*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L299)
Get client handles for all contracts that match a code ID
<pre>
<strong>const</strong> result: <em>Record&lt;string, Contract&gt;</em> = <strong>await</strong> connection.getContractsByCodeId(
  id,
)
</pre>
<pre>
<strong>const</strong> result: <em>Record&lt;string, InstanceType&gt;</em> = <strong>await</strong> connection.getContractsByCodeId(
  id,
  $C: <em>C</em>,
)
</pre>

## method [*connection.getContractsByCodeIds*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L321)
Get client handles for all contracts that match multiple code IDs
<pre>
<strong>const</strong> result: <em>Record&lt;string, Record&gt;</em> = <strong>await</strong> connection.getContractsByCodeIds(
  ids: <em>Iterable&lt;string&gt;</em>,
)
</pre>
<pre>
<strong>const</strong> result: <em>Record&lt;string, Record&gt;</em> = <strong>await</strong> connection.getContractsByCodeIds(
  ids: <em>Iterable&lt;string&gt;</em>,
  $C: <em>C</em>,
)
</pre>
<pre>
<strong>const</strong> result: <em>Record&lt;string, Record&gt;</em> = <strong>await</strong> connection.getContractsByCodeIds(
  ids: <em>Record&lt;string, C&gt;</em>,
)
</pre>

## method [*connection.instantiate*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L513)
Instantiate a new program from a code id, label and init message.
<pre>
connection.instantiate(
  contract,
  options: <em>Partial&lt;ContractInstance&gt;</em>,
)
</pre>

## method [*connection.query*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L411)
Query a contract.
<pre>
<strong>const</strong> result: <em>Q</em> = <strong>await</strong> connection.query(
  contract,
  message: <em>Message</em>,
)
</pre>

## method [*connection.send*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L427)
Send native tokens to 1 recipient.
<pre>
<strong>const</strong> result: <em>unknown</em> = connection.send(
  recipient,
  amounts,
  options,
)
</pre>

## method [*connection.upload*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L459)
Upload a contract's code, generating a new code id/hash pair.
<pre>
connection.upload(
  code,
  options,
)
</pre>

## method [*connection.gas*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L119)
Native token of chain.
<pre>
<strong>const</strong> result: <em><a href="#">TokenAmount</a></em> = connection.gas(
  amount,
)
</pre>

# class *Contract*
Base class representing the API of a particular instance of a smart contract.
Subclass this to add custom query and transaction methods.

```typescript
const contract = new Contract(
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
<td><strong>Console</strong>. </td></tr></tbody></table>

## method [*contract.execute*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L646)
Execute a transaction on the specified instance as the specified Connection.
<pre>
<strong>const</strong> result: <em>unknown</em> = contract.execute(
  message: <em>Message</em>,
  options,
)
</pre>

## method [*contract.query*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/chain.ts#L633)
Execute a query on the specified instance as the specified Connection.
<pre>
<strong>const</strong> result: <em>Q</em> = <strong>await</strong> contract.query(
  message: <em>Message</em>,
)
</pre>

# class *Endpoint*
This is the base class for a remote endpoint.

You shouldn't need to instantiate this class directly.
Instead, see `Connection` and its subclasses.

```typescript
const endpoint = new Endpoint(
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
this property contains the URL to which requests are sent.</td></tr></tbody></table>
<!-- @hackbg/docs: end -->
