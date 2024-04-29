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

## method *deployStore.[iterator]*
Returns an iterable of entries in the map.
<pre>
const result: <a href="https://example.com">IterableIterator<></a> = deployStore.[iterator]()
</pre>

## method *deployStore.clear*
<pre>
const result: void = deployStore.clear()
</pre>

## method *deployStore.delete*

<pre>
const result: boolean = deployStore.delete(
  key,
)
</pre>

## method *deployStore.entries*
Returns an iterable of key, value pairs for every entry in the map.
<pre>
const result: <a href="https://example.com">IterableIterator<></a> = deployStore.entries()
</pre>

## method *deployStore.forEach*
Executes a provided function once per each key/value pair in the Map, in insertion order.
<pre>
const result: void = deployStore.forEach(
  callbackfn,
  thisArg,
)
</pre>

## method *deployStore.get*
<pre>
const result: <a href="https://example.com">Partial<></a> = deployStore.get(
  name,
)
</pre>

## method *deployStore.has*

<pre>
const result: boolean = deployStore.has(
  key,
)
</pre>

## method *deployStore.keys*
Returns an iterable of keys in the map
<pre>
const result: <a href="https://example.com">IterableIterator<string></a> = deployStore.keys()
</pre>

## method *deployStore.set*
<pre>
deployStore.set(
  name,
  state,
)
</pre>

## method *deployStore.values*
Returns an iterable of values in the map
<pre>
const result: <a href="https://example.com">IterableIterator<Partial></a> = deployStore.values()
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

## method *uploadStore.[iterator]*
Returns an iterable of entries in the map.
<pre>
const result: <a href="https://example.com">IterableIterator<></a> = uploadStore.[iterator]()
</pre>

## method *uploadStore.clear*
<pre>
const result: void = uploadStore.clear()
</pre>

## method *uploadStore.delete*

<pre>
const result: boolean = uploadStore.delete(
  key,
)
</pre>

## method *uploadStore.entries*
Returns an iterable of key, value pairs for every entry in the map.
<pre>
const result: <a href="https://example.com">IterableIterator<></a> = uploadStore.entries()
</pre>

## method *uploadStore.forEach*
Executes a provided function once per each key/value pair in the Map, in insertion order.
<pre>
const result: void = uploadStore.forEach(
  callbackfn,
  thisArg,
)
</pre>

## method *uploadStore.get*
<pre>
const result: <a href="https://example.com">UploadedCode</a> = uploadStore.get(
  codeHash,
)
</pre>

## method *uploadStore.has*

<pre>
const result: boolean = uploadStore.has(
  key,
)
</pre>

## method *uploadStore.keys*
Returns an iterable of keys in the map
<pre>
const result: <a href="https://example.com">IterableIterator<string></a> = uploadStore.keys()
</pre>

## method *uploadStore.set*
<pre>
uploadStore.set(
  codeHash,
  value: Partial<UploadedCode>,
)
</pre>

## method *uploadStore.values*
Returns an iterable of values in the map
<pre>
const result: <a href="https://example.com">IterableIterator<UploadedCode></a> = uploadStore.values()
</pre>
<!-- @hackbg/docs: end -->