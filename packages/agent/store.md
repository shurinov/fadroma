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
```typescript
deployStore.[iterator]()
```

## method *deployStore.clear*
```typescript
deployStore.clear()
```

## method *deployStore.delete*

```typescript
deployStore.delete(
  key,
)
```

## method *deployStore.entries*
Returns an iterable of key, value pairs for every entry in the map.
```typescript
deployStore.entries()
```

## method *deployStore.forEach*
Executes a provided function once per each key/value pair in the Map, in insertion order.
```typescript
deployStore.forEach(
  callbackfn,
  thisArg,
)
```

## method *deployStore.get*
```typescript
deployStore.get(
  name,
)
```

## method *deployStore.has*

```typescript
deployStore.has(
  key,
)
```

## method *deployStore.keys*
Returns an iterable of keys in the map
```typescript
deployStore.keys()
```

## method *deployStore.set*
```typescript
deployStore.set(
  name,
  state,
)
```

## method *deployStore.values*
Returns an iterable of values in the map
```typescript
deployStore.values()
```

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
```typescript
uploadStore.[iterator]()
```

## method *uploadStore.clear*
```typescript
uploadStore.clear()
```

## method *uploadStore.delete*

```typescript
uploadStore.delete(
  key,
)
```

## method *uploadStore.entries*
Returns an iterable of key, value pairs for every entry in the map.
```typescript
uploadStore.entries()
```

## method *uploadStore.forEach*
Executes a provided function once per each key/value pair in the Map, in insertion order.
```typescript
uploadStore.forEach(
  callbackfn,
  thisArg,
)
```

## method *uploadStore.get*
```typescript
uploadStore.get(
  codeHash,
)
```

## method *uploadStore.has*

```typescript
uploadStore.has(
  key,
)
```

## method *uploadStore.keys*
Returns an iterable of keys in the map
```typescript
uploadStore.keys()
```

## method *uploadStore.set*
```typescript
uploadStore.set(
  codeHash,
  value,
)
```

## method *uploadStore.values*
Returns an iterable of values in the map
```typescript
uploadStore.values()
```
<!-- @hackbg/docs: end -->