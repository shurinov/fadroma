<!-- @hackbg/docs: begin -->

# class *Error*
```typescript
let error = new Error(
  message: string
)let error = new Error(
  message: string
  options: ErrorOptions
)
```

<table><tbody>
<tr><td valign="top">
<strong>cause</strong></td>
<td><strong>unknown</strong>. </td></tr>
<tr><td valign="top">
<strong>message</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>name</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>stack</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>prepareStackTrace</strong></td>
<td><strong>undefined</strong>. Optional override for formatting stack traces</td></tr>
<tr><td valign="top">
<strong>stackTraceLimit</strong></td>
<td><strong>number</strong>. </td></tr></tbody></table>

## method *error.captureStackTrace*
```typescript
error.captureStackTrace(
  targetObject,
  constructorOpt,
)
```

## method *error.define*
```typescript
error.define(
  name,
  getMessage,
  construct,
)
```
<!-- @hackbg/docs: end -->
