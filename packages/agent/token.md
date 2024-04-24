
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

# class *Amount*

An amount of a fungible token.

```typescript
new Amount(
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
<td></td></tr>
<tr><td valign="top">
<strong>asCoin()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>asFee(gas )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>toString()</strong></td>
<td></td></tr></tbody></table>

# class *Coin*

Represents some amount of native token.

```typescript
new Coin(
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
new Custom(
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
<td></td></tr>
<tr><td valign="top">
<br><strong>amount(amount )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>isCustom()</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>isFungible()</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>isNative()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>addZeros(n z )</strong></td>
<td></td></tr></tbody></table>

# class *Fee*

A constructable gas fee in native tokens.

```typescript
new Fee(
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
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<br><strong>add(amount denom )</strong></td>
<td></td></tr></tbody></table>

# class *Fungible*

An abstract fungible token.

```typescript
new Fungible()
```

<table><tbody>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>amount(amount )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>isCustom()</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>isFungible()</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>isNative()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>addZeros(n z )</strong></td>
<td></td></tr></tbody></table>

# class *Native*

The chain's natively implemented token (such as SCRT on Secret Network).

```typescript
new Native(
  denom: string
)
```

<table><tbody>
<tr><td valign="top">
<strong>denom</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>amount(amount )</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>fee(amount )</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>isCustom()</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>isFungible()</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>isNative()</strong></td>
<td></td></tr>
<tr><td valign="top">
<br><strong>addZeros(n z )</strong></td>
<td></td></tr></tbody></table>

# class *NonFungible*

An abstract non-fungible token.

```typescript
new NonFungible()
```

<table><tbody>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>isFungible()</strong></td>
<td></td></tr></tbody></table>

# class *Pair*

A pair of tokens.

```typescript
new Pair(
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
new Swap(
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
<td></td></tr>
<tr><td valign="top">
<strong>isFungible()</strong></td>
<td></td></tr></tbody></table>
