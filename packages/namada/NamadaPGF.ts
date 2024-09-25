import type NamadaConnection from './NamadaConnection'

export type Params = Awaited<ReturnType<typeof fetchPGFParameters>>

type Connection = Pick<NamadaConnection, 'abciQuery'|'decode'>

export async function fetchPGFParameters (connection: Connection) {
  const binary = await connection.abciQuery(`/vp/pgf/parameters`)
  return connection.decode.pgf_parameters(binary)
}

export async function fetchPGFStewards (connection: Connection) {
  throw new Error("not implemented")
}

export async function fetchPGFFundings (connection: Connection) {
  throw new Error("not implemented")
}

export async function isPGFSteward (connection: Connection, address: string) {
  throw new Error("not implemented")
}
