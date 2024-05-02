# Fadroma Agent API: Connecting to chains

The standard Fadroma workflow starts with connecting to a chain.

For this, you need at least the URL of a RPC endpoint. To develop
with a local blockchain node instead, see `@fadroma/devnet`.

<!-- @hackbg/docs: begin -->

# class *Endpoint*
Base class representing a remote API endpoint.

You shouldn't need to instantiate this class directly.
Instead, see `Connection` and its subclasses.

<pre>
<strong>const</strong> endpoint = new Endpoint({
  alive,
  api,
  chainId,
  log,
  url,
})
</pre>

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

# class *Backend*
Base class representing any connection backend, such as:

  * Remote RPC endpoint.
  * Local devnet RPC endpoint.
  * Stub/mock implementation of chain.

You shouldn't need to instantiate this class directly.
Instead, see `Connection`, `Devnet`, and their subclasses.

<pre>
<strong>const</strong> backend = new Backend({
  chainId,
  gasToken,
  log,
})
</pre>

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

## abstract method [*backend.connect*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
<pre>
<strong>const</strong> result: <em><a href="#">Connection</a></em> = <strong>await</strong> backend.connect(
  parameter: <em> | </em>,
)
</pre>

## abstract method [*backend.getIdentity*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
<pre>
backend.getIdentity(
  name: <em>string</em>,
)
</pre>

# class *Connection*
Base class representing a connection to a blockchain via a given endpoint.

Use one of its subclasses in `@fadroma/scrt`, `@fadroma/cw`, `@fadroma/namada`
to connect to the corresponding chain. Or, extend this class to implement
support for new kinds of blockchains.

<pre>
<strong>const</strong> connection = new Connection({
  alive,
  api,
  blockInterval,
  chainId,
  fees,
  identity,
  log,
  mode,
  url,
  gasToken,
})
</pre>

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

## method [*connection.batch*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Construct a transaction batch.
<pre>
<strong>const</strong> result: <em><a href="#">Batch&lt;Connection&gt;</a></em> = connection.batch()
</pre>

## method [*connection.execute*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Call a given program's transaction method.
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> connection.execute(
  contract: <em> | </em>,
  message: <em>Message</em>,
  options: <em>{
    execFee,
    execMemo,
    execSend,
  }</em>,
)
</pre>

## method [*connection.getBalanceIn*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Get the balance in a given native token, of
either this connection's identity's address,
or of another given address.
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> connection.getBalanceIn(
  token: <em>string</em>,
  address: <em> | </em>,
)
</pre>

## method [*connection.getBalanceOf*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Get the balance in a native token of a given address,
either in this connection's gas token,
or in another given token.
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> connection.getBalanceOf(
  address: <em> | </em>,
  token: <em>string</em>,
)
</pre>

## method [*connection.getBlock*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Get info about a specific block.
If no height is passed, gets info about the latest block.
<pre>
<strong>const</strong> result: <em><a href="#">Block</a></em> = <strong>await</strong> connection.getBlock(
  height: <em>number</em>,
)
</pre>

## method [*connection.getCodeHashOfAddress*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Get the code hash of a given address.
<pre>
<strong>const</strong> result: <em>string</em> = <strong>await</strong> connection.getCodeHashOfAddress(
  contract: <em> | </em>,
)
</pre>

## method [*connection.getCodeHashOfCodeId*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Get the code hash of a given code id.
<pre>
<strong>const</strong> result: <em>string</em> = <strong>await</strong> connection.getCodeHashOfCodeId(
  contract: <em> | </em>,
)
</pre>

## method [*connection.getCodeId*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Get the code id of a given address.
<pre>
<strong>const</strong> result: <em>string</em> = <strong>await</strong> connection.getCodeId(
  contract: <em> | </em>,
)
</pre>

## method [*connection.getCodes*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
<pre>
<strong>const</strong> result: <em>Record&lt;string, UploadedCode&gt;</em> = <strong>await</strong> connection.getCodes()
</pre>

## method [*connection.getContract*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Get a client handle for a specific smart contract, authenticated as as this agent.
<pre>
<strong>const</strong> result: <em><a href="#">Contract</a></em> = connection.getContract(
  options: <em> | </em>,
)
</pre>

## method [*connection.getContractsByCodeId*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Get client handles for all contracts that match a code ID
<pre>
<strong>const</strong> result: <em>Record&lt;string, Contract&gt;</em> = <strong>await</strong> connection.getContractsByCodeId(
  id: <em>string</em>,
)
</pre>
<pre>
<strong>const</strong> result: <em>Record&lt;string, InstanceType&gt;</em> = <strong>await</strong> connection.getContractsByCodeId(
  id: <em>string</em>,
  $C: <em>C</em>,
)
</pre>

## method [*connection.getContractsByCodeIds*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
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

## method [*connection.instantiate*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Instantiate a new program from a code id, label and init message.
<pre>
connection.instantiate(
  contract: <em> | </em>,
  options: <em>Partial&lt;ContractInstance&gt;</em>,
)
</pre>

## method [*connection.query*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Query a contract.
<pre>
<strong>const</strong> result: <em>Q</em> = <strong>await</strong> connection.query(
  contract: <em> | </em>,
  message: <em>Message</em>,
)
</pre>

## method [*connection.send*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Send native tokens to 1 recipient.
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> connection.send(
  recipient: <em> | </em>,
  amounts: <em> | </em>,
  options: <em>{
    sendFee,
    sendMemo,
  }</em>,
)
</pre>

## method [*connection.upload*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Upload a contract's code, generating a new code id/hash pair.
<pre>
connection.upload(
  code: <em> |  |  | </em>,
  options: <em>{
    reupload,
    uploadFee,
    uploadMemo,
    uploadStore,
  }</em>,
)
</pre>

## method [*connection.gas*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Native token of chain.
<pre>
<strong>const</strong> result: <em><a href="#">TokenAmount</a></em> = connection.gas(
  amount: <em> | </em>,
)
</pre>

# class *Block*
The building block of a blockchain.

Each block contains collection of transactions that are
appended to the blockchain at a given point in time.

You shouldn't have to instantiate this directly;
instead, it's returned from `connection.getBlock()`

<pre>
<strong>const</strong> block = new Block({
  chain,
  hash,
  height,
})
</pre>

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

## abstract method [*block.getTransactionsById*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
<pre>
<strong>const</strong> result: <em>Record&lt;string, Transaction&gt;</em> = <strong>await</strong> block.getTransactionsById()
</pre>

## abstract method [*block.getTransactionsInOrder*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
<pre>
<strong>const</strong> result: <em><a href="#">Transaction</a>[]</em> = <strong>await</strong> block.getTransactionsInOrder()
</pre>

# class *Contract*
Base class representing a particular instance of a smart contract.

Subclass this to add custom query and transaction methods corresponding
to the contract's API.

<pre>
<strong>const</strong> contract = new Contract(
  properties: <em> | </em>,
)
</pre>

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

## method [*contract.execute*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Execute a transaction on the specified instance as the specified Connection.
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> contract.execute(
  message: <em>Message</em>,
  options: <em>{
    execFee,
    execMemo,
    execSend,
  }</em>,
)
</pre>

## method [*contract.query*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/chain.ts)
Execute a query on the specified instance as the specified Connection.
<pre>
<strong>const</strong> result: <em>Q</em> = <strong>await</strong> contract.query(
  message: <em>Message</em>,
)
</pre>
<!-- @hackbg/docs: end -->
