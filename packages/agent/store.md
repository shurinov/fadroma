<!-- @hackbg/docs: begin -->

# class *DeployStore*
A deploy store collects receipts corresponding to individual instances of Deployment,
and can create Deployment objects with the data from the receipts.

<pre>
<strong>const</strong> deployStore = new DeployStore()
</pre>

<table><tbody>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>selected</strong></td>
<td><strong>Partial</strong>. </td></tr>
<tr><td valign="top">
<strong>size</strong></td>
<td><strong>number</strong>. </td></tr>
<tr><td valign="top">
<strong>[species]</strong></td>
<td><strong>MapConstructor</strong>. </td></tr></tbody></table>

## method [*deployStore.[iterator]*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L119)
Returns an iterable of entries in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = deployStore.[iterator]()
</pre>

## method [*deployStore.clear*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L20)
<pre>
<strong>const</strong> result: <em>void</em> = deployStore.clear()
</pre>

## method [*deployStore.delete*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L24)

<pre>
<strong>const</strong> result: <em>boolean</em> = deployStore.delete(key: string)
</pre>

## method [*deployStore.entries*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L124)
Returns an iterable of key, value pairs for every entry in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = deployStore.entries()
</pre>

## method [*deployStore.forEach*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L28)
Executes a provided function once per each key/value pair in the Map, in insertion order.
<pre>
<strong>const</strong> result: <em>void</em> = deployStore.forEach(
  callbackfn: <em>???</em>,
  thisArg: <em>any</em>,
)
</pre>

## method [*deployStore.get*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/store.ts#L17)
<pre>
<strong>const</strong> result: <em>Partial&lt;&gt;</em> = deployStore.get(name: string)
</pre>

## method [*deployStore.has*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L37)

<pre>
<strong>const</strong> result: <em>boolean</em> = deployStore.has(key: string)
</pre>

## method [*deployStore.keys*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L129)
Returns an iterable of keys in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;string&gt;</em> = deployStore.keys()
</pre>

## method [*deployStore.set*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/store.ts#L24)
<pre>
deployStore.set(
  name: <em>string</em>,
  state: <em>Partial&lt;&gt; | Partial&lt;Deployment&gt;</em>,
)
</pre>

## method [*deployStore.values*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L134)
Returns an iterable of values in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;Partial&gt;</em> = deployStore.values()
</pre>

# class *UploadStore*
<pre>
<strong>const</strong> uploadStore = new UploadStore()
</pre>

<table><tbody>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>size</strong></td>
<td><strong>number</strong>. </td></tr>
<tr><td valign="top">
<strong>[species]</strong></td>
<td><strong>MapConstructor</strong>. </td></tr></tbody></table>

## method [*uploadStore.[iterator]*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L119)
Returns an iterable of entries in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = uploadStore.[iterator]()
</pre>

## method [*uploadStore.clear*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L20)
<pre>
<strong>const</strong> result: <em>void</em> = uploadStore.clear()
</pre>

## method [*uploadStore.delete*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L24)

<pre>
<strong>const</strong> result: <em>boolean</em> = uploadStore.delete(key: string)
</pre>

## method [*uploadStore.entries*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L124)
Returns an iterable of key, value pairs for every entry in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = uploadStore.entries()
</pre>

## method [*uploadStore.forEach*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L28)
Executes a provided function once per each key/value pair in the Map, in insertion order.
<pre>
<strong>const</strong> result: <em>void</em> = uploadStore.forEach(
  callbackfn: <em>???</em>,
  thisArg: <em>any</em>,
)
</pre>

## method [*uploadStore.get*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/store.ts#L37)
<pre>
<strong>const</strong> result: <em><a href="#">UploadedCode</a></em> = uploadStore.get(codeHash: string)
</pre>

## method [*uploadStore.has*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L37)

<pre>
<strong>const</strong> result: <em>boolean</em> = uploadStore.has(key: string)
</pre>

## method [*uploadStore.keys*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L129)
Returns an iterable of keys in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;string&gt;</em> = uploadStore.keys()
</pre>

## method [*uploadStore.set*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/store.ts#L41)
<pre>
uploadStore.set(
  codeHash: <em>string</em>,
  value: <em>Partial&lt;UploadedCode&gt;</em>,
)
</pre>

## method [*uploadStore.values*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L134)
Returns an iterable of values in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;UploadedCode&gt;</em> = uploadStore.values()
</pre>
<!-- @hackbg/docs: end -->