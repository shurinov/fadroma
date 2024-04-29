<!-- @hackbg/docs: begin -->

# class *DeployStore*
A deploy store collects receipts corresponding to individual instances of Deployment,
and can create Deployment objects with the data from the receipts.

```typescript
new DeployStore()
```

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

## method [*deployStore.[iterator]*](undefined)
Returns an iterable of entries in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = deployStore.[iterator]()
</pre>

## method [*deployStore.clear*](undefined)
<pre>
<strong>const</strong> result: <em>void</em> = deployStore.clear()
</pre>

## method [*deployStore.delete*](undefined)

<pre>
<strong>const</strong> result: <em>boolean</em> = deployStore.delete(
  key,
)
</pre>

## method [*deployStore.entries*](undefined)
Returns an iterable of key, value pairs for every entry in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = deployStore.entries()
</pre>

## method [*deployStore.forEach*](undefined)
Executes a provided function once per each key/value pair in the Map, in insertion order.
<pre>
<strong>const</strong> result: <em>void</em> = deployStore.forEach(
  callbackfn,
  thisArg,
)
</pre>

## method [*deployStore.get*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/store.ts#L17)
<pre>
<strong>const</strong> result: <em>Partial&lt;&gt;</em> = deployStore.get(
  name,
)
</pre>

## method [*deployStore.has*](undefined)

<pre>
<strong>const</strong> result: <em>boolean</em> = deployStore.has(
  key,
)
</pre>

## method [*deployStore.keys*](undefined)
Returns an iterable of keys in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;string&gt;</em> = deployStore.keys()
</pre>

## method [*deployStore.set*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/store.ts#L24)
<pre>
deployStore.set(
  name,
  state,
)
</pre>

## method [*deployStore.values*](undefined)
Returns an iterable of values in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;Partial&gt;</em> = deployStore.values()
</pre>

# class *UploadStore*
```typescript
new UploadStore()
```

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

## method [*uploadStore.[iterator]*](undefined)
Returns an iterable of entries in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = uploadStore.[iterator]()
</pre>

## method [*uploadStore.clear*](undefined)
<pre>
<strong>const</strong> result: <em>void</em> = uploadStore.clear()
</pre>

## method [*uploadStore.delete*](undefined)

<pre>
<strong>const</strong> result: <em>boolean</em> = uploadStore.delete(
  key,
)
</pre>

## method [*uploadStore.entries*](undefined)
Returns an iterable of key, value pairs for every entry in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = uploadStore.entries()
</pre>

## method [*uploadStore.forEach*](undefined)
Executes a provided function once per each key/value pair in the Map, in insertion order.
<pre>
<strong>const</strong> result: <em>void</em> = uploadStore.forEach(
  callbackfn,
  thisArg,
)
</pre>

## method [*uploadStore.get*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/store.ts#L37)
<pre>
<strong>const</strong> result: <em><a href="#">UploadedCode</a></em> = uploadStore.get(
  codeHash,
)
</pre>

## method [*uploadStore.has*](undefined)

<pre>
<strong>const</strong> result: <em>boolean</em> = uploadStore.has(
  key,
)
</pre>

## method [*uploadStore.keys*](undefined)
Returns an iterable of keys in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;string&gt;</em> = uploadStore.keys()
</pre>

## method [*uploadStore.set*](https://github.com/hackbg/fadroma/blob/fd82719114381eb4818e3b70fed53c9bdc7209b6/packages/agent/store.ts#L41)
<pre>
uploadStore.set(
  codeHash,
  value: <em>Partial&lt;UploadedCode&gt;</em>,
)
</pre>

## method [*uploadStore.values*](undefined)
Returns an iterable of values in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;UploadedCode&gt;</em> = uploadStore.values()
</pre>
<!-- @hackbg/docs: end -->