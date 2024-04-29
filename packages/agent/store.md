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
<strong>const</strong> result: <em><a href="#">IterableIterator&lt;&gt;</a></em> = deployStore.[iterator]()
</pre>

## method *deployStore.clear*
<pre>
<strong>const</strong> result: <em>void</em> = deployStore.clear()
</pre>

## method *deployStore.delete*

<pre>
<strong>const</strong> result: <em>boolean</em> = deployStore.delete(
  key,
)
</pre>

## method *deployStore.entries*
Returns an iterable of key, value pairs for every entry in the map.
<pre>
<strong>const</strong> result: <em><a href="#">IterableIterator&lt;&gt;</a></em> = deployStore.entries()
</pre>

## method *deployStore.forEach*
Executes a provided function once per each key/value pair in the Map, in insertion order.
<pre>
<strong>const</strong> result: <em>void</em> = deployStore.forEach(
  callbackfn,
  thisArg,
)
</pre>

## method *deployStore.get*
<pre>
<strong>const</strong> result: <em><a href="#">Partial&lt;&gt;</a></em> = deployStore.get(
  name,
)
</pre>

## method *deployStore.has*

<pre>
<strong>const</strong> result: <em>boolean</em> = deployStore.has(
  key,
)
</pre>

## method *deployStore.keys*
Returns an iterable of keys in the map
<pre>
<strong>const</strong> result: <em><a href="#">IterableIterator&lt;string&gt;</a></em> = deployStore.keys()
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
<strong>const</strong> result: <em><a href="#">IterableIterator&lt;Partial&gt;</a></em> = deployStore.values()
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
<strong>const</strong> result: <em><a href="#">IterableIterator&lt;&gt;</a></em> = uploadStore.[iterator]()
</pre>

## method *uploadStore.clear*
<pre>
<strong>const</strong> result: <em>void</em> = uploadStore.clear()
</pre>

## method *uploadStore.delete*

<pre>
<strong>const</strong> result: <em>boolean</em> = uploadStore.delete(
  key,
)
</pre>

## method *uploadStore.entries*
Returns an iterable of key, value pairs for every entry in the map.
<pre>
<strong>const</strong> result: <em><a href="#">IterableIterator&lt;&gt;</a></em> = uploadStore.entries()
</pre>

## method *uploadStore.forEach*
Executes a provided function once per each key/value pair in the Map, in insertion order.
<pre>
<strong>const</strong> result: <em>void</em> = uploadStore.forEach(
  callbackfn,
  thisArg,
)
</pre>

## method *uploadStore.get*
<pre>
<strong>const</strong> result: <em><a href="#">UploadedCode</a></em> = uploadStore.get(
  codeHash,
)
</pre>

## method *uploadStore.has*

<pre>
<strong>const</strong> result: <em>boolean</em> = uploadStore.has(
  key,
)
</pre>

## method *uploadStore.keys*
Returns an iterable of keys in the map
<pre>
<strong>const</strong> result: <em><a href="#">IterableIterator&lt;string&gt;</a></em> = uploadStore.keys()
</pre>

## method *uploadStore.set*
<pre>
uploadStore.set(
  codeHash,
  value: <em>Partial&lt;UploadedCode&gt;</em>,
)
</pre>

## method *uploadStore.values*
Returns an iterable of values in the map
<pre>
<strong>const</strong> result: <em><a href="#">IterableIterator&lt;UploadedCode&gt;</a></em> = uploadStore.values()
</pre>
<!-- @hackbg/docs: end -->