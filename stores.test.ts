import { TestProjectDeployment } from './fixtures/fixtures'
import { JSONFileUploadStore } from './fadroma'
import { Stub, Identity } from '@fadroma/agent'
import { withTmpDir } from '@hackbg/file'
export default async function testJSONFileStores () {
  await withTmpDir(async dir=>{
    const deployment = new TestProjectDeployment()
    await deployment.upload({
      uploadStore: new JSONFileUploadStore(dir),
      uploader:    new Stub.Agent({
        chain:     new Stub.Chain({ chainId: 'foo' }),
        identity:  new Identity()
      }),
    })
  })
}
