/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import { Suite } from '@hackbg/ensuite'
export default new Suite([
  ['core',    ()=>import('./agent-core.test')],
  ['chain',   ()=>import('./agent-chain.test')],
  ['compute', ()=>import('./agent-compute.test')],
  ['token',   ()=>import('./agent-token.test')],
  //['stub',   ()=>import('./agent-stub.test')]
])
