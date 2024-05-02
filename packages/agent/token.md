# Fadroma Agent API: Native token transactions

Fadroma exposes the following API for conducting transactions
using various tokens:

* **Native tokens**: these tokens are built into the chain using the `bank` module.
  Gas is paid in native tokens.
* **Custom tokens**: these tokens are implemented using smart contracts.

<!-- @hackbg/docs: begin -->

# class *Fee*
A constructable gas fee in native tokens.

<pre>
<strong>const</strong> fee = new Fee(
  amount: <em>(string | number | bigint)</em>,
  denom: <em>string</em>,
  gas: <em>string</em>,
)
</pre>

<table><tbody>
<tr><td valign="top">
<strong>amount</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>gas</strong></td>
<td><strong>string</strong>. </td></tr></tbody></table>

## method [*fee.add*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
<pre>
<strong>const</strong> result: <em>void</em> = fee.add(
  amount: <em>(string | number | bigint)</em>,
  denom: <em>string</em>,
)
</pre>

# class *Coin*
Represents some amount of native token.

<pre>
<strong>const</strong> coin = new Coin(
  amount: <em>(string | number)</em>,
  denom: <em>string</em>,
)
</pre>

<table><tbody>
<tr><td valign="top">
<strong>amount</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>denom</strong></td>
<td><strong>string</strong>. </td></tr></tbody></table>

# class *Token*
An identifiable token on a network.

<pre>
<strong>const</strong> token = new Token()
</pre>

<table><tbody>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr></tbody></table>

## abstract method [*token.isFungible*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
Whether this token is fungible.
<pre>
token.isFungible()
</pre>

# class *Fungible*
An abstract fungible token.

<pre>
<strong>const</strong> fungible = new Fungible()
</pre>

<table><tbody>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr></tbody></table>

## method [*fungible.amount*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
<pre>
<strong>const</strong> result: <em><a href="#">TokenAmount</a></em> = fungible.amount(amount: <em>(string | number)</em>)
</pre>

## abstract method [*fungible.isCustom*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
Whether this token is implemented by a smart contract.
<pre>
fungible.isCustom()
</pre>

## method [*fungible.isFungible*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)

<pre>
<strong>const</strong> result: <em>boolean</em> = fungible.isFungible()
</pre>

## abstract method [*fungible.isNative*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
Whether this token is natively supported by the chain.
<pre>
fungible.isNative()
</pre>

## method [*fungible.addZeros*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
<pre>
<strong>const</strong> result: <em>string</em> = fungible.addZeros(
  n: <em>(string | number)</em>,
  z: <em>number</em>,
)
</pre>

# class *NonFungible*
An abstract non-fungible token.

<pre>
<strong>const</strong> nonFungible = new NonFungible()
</pre>

<table><tbody>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr></tbody></table>

## method [*nonFungible.isFungible*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)

<pre>
<strong>const</strong> result: <em>boolean</em> = nonFungible.isFungible()
</pre>

# class *Native*
The chain's natively implemented token (such as SCRT on Secret Network).

<pre>
<strong>const</strong> native = new Native(denom: <em>string</em>)
</pre>

<table><tbody>
<tr><td valign="top">
<strong>denom</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>id</strong></td>
<td></td></tr></tbody></table>

## method [*native.amount*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
<pre>
<strong>const</strong> result: <em><a href="#">TokenAmount</a></em> = native.amount(amount: <em>(string | number)</em>)
</pre>

## method [*native.fee*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
<pre>
<strong>const</strong> result: <em><a href="#">IFee</a></em> = native.fee(amount: <em>(string | number | bigint)</em>)
</pre>

## method [*native.isCustom*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)

<pre>
<strong>const</strong> result: <em>boolean</em> = native.isCustom()
</pre>

## method [*native.isFungible*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)

<pre>
<strong>const</strong> result: <em>boolean</em> = native.isFungible()
</pre>

## method [*native.isNative*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)

<pre>
<strong>const</strong> result: <em>boolean</em> = native.isNative()
</pre>

## method [*native.addZeros*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
<pre>
<strong>const</strong> result: <em>string</em> = native.addZeros(
  n: <em>(string | number)</em>,
  z: <em>number</em>,
)
</pre>

# class *Custom*
A contract-based token.

<pre>
<strong>const</strong> custom = new Custom(
  address: <em>string</em>,
  codeHash: <em>string</em>,
)
</pre>

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

## method [*custom.amount*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
<pre>
<strong>const</strong> result: <em><a href="#">TokenAmount</a></em> = custom.amount(amount: <em>(string | number)</em>)
</pre>

## method [*custom.isCustom*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)

<pre>
<strong>const</strong> result: <em>boolean</em> = custom.isCustom()
</pre>

## method [*custom.isFungible*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)

<pre>
<strong>const</strong> result: <em>boolean</em> = custom.isFungible()
</pre>

## method [*custom.isNative*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)

<pre>
<strong>const</strong> result: <em>boolean</em> = custom.isNative()
</pre>

## method [*custom.addZeros*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
<pre>
<strong>const</strong> result: <em>string</em> = custom.addZeros(
  n: <em>(string | number)</em>,
  z: <em>number</em>,
)
</pre>

# class *Pair*
A pair of tokens.

<pre>
<strong>const</strong> pair = new Pair(
  a: <em>Token</em>,
  b: <em>Token</em>,
)
</pre>

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

# class *Amount*
An amount of a fungible token.

<pre>
<strong>const</strong> amount = new Amount(
  amount: <em>(string | number | bigint)</em>,
  token: <em>FungibleToken</em>,
)
</pre>

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

## method [*amount.asCoin*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
<pre>
<strong>const</strong> result: <em><a href="#">ICoin</a></em> = amount.asCoin()
</pre>

## method [*amount.asFee*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
<pre>
<strong>const</strong> result: <em><a href="#">IFee</a></em> = amount.asFee(gas: <em>string</em>)
</pre>

## method [*amount.toString*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/token.ts)
<pre>
<strong>const</strong> result: <em>string</em> = amount.toString()
</pre>

# class *Swap*
A pair of token amounts.

<pre>
<strong>const</strong> swap = new Swap(
  a: <em>(NonFungibleToken | TokenAmount)</em>,
  b: <em>(NonFungibleToken | TokenAmount)</em>,
)
</pre>

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
<!-- @hackbg/docs: end -->
