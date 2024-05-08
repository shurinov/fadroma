/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import { Console } from '../agent-core'
import type { SourceCode } from '../agent-compute.browser'
import { Compiler, CompiledCode } from '../agent-compute.browser'

/** A compiler that does nothing. Used for testing. */
export class StubCompiler extends Compiler {
  caching = false
  id = 'stub'
  log = new Console('StubCompiler')
  async build (source: string|Partial<SourceCode>, ...args: any[]): Promise<CompiledCode> {
    return new CompiledCode({
      codePath: 'stub',
      codeHash: 'stub',
    })
  }
}
