
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
```typescript
const result: ICoin = amount.asCoin()
```

## method *amount.asFee*
```typescript
const result: IFee = amount.asFee(
  gas,
)
```

## method *amount.toString*
```typescript
const result: string = amount.toString()
```

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
```typescript
const result: TokenAmount = custom.amount(
  amount,
)
```

## method *custom.isCustom*

```typescript
const result: boolean = custom.isCustom()
```

## method *custom.isFungible*

```typescript
const result: boolean = custom.isFungible()
```

## method *custom.isNative*

```typescript
const result: boolean = custom.isNative()
```

## method *custom.addZeros*
```typescript
const result: string = custom.addZeros(
  n,
  z,
)
```

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
```typescript
const result: void = fee.add(
  amount,
  denom,
)
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
const result: TokenAmount = fungible.amount(
  amount,
)
```

## method *fungible.isCustom*
Whether this token is implemented by a smart contract.
```typescript
fungible.isCustom()
```

## method *fungible.isFungible*

```typescript
const result: boolean = fungible.isFungible()
```

## method *fungible.isNative*
Whether this token is natively supported by the chain.
```typescript
fungible.isNative()
```

## method *fungible.addZeros*
```typescript
const result: string = fungible.addZeros(
  n,
  z,
)
```

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
```typescript
const result: TokenAmount = native.amount(
  amount,
)
```

## method *native.fee*
```typescript
const result: IFee = native.fee(
  amount,
)
```

## method *native.isCustom*

```typescript
const result: boolean = native.isCustom()
```

## method *native.isFungible*

```typescript
const result: boolean = native.isFungible()
```

## method *native.isNative*

```typescript
const result: boolean = native.isNative()
```

## method *native.addZeros*
```typescript
const result: string = native.addZeros(
  n,
  z,
)
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
const result: boolean = nonFungible.isFungible()
```

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
```typescript
token.isFungible()
```
<!-- @hackbg/docs: end -->
