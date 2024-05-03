# Fadroma Agent API: Deploying contracts

<!-- @hackbg/docs: begin -->

# class *ContractCode*
Represents a contract's code in all its forms, and the contract's lifecycle
up to and including uploading it, but not instantiating it.

<pre>
<strong>const</strong> contractCode = new ContractCode({
  compiled,
  compiler,
  deployer,
  log,
  source,
  uploaded,
  uploader,
})
</pre>

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

## method [*contractCode.compile*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L41)
Compile this contract.

If a valid binary is present and a rebuild is not requested,
this does not compile it again, but reuses the binary.
<pre>
contractCode.compile({
  compiler,
  rebuild,
})
</pre>

## method [*contractCode.upload*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L81)
Upload this contract.

If a valid binary is not present, compile it first.

If a valid code ID is present and reupload is not requested,
this does not upload it again, but reuses the code ID.

If a valid binary is not present, but valid source is present,
this compiles the source code first to obtain a binary.
<pre>
contractCode.upload({
  compiler,
  rebuild,
  reupload,
  uploadFee,
  uploadMemo,
  uploadStore,
  uploader,
})
</pre>

# class *UploadedCode*
Represents a contract's code, in binary form, uploaded to a given chain.

<pre>
<strong>const</strong> uploadedCode = new UploadedCode({
  chainId,
  codeHash,
  codeId,
  uploadBy,
  uploadGas,
  uploadTx,
})
</pre>

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

## method [*uploadedCode.serialize*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L137)
<pre>
uploadedCode.serialize()
</pre>

# class *DeploymentUnit*
A contract that is part of a deploment.
- needed for deployment-wide deduplication
- generates structured label

<pre>
<strong>const</strong> deploymentUnit = new DeploymentUnit(properties: {
  chainId,
  codeHash,
  codeId,
  compiled,
  compiler,
  deployer,
  deployment,
  log,
  name,
  source,
  uploaded,
  uploader,
})
</pre>

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

## method [*deploymentUnit.compile*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L41)
Compile this contract.

If a valid binary is present and a rebuild is not requested,
this does not compile it again, but reuses the binary.
<pre>
deploymentUnit.compile({
  compiler,
  rebuild,
})
</pre>

## method [*deploymentUnit.serialize*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L191)
<pre>
deploymentUnit.serialize()
</pre>

## method [*deploymentUnit.upload*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L81)
Upload this contract.

If a valid binary is not present, compile it first.

If a valid code ID is present and reupload is not requested,
this does not upload it again, but reuses the code ID.

If a valid binary is not present, but valid source is present,
this compiles the source code first to obtain a binary.
<pre>
deploymentUnit.upload({
  compiler,
  rebuild,
  reupload,
  uploadFee,
  uploadMemo,
  uploadStore,
  uploader,
})
</pre>

# class *ContractTemplate*
A contract that is part of a deploment.
- needed for deployment-wide deduplication
- generates structured label

<pre>
<strong>const</strong> contractTemplate = new ContractTemplate(properties: {
  chainId,
  codeHash,
  codeId,
  compiled,
  compiler,
  deployer,
  deployment,
  log,
  name,
  source,
  uploaded,
  uploader,
})
</pre>

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

## method [*contractTemplate.compile*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L41)
Compile this contract.

If a valid binary is present and a rebuild is not requested,
this does not compile it again, but reuses the binary.
<pre>
contractTemplate.compile({
  compiler,
  rebuild,
})
</pre>

## method [*contractTemplate.contract*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L200)
Create a new instance of this contract.
<pre>
<strong>const</strong> result: <em><a href="#">ContractInstance</a></em> = contractTemplate.contract(
  name: <em>string</em>,
  parameters: <em>Partial&lt;ContractInstance&gt;</em>,
)
</pre>

## method [*contractTemplate.contracts*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L206)
Create multiple instances of this contract.
<pre>
<strong>const</strong> result: <em>Record&lt;string, ContractInstance&gt;</em> = contractTemplate.contracts(instanceParameters: Record&lt;string, Partial&gt;)
</pre>

## method [*contractTemplate.serialize*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L191)
<pre>
contractTemplate.serialize()
</pre>

## method [*contractTemplate.upload*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L81)
Upload this contract.

If a valid binary is not present, compile it first.

If a valid code ID is present and reupload is not requested,
this does not upload it again, but reuses the code ID.

If a valid binary is not present, but valid source is present,
this compiles the source code first to obtain a binary.
<pre>
contractTemplate.upload({
  compiler,
  rebuild,
  reupload,
  uploadFee,
  uploadMemo,
  uploadStore,
  uploader,
})
</pre>

# class *ContractInstance*
A contract that is part of a deploment.
- needed for deployment-wide deduplication
- generates structured label

<pre>
<strong>const</strong> contractInstance = new ContractInstance(properties: {
  address,
  chainId,
  codeHash,
  codeId,
  compiled,
  compiler,
  deployer,
  deployment,
  initBy,
  initFee,
  initGas,
  initMemo,
  initMsg,
  initSend,
  initTx,
  isTemplate,
  label,
  log,
  name,
  source,
  uploaded,
  uploader,
})
</pre>

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

## method [*contractInstance.compile*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L41)
Compile this contract.

If a valid binary is present and a rebuild is not requested,
this does not compile it again, but reuses the binary.
<pre>
contractInstance.compile({
  compiler,
  rebuild,
})
</pre>

## method [*contractInstance.connect*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L287)
Returns a client to this contract instance.
<pre>
<strong>const</strong> result: <em><a href="#">Contract</a></em> = contractInstance.connect(agent: Connection)
</pre>

## method [*contractInstance.deploy*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L248)
<pre>
contractInstance.deploy({
  address,
  chainId,
  codeHash,
  codeId,
  compiled,
  compiler,
  deployer,
  deployment,
  initBy,
  initFee,
  initGas,
  initMemo,
  initMsg,
  initSend,
  initTx,
  isTemplate,
  label,
  log,
  name,
  rebuild,
  redeploy,
  reupload,
  source,
  uploadFee,
  uploadMemo,
  uploadStore,
  uploaded,
  uploader,
})
</pre>

## method [*contractInstance.isValid*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L295)
<pre>
contractInstance.isValid()
</pre>

## method [*contractInstance.serialize*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L278)
<pre>
contractInstance.serialize()
</pre>

## method [*contractInstance.upload*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L81)
Upload this contract.

If a valid binary is not present, compile it first.

If a valid code ID is present and reupload is not requested,
this does not upload it again, but reuses the code ID.

If a valid binary is not present, but valid source is present,
this compiles the source code first to obtain a binary.
<pre>
contractInstance.upload({
  compiler,
  rebuild,
  reupload,
  uploadFee,
  uploadMemo,
  uploadStore,
  uploader,
})
</pre>

# class *Deployment*
A collection of contracts.

<pre>
<strong>const</strong> deployment = new Deployment({
  log,
  name,
  size,
})
</pre>

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

## method [*deployment.[iterator]*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L119)
Returns an iterable of entries in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = deployment.[iterator]()
</pre>

## method [*deployment.addContract*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L387)
<pre>
<strong>const</strong> result: <em><a href="#">Deployment</a></em> = deployment.addContract(args: [string, ((({
  cargoCrate,
  cargoFeatures,
  cargoToml,
  cargoWorkspace,
  language,
  log,
  sourceDirty,
  sourceOrigin,
  sourcePath,
  sourceRef,
}) | ({
  language,
  log,
  sourceDirty,
  sourceOrigin,
  sourcePath,
  sourceRef,
})) & Partial&lt;CompiledCode&gt; & Partial&lt;UploadedCode&gt; & Partial&lt;ContractInstance&gt;)])
</pre>

## method [*deployment.addContracts*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L395)
<pre>
<strong>const</strong> result: <em><a href="#">Deployment</a></em> = deployment.addContracts(args: [string, ((({
  cargoCrate,
  cargoFeatures,
  cargoToml,
  cargoWorkspace,
  language,
  log,
  sourceDirty,
  sourceOrigin,
  sourcePath,
  sourceRef,
}) | ({
  language,
  log,
  sourceDirty,
  sourceOrigin,
  sourcePath,
  sourceRef,
})) & Partial&lt;CompiledCode&gt; & Partial&lt;UploadedCode&gt;)])
</pre>

## method [*deployment.build*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L403)
<pre>
<strong>const</strong> result: <em>Record&lt;string, &gt;</em> = <strong>await</strong> deployment.build({
  compiler,
  rebuild,
  units,
})
</pre>

## method [*deployment.clear*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L20)
<pre>
<strong>const</strong> result: <em>void</em> = deployment.clear()
</pre>

## method [*deployment.contract*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L365)
Define a contract that will be automatically compiled, uploaded,
and instantiated as part of this deployment.
<pre>
<strong>const</strong> result: <em><a href="#">ContractInstance</a></em> = deployment.contract(
  name: <em>string</em>,
  properties: <em>(({
    cargoCrate,
    cargoFeatures,
    cargoToml,
    cargoWorkspace,
    language,
    log,
    sourceDirty,
    sourceOrigin,
    sourcePath,
    sourceRef,
  }) | ({
    language,
    log,
    sourceDirty,
    sourceOrigin,
    sourcePath,
    sourceRef,
  })) & Partial&lt;CompiledCode&gt; & Partial&lt;UploadedCode&gt; & Partial&lt;ContractInstance&gt;</em>,
)
</pre>

## method [*deployment.delete*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L24)

<pre>
<strong>const</strong> result: <em>boolean</em> = deployment.delete(key: string)
</pre>

## method [*deployment.deploy*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L457)
<pre>
<strong>const</strong> result: <em>Record&lt;string, &gt;</em> = <strong>await</strong> deployment.deploy({
  address,
  chainId,
  codeHash,
  codeId,
  compiled,
  compiler,
  deployStore,
  deployer,
  deployment,
  initBy,
  initFee,
  initGas,
  initMemo,
  initMsg,
  initSend,
  initTx,
  isTemplate,
  label,
  log,
  name,
  rebuild,
  redeploy,
  reupload,
  source,
  units,
  uploadFee,
  uploadMemo,
  uploadStore,
  uploaded,
  uploader,
})
</pre>

## method [*deployment.entries*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L124)
Returns an iterable of key, value pairs for every entry in the map.
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;&gt;</em> = deployment.entries()
</pre>

## method [*deployment.forEach*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L28)
Executes a provided function once per each key/value pair in the Map, in insertion order.
<pre>
<strong>const</strong> result: <em>void</em> = deployment.forEach(
  callbackfn: <em>???</em>,
  thisArg: <em>any</em>,
)
</pre>

## method [*deployment.get*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L33)
Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
<pre>
<strong>const</strong> result: <em><a href="#">DeploymentUnit</a></em> = deployment.get(key: string)
</pre>

## method [*deployment.has*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.collection.d.ts#L37)

<pre>
<strong>const</strong> result: <em>boolean</em> = deployment.has(key: string)
</pre>

## method [*deployment.keys*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L129)
Returns an iterable of keys in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;string&gt;</em> = deployment.keys()
</pre>

## method [*deployment.serialize*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L323)
<pre>
deployment.serialize()
</pre>

## method [*deployment.set*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L331)
<pre>
deployment.set(
  name: <em>string</em>,
  unit: <em>DeploymentUnit</em>,
)
</pre>

## method [*deployment.template*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L342)
Define a template, representing code that can be compiled
and uploaded, but will not be automatically instantiated.
This can then be used to define multiple instances of
the same code.
<pre>
<strong>const</strong> result: <em><a href="#">ContractTemplate</a></em> = deployment.template(
  name: <em>string</em>,
  properties: <em>(({
    cargoCrate,
    cargoFeatures,
    cargoToml,
    cargoWorkspace,
    language,
    log,
    sourceDirty,
    sourceOrigin,
    sourcePath,
    sourceRef,
  }) | ({
    language,
    log,
    sourceDirty,
    sourceOrigin,
    sourcePath,
    sourceRef,
  })) & Partial&lt;CompiledCode&gt; & Partial&lt;UploadedCode&gt;</em>,
)
</pre>

## method [*deployment.upload*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L440)
<pre>
<strong>const</strong> result: <em>Record&lt;string, &gt;</em> = <strong>await</strong> deployment.upload({
  compiler,
  rebuild,
  reupload,
  units,
  uploadFee,
  uploadMemo,
  uploadStore,
  uploader,
})
</pre>

## method [*deployment.values*](https://github.com/hackbg/fadroma/tree/v2/node_modules/.pnpm/typescript@5.3.3/node_modules/typescript/lib/lib.es2015.iterable.d.ts#L134)
Returns an iterable of values in the map
<pre>
<strong>const</strong> result: <em>IterableIterator&lt;DeploymentUnit&gt;</em> = deployment.values()
</pre>

## method [*deployment.fromSnapshot*](https://github.com/hackbg/fadroma/tree/v2/packages/agent/deploy.ts#L308)
<pre>
<strong>const</strong> result: <em><a href="#">Deployment</a></em> = deployment.fromSnapshot(Partial&lt;&gt;)
</pre>
<!-- @hackbg/docs: end -->
