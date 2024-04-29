
### Native tokens

The **Chain.defaultDenom** and **chain.defaultDenom** properties contain the default
denomination of the chain's native token.

The **chain.getBalance(denom, address)** async method queries the balance of a given
address in a given token.

Examples:

```typescript
// TODO
```

### Native token transactions

The **agent.getBalance(denom, address)** async method works the same as **chain.getBalance(...)**
but defaults to the agent's address.

The **agent.balance** readonly property is a shorthand for querying the current agent's balance
in the chain's main native token.

The **agent.send(address, amounts, options)** async method sends one or more amounts of
native tokens to the specified address.

The **agent.sendMany([[address, coin], [address, coin]...])** async method sends native tokens
to multiple addresses.

Examples:

```typescript
await agent.balance // In the default native token

await agent.getBalance() // In the default native token

await agent.getBalance('token') // In a non-default native token

await agent.send('recipient-address', 1000)

await agent.send('recipient-address', '1000')

await agent.send('recipient-address', [
  {denom:'token1', amount: '1000'}
  {denom:'token2', amount: '2000'}
])
```

<!-- @hackbg/docs: begin -->

# class *Amount*
An amount of a fungible token.

```typescript
const amount = new Amount(
  amount: undefined
  token: FungibleToken
)
```

<table><tbody>
<tr><td valign="top">
<strong>amount</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>token</strong></td>
<td><strong>FungibleToken</strong>. </td></tr>
<tr><td valign="top">
<strong>asNativeBalance</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>denom</strong></td>
<td></td></tr></tbody></table>

## method *amount.asCoin*
<pre>
const result: [ICoin](https://example.com) = amount.asCoin()
</pre>

## method *amount.asFee*
<pre>
const result: [IFee](https://example.com) = amount.asFee(
  gas,
)
</pre>

## method *amount.toString*
<pre>
const result: string = amount.toString()
</pre>

# class *Coin*
Represents some amount of native token.

```typescript
const coin = new Coin(
  amount: undefined
  denom: string
)
```

<table><tbody>
<tr><td valign="top">
<strong>amount</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>denom</strong></td>
<td><strong>string</strong>. </td></tr></tbody></table>

# class *Custom*
A contract-based token.

```typescript
const custom = new Custom(
  address: string
  codeHash: string
)
```

<table><tbody>
<tr><td valign="top">
<strong>address</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>codeHash</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr></tbody></table>

## method *custom.amount*
<pre>
const result: [TokenAmount](https://example.com) = custom.amount(
  amount,
)
</pre>

## method *custom.isCustom*

<pre>
const result: boolean = custom.isCustom()
</pre>

## method *custom.isFungible*

<pre>
const result: boolean = custom.isFungible()
</pre>

## method *custom.isNative*

<pre>
const result: boolean = custom.isNative()
</pre>

## method *custom.addZeros*
<pre>
const result: string = custom.addZeros(
  n,
  z,
)
</pre>

# class *Fee*
A constructable gas fee in native tokens.

```typescript
const fee = new Fee(
  amount: undefined
  denom: string
  gas: string
)
```

<table><tbody>
<tr><td valign="top">
<strong>amount</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>gas</strong></td>
<td><strong>string</strong>. </td></tr></tbody></table>

## method *fee.add*
<pre>
const result: void = fee.add(
  amount,
  denom,
)
</pre>

# class *Fungible*
An abstract fungible token.

```typescript
new Fungible()
```

<table><tbody>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr></tbody></table>

## method *fungible.amount*
<pre>
const result: [TokenAmount](https://example.com) = fungible.amount(
  amount,
)
</pre>

## method *fungible.isCustom*
Whether this token is implemented by a smart contract.
<pre>
fungible.isCustom()
</pre>

## method *fungible.isFungible*

<pre>
const result: boolean = fungible.isFungible()
</pre>

## method *fungible.isNative*
Whether this token is natively supported by the chain.
<pre>
fungible.isNative()
</pre>

## method *fungible.addZeros*
<pre>
const result: string = fungible.addZeros(
  n,
  z,
)
</pre>

# class *Native*
The chain's natively implemented token (such as SCRT on Secret Network).

```typescript
const native = new Native(
  denom: string
)
```

<table><tbody>
<tr><td valign="top">
<strong>denom</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr></tbody></table>

## method *native.amount*
<pre>
const result: [TokenAmount](https://example.com) = native.amount(
  amount,
)
</pre>

## method *native.fee*
<pre>
const result: [IFee](https://example.com) = native.fee(
  amount,
)
</pre>

## method *native.isCustom*

<pre>
const result: boolean = native.isCustom()
</pre>

## method *native.isFungible*

<pre>
const result: boolean = native.isFungible()
</pre>

## method *native.isNative*

<pre>
const result: boolean = native.isNative()
</pre>

## method *native.addZeros*
<pre>
const result: string = native.addZeros(
  n,
  z,
)
</pre>

# class *NonFungible*
An abstract non-fungible token.

```typescript
new NonFungible()
```

<table><tbody>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr></tbody></table>

## method *nonFungible.isFungible*

<pre>
const result: boolean = nonFungible.isFungible()
</pre>

# class *Pair*
A pair of tokens.

```typescript
const pair = new Pair(
  a: Token
  b: Token
)
```

<table><tbody>
<tr><td valign="top">
<strong>a</strong></td>
<td><strong>Token</strong>. </td></tr>
<tr><td valign="top">
<strong>b</strong></td>
<td><strong>Token</strong>. </td></tr>
<tr><td valign="top">
<strong>reverse</strong></td>
<td></td></tr></tbody></table>

# class *Swap*
A pair of token amounts.

```typescript
const swap = new Swap(
  a: undefined
  b: undefined
)
```

<table><tbody>
<tr><td valign="top">
<strong>a</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>b</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>reverse</strong></td>
<td></td></tr></tbody></table>

# class *Token*
An identifiable token on a network.

```typescript
new Token()
```

<table><tbody>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr></tbody></table>

## method *token.isFungible*
Whether this token is fungible.
<pre>
token.isFungible()
</pre>
<!-- @hackbg/docs: end -->
