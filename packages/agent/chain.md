# Fadroma Agent API: Connecting to chains

The standard Fadroma workflow start with connecting to a chain.
For this, you need at least the URL of a RPC endpoint.

<!-- generated docs begin here -->


# class *Backend*

```typescript
new Backend(
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

```typescript
new Block(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>chain</strong></td>
<td><strong>Connection</strong>. </td></tr>
<tr><td valign="top">
<strong>hash</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>height</strong></td>
<td><strong>number</strong>. </td></tr>
<tr><td valign="top">
<strong>getTransactionsById()</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>getTransactionsInOrder()</strong></td>
<td></td></tr></tbody></table>

# class *Connection*

```typescript
new Connection(
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

Contract: interface to the API of a particular contract instance.
Has an `address` on a specific `chain`, usually also an `agent`.
Subclass this to add the contract's methods.

```typescript
new Contract(
  properties: undefined
)
```

<table><tbody>
<tr><td valign="top">
<strong>connection</strong></td>
<td><strong>Connection</strong>. </td></tr>
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

```typescript
new Endpoint(
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