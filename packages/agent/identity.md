
### Agent identity

The **agent.address** property is the on-chain address that uniquely identifies the agent.

The **agent.name** property is a user-friendly name for an agent. On devnet, the name is
also used to access the initial accounts that are created during devnet genesis.


## Authenticating an agent

To transact on a given chain, you need to authorize an **Agent**.
This is done using the **chain.authenticate(...)** method, which synchonously
returns a new **Agent** instance for the given chain.

Instantiating multiple agents allows the same program to interact with the chain
from multiple distinct identities.

This method may be called with one of the following signatures:

* **chain.authenticate(options)**
* **chain.authenticate(CustomAgentClass, options)**
* **chain.authenticate(CustomAgentClass)**

The returned **Agent** starts out uninitialized. Awaiting the **agent.ready** property makes sure
the agent is initialized. Usually, agents are initialized the first time you call one of the
async methods described below.

If you don't pass a mnemonic, a random mnemonic and address will be generated.

Examples:

```typescript
// TODO
```

<!-- @hackbg/docs: begin -->

# class *Identity*
A cryptographic identity.

```typescript
let identity = new Identity(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>address</strong></td>
<td><strong>string</strong>. Unique identifier.</td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>name</strong></td>
<td><strong>string</strong>. Display name.</td></tr></tbody></table>

## method *identity.sign*
```typescript
identity.sign(doc )
```<!-- @hackbg/docs: end -->
