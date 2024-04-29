# Fadroma Agent API: Deploying contracts

<!-- @hackbg/docs: begin -->

# class *ContractCode*
```typescript
const contractCode = new ContractCode(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>compiled</strong></td>
<td><strong>CompiledCode</strong>. </td></tr>
<tr><td valign="top">
<strong>compiler</strong></td>
<td><strong>Compiler</strong>. </td></tr>
<tr><td valign="top">
<strong>deployer</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>source</strong></td>
<td><strong>SourceCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploaded</strong></td>
<td><strong>UploadedCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploader</strong></td>
<td><strong>undefined</strong>. </td></tr></tbody></table>

## method [*contractCode.compile*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L36)
Compile this contract, unless a valid binary is present and a rebuild is not requested.
<pre>
contractCode.compile(
  <em>{
    compiler,
    rebuild,
  }</em>,
)
</pre>

## method [*contractCode.upload*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L68)
Upload this contract, unless a valid upload is present and a rebuild is not requested.
<pre>
contractCode.upload(
  <em>{
    compiler,
    rebuild,
  } & {
    reupload,
    uploadFee,
    uploadMemo,
    uploadStore,
  } & {
    reupload,
    uploader,
  }</em>,
)
</pre>

# class *ContractInstance*
A contract that is part of a deploment.
- needed for deployment-wide deduplication
- generates structured label

```typescript
const contractInstance = new ContractInstance(
  properties: undefined
)
```

<table><tbody>
<tr><td valign="top">
<strong>address</strong></td>
<td><strong>string</strong>. Address of this contract instance. Unique per chain.</td></tr>
<tr><td valign="top">
<strong>chainId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>codeHash</strong></td>
<td><strong>string</strong>. Code hash uniquely identifying the compiled code.</td></tr>
<tr><td valign="top">
<strong>codeId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>compiled</strong></td>
<td><strong>CompiledCode</strong>. </td></tr>
<tr><td valign="top">
<strong>compiler</strong></td>
<td><strong>Compiler</strong>. </td></tr>
<tr><td valign="top">
<strong>deployer</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>deployment</strong></td>
<td><strong>Deployment</strong>. Deployment to which this unit belongs.</td></tr>
<tr><td valign="top">
<strong>initBy</strong></td>
<td><strong>undefined</strong>. Address of agent that performed the init tx.</td></tr>
<tr><td valign="top">
<strong>initFee</strong></td>
<td><strong>unknown</strong>. Fee to use for init.</td></tr>
<tr><td valign="top">
<strong>initGas</strong></td>
<td><strong>unknown</strong>. Contents of init message.</td></tr>
<tr><td valign="top">
<strong>initMemo</strong></td>
<td><strong>string</strong>. Instantiation memo.</td></tr>
<tr><td valign="top">
<strong>initMsg</strong></td>
<td><strong>Into</strong>. Contents of init message.</td></tr>
<tr><td valign="top">
<strong>initSend</strong></td>
<td><strong>undefined</strong>. Native tokens to send to the new contract.</td></tr>
<tr><td valign="top">
<strong>initTx</strong></td>
<td><strong>string</strong>. ID of transaction that performed the init.</td></tr>
<tr><td valign="top">
<strong>isTemplate</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>label</strong></td>
<td><strong>string</strong>. Full label of the instance. Unique for a given chain.</td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>name</strong></td>
<td><strong>string</strong>. Name of this unit.</td></tr>
<tr><td valign="top">
<strong>source</strong></td>
<td><strong>SourceCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploaded</strong></td>
<td><strong>UploadedCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploader</strong></td>
<td><strong>undefined</strong>. </td></tr></tbody></table>

## method [*contractInstance.compile*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L36)
Compile this contract, unless a valid binary is present and a rebuild is not requested.
<pre>
contractInstance.compile(
  <em>{
    compiler,
    rebuild,
  }</em>,
)
</pre>

## method [*contractInstance.connect*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L274)
Returns a client to this contract instance.
<pre>
<strong>const</strong> result: <em><a href="#">Contract</a></em> = contractInstance.connect(
  agent: <em>Connection</em>,
)
</pre>

## method [*contractInstance.deploy*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L235)
<pre>
contractInstance.deploy(
  <em>{
    compiler,
    rebuild,
  } & {
    reupload,
    uploadFee,
    uploadMemo,
    uploadStore,
  } & {
    reupload,
    uploader,
  } & Partial&lt;ContractInstance&gt; & {
    deployer,
    redeploy,
  }</em>,
)
</pre>

## method [*contractInstance.isValid*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L282)
<pre>
contractInstance.isValid()
</pre>

## method [*contractInstance.serialize*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L265)
<pre>
contractInstance.serialize()
</pre>

## method [*contractInstance.upload*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L68)
Upload this contract, unless a valid upload is present and a rebuild is not requested.
<pre>
contractInstance.upload(
  <em>{
    compiler,
    rebuild,
  } & {
    reupload,
    uploadFee,
    uploadMemo,
    uploadStore,
  } & {
    reupload,
    uploader,
  }</em>,
)
</pre>

# class *ContractTemplate*
A contract that is part of a deploment.
- needed for deployment-wide deduplication
- generates structured label

```typescript
const contractTemplate = new ContractTemplate(
  properties: undefined
)
```

<table><tbody>
<tr><td valign="top">
<strong>chainId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>codeHash</strong></td>
<td><strong>string</strong>. Code hash uniquely identifying the compiled code.</td></tr>
<tr><td valign="top">
<strong>codeId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>compiled</strong></td>
<td><strong>CompiledCode</strong>. </td></tr>
<tr><td valign="top">
<strong>compiler</strong></td>
<td><strong>Compiler</strong>. </td></tr>
<tr><td valign="top">
<strong>deployer</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>deployment</strong></td>
<td><strong>Deployment</strong>. Deployment to which this unit belongs.</td></tr>
<tr><td valign="top">
<strong>isTemplate</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>name</strong></td>
<td><strong>string</strong>. Name of this unit.</td></tr>
<tr><td valign="top">
<strong>source</strong></td>
<td><strong>SourceCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploaded</strong></td>
<td><strong>UploadedCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploader</strong></td>
<td><strong>undefined</strong>. </td></tr></tbody></table>

## method [*contractTemplate.compile*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L36)
Compile this contract, unless a valid binary is present and a rebuild is not requested.
<pre>
contractTemplate.compile(
  <em>{
    compiler,
    rebuild,
  }</em>,
)
</pre>

## method [*contractTemplate.contract*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L187)
Create a new instance of this contract.
<pre>
<strong>const</strong> result: <em><a href="#">ContractInstance</a></em> = contractTemplate.contract(
  name: <em>string</em>,
  parameters: <em>Partial&lt;ContractInstance&gt;</em>,
)
</pre>

## method [*contractTemplate.contracts*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L193)
Create multiple instances of this contract.
<pre>
<strong>const</strong> result: <em>Record&lt;string, ContractInstance&gt;</em> = contractTemplate.contracts(
  instanceParameters: <em>Record&lt;string, Partial&gt;</em>,
)
</pre>

## method [*contractTemplate.serialize*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L178)
<pre>
contractTemplate.serialize()
</pre>

## method [*contractTemplate.upload*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L68)
Upload this contract, unless a valid upload is present and a rebuild is not requested.
<pre>
contractTemplate.upload(
  <em>{
    compiler,
    rebuild,
  } & {
    reupload,
    uploadFee,
    uploadMemo,
    uploadStore,
  } & {
    reupload,
    uploader,
  }</em>,
)
</pre>

# class *Deployment*
A collection of contracts.

```typescript
const deployment = new Deployment(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>name</strong></td>
<td><strong>string</strong>. </td></tr>
<tr><td valign="top">
<strong>size</strong></td>
<td><strong>number</strong>. </td></tr>
<tr><td valign="top">
<strong>[species]</strong></td>
<td><strong>MapConstructor</strong>. </td></tr></tbody></table>

## method [*deployment.[iterator]*](undefined)
Returns an iterable of entries in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = deployment.[iterator]()
</pre>

## method [*deployment.addContract*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L374)
<pre>
<strong>const</strong> result: <em><a href="#">Deployment</a></em> = deployment.addContract(
  ...args: <em>[string, {
    language,
  } & Partial&lt;RustSourceCode&gt; | {
    language,
  } & Partial&lt;SourceCode&gt; & Partial&lt;CompiledCode&gt; & Partial&lt;UploadedCode&gt; & Partial&lt;ContractInstance&gt;]</em>,
)
</pre>

## method [*deployment.addContracts*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L382)
<pre>
<strong>const</strong> result: <em><a href="#">Deployment</a></em> = deployment.addContracts(
  ...args: <em>[string, {
    language,
  } & Partial&lt;RustSourceCode&gt; | {
    language,
  } & Partial&lt;SourceCode&gt; & Partial&lt;CompiledCode&gt; & Partial&lt;UploadedCode&gt;]</em>,
)
</pre>

## method [*deployment.build*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L390)
<pre>
<strong>const</strong> result: <em>Record&lt;string, &gt;</em> = <strong>await</strong> deployment.build(
  <em>{
    compiler,
    rebuild,
  } & {
    units,
  }</em>,
)
</pre>

## method [*deployment.clear*](undefined)
<pre>
<strong>const</strong> result: <em>void</em> = deployment.clear()
</pre>

## method [*deployment.contract*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L352)
Define a contract that will be automatically compiled, uploaded,
and instantiated as part of this deployment.
<pre>
<strong>const</strong> result: <em><a href="#">ContractInstance</a></em> = deployment.contract(
  name: <em>string</em>,
  properties: <em>{
    language,
  } & Partial&lt;RustSourceCode&gt; | {
    language,
  } & Partial&lt;SourceCode&gt; & Partial&lt;CompiledCode&gt; & Partial&lt;UploadedCode&gt; & Partial&lt;ContractInstance&gt;</em>,
)
</pre>

## method [*deployment.delete*](undefined)

<pre>
<strong>const</strong> result: <em>boolean</em> = deployment.delete(
  key: <em>string</em>,
)
</pre>

## method [*deployment.deploy*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L444)
<pre>
<strong>const</strong> result: <em>Record&lt;string, &gt;</em> = <strong>await</strong> deployment.deploy(
  <em>{
    compiler,
    rebuild,
  } & {
    reupload,
    uploadFee,
    uploadMemo,
    uploadStore,
  } & {
    reupload,
    uploader,
  } & Partial&lt;ContractInstance&gt; & {
    deployer,
    redeploy,
  } & {
    deployStore,
    units,
  }</em>,
)
</pre>

## method [*deployment.entries*](undefined)
Returns an iterable of key, value pairs for every entry in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = deployment.entries()
</pre>

## method [*deployment.forEach*](undefined)
Executes a provided function once per each key/value pair in the Map, in insertion order.
<pre>
<strong>const</strong> result: <em>void</em> = deployment.forEach(
  callbackfn: <em>???</em>,
  thisArg: <em>any</em>,
)
</pre>

## method [*deployment.get*](undefined)
Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
<pre>
<strong>const</strong> result: <em><a href="#">DeploymentUnit</a></em> = deployment.get(
  key: <em>string</em>,
)
</pre>

## method [*deployment.has*](undefined)

<pre>
<strong>const</strong> result: <em>boolean</em> = deployment.has(
  key: <em>string</em>,
)
</pre>

## method [*deployment.keys*](undefined)
Returns an iterable of keys in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;string&gt;</em> = deployment.keys()
</pre>

## method [*deployment.serialize*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L310)
<pre>
deployment.serialize()
</pre>

## method [*deployment.set*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L318)
<pre>
deployment.set(
  name: <em>string</em>,
  unit: <em>DeploymentUnit</em>,
)
</pre>

## method [*deployment.template*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L329)
Define a template, representing code that can be compiled
and uploaded, but will not be automatically instantiated.
This can then be used to define multiple instances of
the same code.
<pre>
<strong>const</strong> result: <em><a href="#">ContractTemplate</a></em> = deployment.template(
  name: <em>string</em>,
  properties: <em>{
    language,
  } & Partial&lt;RustSourceCode&gt; | {
    language,
  } & Partial&lt;SourceCode&gt; & Partial&lt;CompiledCode&gt; & Partial&lt;UploadedCode&gt;</em>,
)
</pre>

## method [*deployment.upload*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L427)
<pre>
<strong>const</strong> result: <em>Record&lt;string, &gt;</em> = <strong>await</strong> deployment.upload(
  <em>{
    compiler,
    rebuild,
  } & {
    reupload,
    uploadFee,
    uploadMemo,
    uploadStore,
  } & {
    reupload,
    uploader,
  } & {
    units,
    uploadStore,
  }</em>,
)
</pre>

## method [*deployment.values*](undefined)
Returns an iterable of values in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;DeploymentUnit&gt;</em> = deployment.values()
</pre>

## method [*deployment.fromSnapshot*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L295)
<pre>
<strong>const</strong> result: <em><a href="#">Deployment</a></em> = deployment.fromSnapshot(
  <em>Partial&lt;&gt;</em>,
)
</pre>

# class *DeploymentUnit*
A contract that is part of a deploment.
- needed for deployment-wide deduplication
- generates structured label

```typescript
const deploymentUnit = new DeploymentUnit(
  properties: undefined
)
```

<table><tbody>
<tr><td valign="top">
<strong>chainId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>codeHash</strong></td>
<td><strong>string</strong>. Code hash uniquely identifying the compiled code.</td></tr>
<tr><td valign="top">
<strong>codeId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>compiled</strong></td>
<td><strong>CompiledCode</strong>. </td></tr>
<tr><td valign="top">
<strong>compiler</strong></td>
<td><strong>Compiler</strong>. </td></tr>
<tr><td valign="top">
<strong>deployer</strong></td>
<td><strong>undefined</strong>. </td></tr>
<tr><td valign="top">
<strong>deployment</strong></td>
<td><strong>Deployment</strong>. Deployment to which this unit belongs.</td></tr>
<tr><td valign="top">
<strong>log</strong></td>
<td><strong>Console</strong>. </td></tr>
<tr><td valign="top">
<strong>name</strong></td>
<td><strong>string</strong>. Name of this unit.</td></tr>
<tr><td valign="top">
<strong>source</strong></td>
<td><strong>SourceCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploaded</strong></td>
<td><strong>UploadedCode</strong>. </td></tr>
<tr><td valign="top">
<strong>uploader</strong></td>
<td><strong>undefined</strong>. </td></tr></tbody></table>

## method [*deploymentUnit.compile*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L36)
Compile this contract, unless a valid binary is present and a rebuild is not requested.
<pre>
deploymentUnit.compile(
  <em>{
    compiler,
    rebuild,
  }</em>,
)
</pre>

## method [*deploymentUnit.serialize*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L178)
<pre>
deploymentUnit.serialize()
</pre>

## method [*deploymentUnit.upload*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L68)
Upload this contract, unless a valid upload is present and a rebuild is not requested.
<pre>
deploymentUnit.upload(
  <em>{
    compiler,
    rebuild,
  } & {
    reupload,
    uploadFee,
    uploadMemo,
    uploadStore,
  } & {
    reupload,
    uploader,
  }</em>,
)
</pre>

# class *UploadedCode*
An object representing the contract's binary uploaded to a given chain.

```typescript
const uploadedCode = new UploadedCode(
  properties: Partial<...>,
)
```

<table><tbody>
<tr><td valign="top">
<strong>chainId</strong></td>
<td><strong>string</strong>. ID of chain on which this contract is uploaded.</td></tr>
<tr><td valign="top">
<strong>codeHash</strong></td>
<td><strong>string</strong>. Code hash uniquely identifying the compiled code.</td></tr>
<tr><td valign="top">
<strong>codeId</strong></td>
<td><strong>string</strong>. Code ID representing the identity of the contract's code on a specific chain.</td></tr>
<tr><td valign="top">
<strong>uploadBy</strong></td>
<td><strong>undefined</strong>. address of agent that performed the upload.</td></tr>
<tr><td valign="top">
<strong>uploadGas</strong></td>
<td><strong>undefined</strong>. address of agent that performed the upload.</td></tr>
<tr><td valign="top">
<strong>uploadTx</strong></td>
<td><strong>string</strong>. TXID of transaction that performed the upload.</td></tr>
<tr><td valign="top">
<strong>canInstantiate</strong></td>
<td></td></tr>
<tr><td valign="top">
<strong>canInstantiateInfo</strong></td>
<td></td></tr></tbody></table>

## method [*uploadedCode.serialize*](https://github.com/hackbg/fadroma/blob/0dad4acde5441c08749fd7b46d47288231605082/packages/agent/deploy.ts#L124)
<pre>
uploadedCode.serialize()
</pre>
<!-- @hackbg/docs: end -->
