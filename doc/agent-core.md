<!-- @hackbg/docs: begin -->

# class *Error*
<pre>
<strong>const</strong> error = new Error(message: string)<strong>const</strong> error = new Error(
  message: <em>string</em>,
  options: <em>ErrorOptions</em>,
)
</pre>

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

## method [*error.captureStackTrace*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/@types+node@20.10.3/node_modules/@types/node/globals.d.ts#L21)
Create .stack property on a target object
<pre>
<strong>const</strong> result: <em>void</em> = error.captureStackTrace(
  targetObject: <em>object</em>,
  constructorOpt: <em>Function</em>,
)
</pre>

## method [*error.define*](https://github.com/hackbg/fadroma/tree/v2/toolbox/oops/oops.ts#L6)
Define an error subclass.
<pre>
error.define(
  name: <em>string</em>,
  getMessage: <em>string | ???</em>,
  construct: <em>???</em>,
)
</pre>
<!-- @hackbg/docs: end -->
