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
const result: IterableIterator<> = deployStore.[iterator]()
```

## method *deployStore.clear*
```typescript
const result: void = deployStore.clear()
```

## method *deployStore.delete*

```typescript
const result: boolean = deployStore.delete(
  key,
)
```

## method *deployStore.entries*
Returns an iterable of key, value pairs for every entry in the map.
```typescript
const result: IterableIterator<> = deployStore.entries()
```

## method *deployStore.forEach*
Executes a provided function once per each key/value pair in the Map, in insertion order.
```typescript
const result: void = deployStore.forEach(
  callbackfn,
  thisArg,
)
```

## method *deployStore.get*
```typescript
const result: Partial<> = deployStore.get(
  name,
)
```

## method *deployStore.has*

```typescript
const result: boolean = deployStore.has(
  key,
)
```

## method *deployStore.keys*
Returns an iterable of keys in the map
```typescript
const result: IterableIterator<string> = deployStore.keys()
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
const result: IterableIterator<Partial> = deployStore.values()
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
const result: IterableIterator<> = uploadStore.[iterator]()
```

## method *uploadStore.clear*
```typescript
const result: void = uploadStore.clear()
```

## method *uploadStore.delete*

```typescript
const result: boolean = uploadStore.delete(
  key,
)
```

## method *uploadStore.entries*
Returns an iterable of key, value pairs for every entry in the map.
```typescript
const result: IterableIterator<> = uploadStore.entries()
```

## method *uploadStore.forEach*
Executes a provided function once per each key/value pair in the Map, in insertion order.
```typescript
const result: void = uploadStore.forEach(
  callbackfn,
  thisArg,
)
```

## method *uploadStore.get*
```typescript
const result: UploadedCode = uploadStore.get(
  codeHash,
)
```

## method *uploadStore.has*

```typescript
const result: boolean = uploadStore.has(
  key,
)
```

## method *uploadStore.keys*
Returns an iterable of keys in the map
```typescript
const result: IterableIterator<string> = uploadStore.keys()
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
const result: IterableIterator<UploadedCode> = uploadStore.values()
```
<!-- @hackbg/docs: end -->