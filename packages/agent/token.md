# Fadroma Agent API: Native token transactions

Fadroma exposes the following API for conducting transactions
using various tokens:

* **Native tokens**: these tokens are built into the chain using the `bank` module.
  Gas is paid in native tokens.
* **Custom tokens**: these tokens are implemented using smart contracts.

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

## method [*amount.asCoin*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L115)
<pre>
<strong>const</strong> result: <em><a href="#">ICoin</a></em> = amount.asCoin()
</pre>

## method [*amount.asFee*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L122)
<pre>
<strong>const</strong> result: <em><a href="#">IFee</a></em> = amount.asFee(
  gas: <em>string</em>,
)
</pre>

## method [*amount.toString*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L111)
<pre>
<strong>const</strong> result: <em>string</em> = amount.toString()
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

## method [*custom.amount*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L84)
<pre>
<strong>const</strong> result: <em><a href="#">TokenAmount</a></em> = custom.amount(
  amount: <em>string | number</em>,
)
</pre>

## method [*custom.isCustom*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L151)

<pre>
<strong>const</strong> result: <em>boolean</em> = custom.isCustom()
</pre>

## method [*custom.isFungible*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L74)

<pre>
<strong>const</strong> result: <em>boolean</em> = custom.isFungible()
</pre>

## method [*custom.isNative*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L153)

<pre>
<strong>const</strong> result: <em>boolean</em> = custom.isNative()
</pre>

## method [*custom.addZeros*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L80)
<pre>
<strong>const</strong> result: <em>string</em> = custom.addZeros(
  n: <em>string | number</em>,
  z: <em>number</em>,
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

## method [*fee.add*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L32)
<pre>
<strong>const</strong> result: <em>void</em> = fee.add(
  amount: <em>string | number | bigint</em>,
  denom: <em>string</em>,
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

## method [*fungible.amount*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L84)
<pre>
<strong>const</strong> result: <em><a href="#">TokenAmount</a></em> = fungible.amount(
  amount: <em>string | number</em>,
)
</pre>

## abstract method [*fungible.isCustom*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L78)
Whether this token is implemented by a smart contract.
<pre>
fungible.isCustom()
</pre>

## method [*fungible.isFungible*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L74)

<pre>
<strong>const</strong> result: <em>boolean</em> = fungible.isFungible()
</pre>

## abstract method [*fungible.isNative*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L76)
Whether this token is natively supported by the chain.
<pre>
fungible.isNative()
</pre>

## method [*fungible.addZeros*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L80)
<pre>
<strong>const</strong> result: <em>string</em> = fungible.addZeros(
  n: <em>string | number</em>,
  z: <em>number</em>,
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

## method [*native.amount*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L84)
<pre>
<strong>const</strong> result: <em><a href="#">TokenAmount</a></em> = native.amount(
  amount: <em>string | number</em>,
)
</pre>

## method [*native.fee*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L140)
<pre>
<strong>const</strong> result: <em><a href="#">IFee</a></em> = native.fee(
  amount: <em>string | number | bigint</em>,
)
</pre>

## method [*native.isCustom*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L136)

<pre>
<strong>const</strong> result: <em>boolean</em> = native.isCustom()
</pre>

## method [*native.isFungible*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L74)

<pre>
<strong>const</strong> result: <em>boolean</em> = native.isFungible()
</pre>

## method [*native.isNative*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L138)

<pre>
<strong>const</strong> result: <em>boolean</em> = native.isNative()
</pre>

## method [*native.addZeros*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L80)
<pre>
<strong>const</strong> result: <em>string</em> = native.addZeros(
  n: <em>string | number</em>,
  z: <em>number</em>,
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

## method [*nonFungible.isFungible*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L68)

<pre>
<strong>const</strong> result: <em>boolean</em> = nonFungible.isFungible()
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

## abstract method [*token.isFungible*](https://github.com/hackbg/fadroma/blob/a228431ac8a4c97662d93a7420d030936fdc22f5/packages/agent/token.ts#L62)
Whether this token is fungible.
<pre>
token.isFungible()
</pre>
<!-- @hackbg/docs: end -->
