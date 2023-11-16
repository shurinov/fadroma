/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import { TestProjectDeployment } from '../fixtures/fixtures'
import { JSONFileUploadStore } from './stores'
import { Stub } from '@fadroma/connect'
import { withTmpDir } from '@hackbg/file'

export default async function testJSONFileStores () {
  await withTmpDir(async dir=>{
    const deployment = new TestProjectDeployment()
    await deployment.upload({
      uploader:    new Stub.Connection(),
      uploadStore: new JSONFileUploadStore(dir)
    })
  })
}
