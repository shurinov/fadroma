
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
let amount = new Amount(
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
```typescript
amount.asCoin()
```

## method *amount.asFee*
```typescript
amount.asFee(gas )
```

## method *amount.toString*
```typescript
amount.toString()
```

# class *Coin*
Represents some amount of native token.

```typescript
let coin = new Coin(
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
let custom = new Custom(
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
```typescript
custom.amount(amount )
```

## method *custom.isCustom*
```typescript
custom.isCustom()
```

## method *custom.isFungible*
```typescript
custom.isFungible()
```

## method *custom.isNative*
```typescript
custom.isNative()
```

## method *custom.addZeros*
```typescript
custom.addZeros(n z )
```

# class *Fee*
A constructable gas fee in native tokens.

```typescript
let fee = new Fee(
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
```typescript
fee.add(amount denom )
```

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
```typescript
fungible.amount(amount )
```

## method *fungible.isCustom*
```typescript
fungible.isCustom()
```

## method *fungible.isFungible*
```typescript
fungible.isFungible()
```

## method *fungible.isNative*
```typescript
fungible.isNative()
```

## method *fungible.addZeros*
```typescript
fungible.addZeros(n z )
```

# class *Native*
The chain's natively implemented token (such as SCRT on Secret Network).

```typescript
let native = new Native(
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
```typescript
native.amount(amount )
```

## method *native.fee*
```typescript
native.fee(amount )
```

## method *native.isCustom*
```typescript
native.isCustom()
```

## method *native.isFungible*
```typescript
native.isFungible()
```

## method *native.isNative*
```typescript
native.isNative()
```

## method *native.addZeros*
```typescript
native.addZeros(n z )
```

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
```typescript
nonFungible.isFungible()
```

# class *Pair*
A pair of tokens.

```typescript
let pair = new Pair(
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
let swap = new Swap(
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
```typescript
token.isFungible()
```<!-- @hackbg/docs: end -->
