import assert from 'node:assert'
import { JSONDirectory, withTmpDir } from '@hackbg/file'
import { FSUploader } from '@hackbg/fadroma'
import { Agent, Uploader, Template } from '@fadroma/agent'

import testEntrypoint from './testSelector'
export default testEntrypoint(import.meta.url, {
  'docs': () => import('./Upload.spec.ts.md'),
  'other': testUpload
})

export async function testUpload () {
  let uploader: FSUploader
  let agent:    Agent = { chain: { id: 'testing' }, upload: async (x: any) => x } as any // mock

  //await withTmpDir(async store=>{
    //uploader = new FSUploader({ agent, store })
    //assert.ok(uploader.agent === agent)
    //assert.ok(await uploader.upload(template))
    //assert.ok(await uploader.upload(template))
    //assert.ok(await uploader.uploadMany([template]))
  //})
}