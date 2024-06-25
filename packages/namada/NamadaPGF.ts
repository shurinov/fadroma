import { assign } from '@hackbg/fadroma'
import type NamadaConnection from './NamadaConnection'

interface PGFParameters {
  stewards:              Set<string>
  pgfInflationRate:      bigint
  stewardsInflationRate: bigint
}

interface PGFSteward {
  /*TODO*/
}

interface PGFFunding {
  /*TODO*/
}

export {
  PGFParameters as Parameters,
  PGFSteward    as Steward,
  PGFFunding    as Funding,
}

export async function fetchPGFParameters (connection: Pick<NamadaConnection, 'abciQuery'|'decode'>) {
  const binary = await connection.abciQuery(`/vp/pgf/parameters`)
  return connection.decode.pgf_parameters(binary)
}

export async function fetchPGFStewards (connection: Pick<NamadaConnection, 'abciQuery'|'decode'>) {
  throw new Error("not implemented")
}

export async function fetchPGFFundings (connection: Pick<NamadaConnection, 'abciQuery'|'decode'>) {
  throw new Error("not implemented")
}

export async function isPGFSteward (connection: Pick<NamadaConnection, 'abciQuery'|'decode'>) {
  throw new Error("not implemented")
}
