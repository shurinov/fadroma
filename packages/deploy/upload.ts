import { bold } from '@hackbg/konzola'
import $, { Path, JSONFile, JSONDirectory, BinaryFile } from '@hackbg/kabinet'
import { Agent, Contract, ContractMetadata, ClientConsole, Uploader, ClientError } from '@fadroma/client'
import { CustomConsole } from '@hackbg/konzola'

export class UploadConsole extends ClientConsole {
  constructor (name = 'Fadroma Upload') {
    super(name)
  }
}

/** Uploads contracts from the local filesystem, with optional caching:
  * if provided with an Uploads directory containing upload receipts,
  * allows for uploaded contracts to be reused. */
export class FSUploader extends Uploader {

  constructor (
    /** Agent that will sign the upload transactions(s). */
    public agent?: Agent|null,
    /** If present, upload receipts are stored in it and reused to save reuploads. */
    cache?: string|Path|Uploads
  ) {
    super(agent)
    if (cache) this.cache = $(cache).as(Uploads)
  }

  readonly id = 'fs'

  log = new UploadConsole('Fadroma.FSUploader')

  cache?: Uploads

  assertAgent (): Agent {
    if (!this.agent) throw new ClientError.NoAgent()
    return this.agent
  }

  /** Upload an artifact from the filesystem if an upload receipt for it is not present. */
  async upload (contract: Contract<any>): Promise<Contract<any>> {
    let receipt: UploadReceipt|null = null
    if (this.cache) {
      const name = this.getUploadReceiptName(contract)
      receipt = this.cache.at(name).as(UploadReceipt)
      if (receipt.exists()) {
        this.log.contract(contract)
        this.log.info('Found    ', bold(this.cache.at(name).shortPath))
        const { chainId, codeId, codeHash, uploadTx, artifact } = receipt.toContractMetadata()
        this.log.contract({ chainId, codeId, codeHash, uploadTx, artifact })
        Object.assign(contract, { chainId, codeId, codeHash, uploadTx, artifact })
        this.log.contract(contract)
        return contract
      }
    }
    if (!contract.artifact) throw new Error('No artifact to upload')
    if (!this.agent) throw new Error('No upload agent')
    const result = await this.agent.upload($(contract.artifact).as(BinaryFile).load())
    if (
      contract.codeHash && result.codeHash &&
      contract.codeHash.toUpperCase() !== result.codeHash.toUpperCase()
    ) {
      throw new Error(
        `Code hash mismatch when uploading ${contract.artifact?.toString()}: ` +
        `${contract.codeHash} vs ${result.codeHash}`
      )
    }
    Object.assign(contract, result)
    if (receipt) {
      receipt.save(contract.asMetadata)
    }
    //await this.agent.nextBlock
    return contract
  }

  getUploadReceiptName (contract: Contract<any>): string {
    return `${$(contract.artifact!).name}.json`
  }

  getUploadReceiptPath (contract: Contract<any>): string {
    const receiptName = `${this.getUploadReceiptName(contract)}`
    const receiptPath = this.cache!.resolve(receiptName)
    return receiptPath
  }

  /** Upload multiple contracts from the filesystem. */
  async uploadMany (inputs: Array<Contract<any>>): Promise<Array<Contract<any>>> {

    // TODO: Optionally bundle the upload messages in one transaction -
    //       this will only work if they add up to less than the max API request size
    //       (which is defined who knows where) */

    if (!this.cache) return this.uploadManySansCache(inputs)

    const outputs:  Contract<any>[] = []
    const toUpload: Contract<any>[] = []

    for (const i in inputs) {

      // Skip empty positions
      let input = inputs[i]
      if (!input) {
        continue
      }

      // Make sure local code hash is available to compare against the result of the upload
      // If these two don't match, the local contract was rebuilt and needs to be reuploaded.
      // If they still don't match after the reupload, there's a problem.
      input = this.ensureLocalCodeHash(input)

      // If there's no local upload receipt, time to reupload.
      const blobName     = $(input.artifact!).name
      const receiptPath  = this.getUploadReceiptPath(input)
      const relativePath = $(receiptPath).shortPath
      if (!$(receiptPath).exists()) {
        this.log.warn(bold(`No receipt:`), `${relativePath}; uploading...`)
        toUpload[i] = input
        continue
      }

      // If there's a local upload receipt and it doesn't contain a code hash, time to reupload.
      const receiptData = $(receiptPath).as(UploadReceipt).load()
      const receiptCodeHash = receiptData.codeHash || receiptData.originalChecksum
      if (!receiptCodeHash) {
        this.log.warn(bold(`No code hash in receipt:`), `${relativePath}; reuploading...`)
        toUpload[i] = input
        continue
      }

      // If there's a local upload receipt and it contains a different code hash
      // from the one computed earlier, time to reupload.
      if (receiptCodeHash !== input.codeHash) {
        this.log.warn(bold(`Different code hash from receipt:`), `${relativePath}; reuploading...`)
        toUpload[i] = input
        continue
      }

      // Otherwise reuse the code ID from the receipt.
      outputs[i] = Object.assign(input, {
        codeId:   String(receiptData.codeId),
        uploadTx: receiptData.transactionHash as string
      })

    }

    // If any contracts are marked for uploading:
    // - upload them and save the receipts
    // - update outputs with data from upload results (containing new code ids)
    if (toUpload.length > 0) {
      const uploaded = await this.uploadManySansCache(toUpload)
      for (const i in uploaded) {
        if (!uploaded[i]) continue // skip empty ones, preserving index
        const receiptName = this.getUploadReceiptName(toUpload[i])
        $(this.cache, receiptName).as(UploadReceipt).save(uploaded[i].asMetadata)
        outputs[i] = uploaded[i] as Contract<any>
      }
    } else {
      this.log.info('No artifacts were uploaded.')
    }

    return outputs

  }

  /** Ignores the cache. Supports "holes" in artifact array to preserve order of non-uploads. */
  async uploadManySansCache (inputs: Array<Contract<any>>): Promise<Array<Contract<any>>> {
    const agent = this.assertAgent()
    const outputs: Array<Contract<any>> = []
    for (const i in inputs) {
      const input = inputs[i]
      if (input?.artifact) {
        const path = $(input.artifact!)
        const data = path.as(BinaryFile).load()
        this.log.info('Uploading', bold(path.shortPath), `(${data.length} bytes uncompressed)`)
        const output = Object.assign(input, await agent.upload(data))
        this.checkLocalCodeHash(input, output)
        outputs[i] = output
      } else {
        outputs[i] = input
      }
    }
    return outputs
  }

  private ensureLocalCodeHash (input: Contract<any>): Contract<any> {
    if (!input.codeHash) {
      const artifact = $(input.artifact!)
      this.log.warn('No code hash in artifact', bold(artifact.shortPath))
      try {
        const codeHash = this.hashPath(artifact)
        this.log.warn('Computed code hash:', bold(input.codeHash!))
        input = Object.assign(input, { codeHash })
      } catch (e: any) {
        this.log.warn('Could not compute code hash:', e.message)
      }
    }
    return input
  }

  private hashPath = (path: string|Path) => $(path).as(BinaryFile).sha256

  /** Panic if the code hash returned by the upload
    * doesn't match the one specified in the Contract. */
  private checkLocalCodeHash (input: Contract<any>, output: Contract<any>) {
    if (input.codeHash !== output.codeHash) {
      throw new Error(`
        The upload transaction ${output.uploadTx}
        returned code hash ${output.codeHash} (of code id ${output.codeId})
        instead of the expected ${input.codeHash} (of artifact ${input.artifact})
      `.trim().split('\n').map(x=>x.trim()).join(' '))
    }
  }

}

/** Directory collecting upload receipts.
  * Upload receipts are JSON files of the format `$CRATE@$REF.wasm.json`
  * and are kept so that we don't reupload the same contracts. */
export class Uploads extends JSONDirectory<UploadReceipt> {}

/** Class that convert itself to a Contract, from which contracts can be instantiated. */
export class UploadReceipt extends JSONFile<UploadReceiptFormat> {
  /** Create a Contract object with the data from the receipt. */
  toContractMetadata (defaultChainId?: string) {
    let { chainId, codeId, codeHash, uploadTx, artifact } = this.load()
    chainId ??= defaultChainId
    codeId  = String(codeId)
    return new ContractMetadata({ artifact, codeHash, chainId, codeId, uploadTx })
  }
}

/** Fields in the upload receipt. */
export interface UploadReceiptFormat {
  artifact?:          any
  chainId?:           string
  codeHash:           string
  codeId:             number|string
  compressedChecksum: string
  compressedSize:     string
  logs:               any[]
  originalChecksum:   string
  originalSize:       number
  transactionHash:    string
  uploadTx?:          string
}