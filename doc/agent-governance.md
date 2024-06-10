<!-- @hackbg/docs: begin -->

# class *Proposal*
<pre>
<strong>const</strong> proposal = new Proposal({
  chain,
  id,
  result,
  votes,
})
</pre>

<table><tbody>
<tr><td valign="top">
<strong>chain</strong></td>
<td><strong>Connection</strong>. </td></tr>
<tr><td valign="top">
<strong>id</strong></td>
<td><strong>bigint</strong>. </td></tr>
<tr><td valign="top">
<strong>result</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>votes</strong></td>
<td><strong>undefined</strong>. </td></tr></tbody></table>

# class *Vote*
<pre>
<strong>const</strong> vote = new Vote({
  power,
  proposal,
  value,
  voter,
})
</pre>

<table><tbody>
<tr><td valign="top">
<strong>power</strong></td>
<td><strong>bigint</strong>. </td></tr>
<tr><td valign="top">
<strong>proposal</strong></td>
<td><strong>Proposal</strong>. </td></tr>
<tr><td valign="top">
<strong>value</strong></td>
<td><strong>VoteValue</strong>. </td></tr>
<tr><td valign="top">
<strong>voter</strong></td>
<td><strong>string</strong>. </td></tr></tbody></table>
<!-- @hackbg/docs: end -->