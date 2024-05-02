### Batching transactions

The **agent.batch(...)** method creates an instance of **Batch**.

Conceptually, you can view a batch as a kind of agent that does not execute transactions
immediately - it collects them, and waits for the **batch.broadcast()** method. You can
pass a batch anywhere you can pass an agent.

The main difference between a batch and and agent is that *you cannot query from a batch*.
This is because a batch is an atomic action, and queries made inbetween individual transactions
of a batch would return the state as it was before *all* the transactions. Therefore, to avoid
confusion and outdated state, the query methods of the batch "agent" throw errors.
If you need to perform queries, use a regular agent before or after the batch.

Instead of broadcasting, you can also export an unsigned batch, and pass it around manually
as part of a multisig transaction.

To create and submit a batch in a single expression,
you can use `batch.wrap(async (batch) => { ... })`:

Examples:

```typescript
const results = await agent.batch(async batch=>{
  await batch.execute(c1, { del: { key: '1' } })
  await batch.execute(c2, { set: { key: '3', value: '4' } })
}).run()
```

## Gas fees

Transacting creates load on the network, which incurs costs on node operators.
Compensations for transactions are represented by the gas metric.

You can specify default gas limits for each method by defining the `fees: Record<string, IFee>`
property of your client class:

```typescript
const fee1 = new Fee('100000', 'uscrt')
client.fees['my_method'] = fee1

assert.deepEqual(client.getFee('my_method'), fee1)
assert.deepEqual(client.getFee({'my_method':{'parameter':'value'}}), fee1)
```

You can also specify one fee for all transactions, using `client.withFee({ gas, amount: [...] })`.
This method works by returning a copy of `client` with fees overridden by the provided value.

```typescript
const fee2 = new Fee('200000', 'uscrt')

assert.deepEqual(await client.withFee(fee2).getFee('my_method'), fee2)
```

<!-- @hackbg/docs: begin -->

# class *Transaction*
A transaction in a block on a chain.

<pre>
<strong>const</strong> transaction = new Transaction()
</pre>

<table><tbody>
<tr><td valign="top">
<strong>block</strong></td>
<td><strong>Block</strong>. </td></tr>
<tr><td valign="top">
<strong>data</strong></td>
<td><strong>unknown</strong>. </td></tr>
<tr><td valign="top">
<strong>gasLimit</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>gasUsed</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>hash</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>status</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>type</strong></td>
<td><strong>unknown</strong>. </td></tr></tbody></table>

# class *Batch*
Builder object for batched transactions.

<pre>
<strong>const</strong> batch = new Batch({
  connection,
  log,
})
</pre>

<table><tbody>
<tr><td valign="top">
<strong>connection</strong></td>
<td><strong>C</strong>. </td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr></tbody></table>

## method [*batch.execute*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/tx.ts)
Add an execute message to the batch.
<pre>
batch.execute(args: <em>Parameters&lt;&gt;</em>)
</pre>

## method [*batch.instantiate*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/tx.ts)
Add an instantiate message to the batch.
<pre>
batch.instantiate(args: <em>Parameters&lt;&gt;</em>)
</pre>

## method [*batch.submit*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/tx.ts)
Submit the batch.
<pre>
<strong>const</strong> result: <em>unknown</em> = <strong>await</strong> batch.submit(args: <em>unknown</em>)
</pre>

## method [*batch.upload*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/tx.ts)
Add an upload message to the batch.
<pre>
batch.upload(args: <em>Parameters&lt;&gt;</em>)
</pre>
<!-- @hackbg/docs: end -->
