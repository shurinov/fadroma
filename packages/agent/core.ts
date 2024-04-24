/** Fadroma. Copyright (C) 2023 Hack.bg. License: GNU AGPLv3 or custom.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. **/
import { Error } from '@hackbg/oops'
import { Console, Logged, bold, colors } from '@hackbg/logs'

class FadromaError extends Error {}

export { FadromaError as Error }

export { Console, Logged, bold, colors, randomColor, timestamp } from '@hackbg/logs'
export * from '@hackbg/into'
export * from '@hackbg/hide'
export * from '@hackbg/4mat'
export * from '@hackbg/dump'

export async function timed <T> (
  fn: ()=>Promise<T>, cb: (ctx: { elapsed: string, result: T })=>unknown
): Promise<T> {
  const t0 = performance.now()
  const result = await fn()
  const t1 = performance.now()
  cb({
    elapsed: ((t1-t0)/1000).toFixed(3)+'s',
    result
  })
  return result
}
