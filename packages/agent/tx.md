

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