/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import { Suite } from '@hackbg/ensuite'
export default new Suite([
  ['core',    ()=>import('./test/agent-core.test')],
  ['chain',   ()=>import('./test/agent-chain.test')],
  ['compute', ()=>import('./test/agent-compute.test')],
  ['token',   ()=>import('./test/agent-token.test')],
  //['stub',   ()=>import('./agent-stub.test')]
  ['stores',  () => import('./test/stores.test')],
  ['scrt',    () => import('./packages/scrt/scrt.test')],
  ['cw',      () => import('./packages/cw/cw.test')],
  //['oci',     () =>
    //@ts-ignore
    //import('./oci/oci.test')],

  // When running sequentially, these should go last, as they are the slowest.
  ['devnet',  () => import('./packages/devnet/devnet.test')],
  ['compile', () => import('./packages/compile/compile.test')],
  ['create',  () => import('./packages/create/create.test')],
])
