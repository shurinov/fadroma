/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import { Suite } from '@hackbg/ensuite'
export default new Suite([
  ['core',    ()=>import('./test/agent-core.test.ts')],
  ['chain',   ()=>import('./test/agent-chain.test.ts')],
  ['compute', ()=>import('./test/agent-compute.test.ts')],
  ['token',   ()=>import('./test/agent-token.test.ts')],
  ['stores',  ()=>import('./test/stores.test.ts')],
  ['scrt',    ()=>import('./packages/scrt/scrt.test.ts')],
  ['cw',      ()=>import('./packages/cw/cw.test.ts')],
  // When running sequentially, these slowest ones should go last:
  ['devnet',  ()=>import('./packages/devnet/devnet.test.ts')],
  ['compile', ()=>import('./packages/compile/compile.test.ts')],
  ['create',  ()=>import('./packages/create/create.test.ts')],
])
