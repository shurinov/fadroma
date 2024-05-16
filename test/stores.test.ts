import { TestProjectDeployment } from '@fadroma/fixtures'
import { JSONFileUploadStore } from '@fadroma/deploy'
import { Identity } from '@hackbg/fadroma'
import * as Stub from '@fadroma/stub'
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
