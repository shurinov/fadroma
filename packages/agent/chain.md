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

## method *backend.connect*
```typescript
const result: Promise<Connection> = backend.connect(
  parameter,
)
```

## method *backend.getIdentity*
```typescript
const result: Promise<> = backend.getIdentity(
  name,
)
```

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

## method *block.getTransactionsById*
```typescript
const result: Promise<Record> = block.getTransactionsById()
```

## method *block.getTransactionsInOrder*
```typescript
const result: Promise<> = block.getTransactionsInOrder()
```

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

## method *connection.batch*
Construct a transaction batch.
```typescript
const result: Batch<Connection> = connection.batch()
```

## method *connection.doExecute*
```typescript
const result: Promise<unknown> = connection.doExecute(
  contract,
  message,
  options,
)
```

## method *connection.doGetBalance*
```typescript
const result: Promise<> = connection.doGetBalance(
  token,
  address,
)
```

## method *connection.doGetBlockInfo*
```typescript
const result: Promise<Block> = connection.doGetBlockInfo(
  height,
)
```

## method *connection.doGetCodeHashOfAddress*
```typescript
const result: Promise<string> = connection.doGetCodeHashOfAddress(
  contract,
)
```

## method *connection.doGetCodeHashOfCodeId*
```typescript
const result: Promise<string> = connection.doGetCodeHashOfCodeId(
  codeId,
)
```

## method *connection.doGetCodeId*
```typescript
const result: Promise<string> = connection.doGetCodeId(
  contract,
)
```

## method *connection.doGetCodes*
```typescript
const result: Promise<Record> = connection.doGetCodes()
```

## method *connection.doGetContractsByCodeId*
```typescript
const result: Promise<Iterable> = connection.doGetContractsByCodeId(
  id,
)
```

## method *connection.doGetHeight*
```typescript
const result: Promise<number> = connection.doGetHeight()
```

## method *connection.doInstantiate*
```typescript
const result: Promise<Partial> = connection.doInstantiate(
  codeId,
  options,
)
```

## method *connection.doQuery*
```typescript
const result: Promise<unknown> = connection.doQuery(
  contract,
  message,
)
```

## method *connection.doSend*
```typescript
const result: Promise<unknown> = connection.doSend(
  recipient,
  amounts,
  options,
)
```

## method *connection.doSendMany*
```typescript
const result: Promise<unknown> = connection.doSendMany(
  outputs,
  options,
)
```

## method *connection.doUpload*
```typescript
const result: Promise<Partial> = connection.doUpload(
  data,
  options,
)
```

## method *connection.execute*
Call a given program's transaction method.
```typescript
const result: Promise<unknown> = connection.execute(
  contract,
  message,
  options,
)
```

## method *connection.getBalanceIn*
Get the balance in a given native token, of
either this connection's identity's address,
or of another given address.
```typescript
const result: Promise<unknown> = connection.getBalanceIn(
  token,
  address,
)
```

## method *connection.getBalanceOf*
Get the balance in a native token of a given address,
either in this connection's gas token,
or in another given token.
```typescript
const result: Promise<unknown> = connection.getBalanceOf(
  address,
  token,
)
```

## method *connection.getBlock*
Get info about a specific block.
If no height is passed, gets info about the latest block.
```typescript
const result: Promise<Block> = connection.getBlock(
  height,
)
```

## method *connection.getCodeHashOfAddress*
Get the code hash of a given address.
```typescript
const result: Promise<string> = connection.getCodeHashOfAddress(
  contract,
)
```

## method *connection.getCodeHashOfCodeId*
Get the code hash of a given code id.
```typescript
const result: Promise<string> = connection.getCodeHashOfCodeId(
  contract,
)
```

## method *connection.getCodeId*
Get the code id of a given address.
```typescript
const result: Promise<string> = connection.getCodeId(
  contract,
)
```

## method *connection.getCodes*
```typescript
const result: Promise<Record> = connection.getCodes()
```

## method *connection.getContract*
Get a client handle for a specific smart contract, authenticated as as this agent.
```typescript
const result: Contract = connection.getContract(
  options,
)
```

## method *connection.getContractsByCodeId*
Get client handles for all contracts that match a code ID
```typescript
const result: Promise<Record> = connection.getContractsByCodeId(
  id,
)
```
```typescript
const result: Promise<Record> = connection.getContractsByCodeId(
  id,
  $C,
)
```

## method *connection.getContractsByCodeIds*
Get client handles for all contracts that match multiple code IDs
```typescript
const result: Promise<Record> = connection.getContractsByCodeIds(
  ids,
)
```
```typescript
const result: Promise<Record> = connection.getContractsByCodeIds(
  ids,
  $C,
)
```
```typescript
const result: Promise<Record> = connection.getContractsByCodeIds(
  ids,
)
```

## method *connection.instantiate*
Instantiate a new program from a code id, label and init message.
```typescript
const result: Promise<> = connection.instantiate(
  contract,
  options,
)
```

## method *connection.query*
Query a contract.
```typescript
const result: Promise<Q> = connection.query(
  contract,
  message,
)
```

## method *connection.send*
Send native tokens to 1 recipient.
```typescript
const result: Promise<unknown> = connection.send(
  recipient,
  amounts,
  options,
)
```

## method *connection.upload*
Upload a contract's code, generating a new code id/hash pair.
```typescript
const result: Promise<> = connection.upload(
  code,
  options,
)
```

## method *connection.gas*
Native token of chain.
```typescript
const result: TokenAmount = connection.gas(
  amount,
)
```

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

## method *contract.execute*
Execute a transaction on the specified instance as the specified Connection.
```typescript
const result: Promise<unknown> = contract.execute(
  message,
  options,
)
```

## method *contract.query*
Execute a query on the specified instance as the specified Connection.
```typescript
const result: Promise<Q> = contract.query(
  message,
)
```

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
