import { assign } from '@hackbg/fadroma'

class PGFParameters {
  stewards!:              Set<string>
  pgfInflationRate!:      bigint
  stewardsInflationRate!: bigint
  constructor (properties: Partial<PGFParameters> = {}) {
    assign(this, properties, [
      'stewards',
      'pgfInflationRate',
      'stewardsInflationRate'
    ])
  }
}

class PGFSteward { /*TODO*/ }

class PGFFunding { /*TODO*/ }

export {
  PGFParameters as Parameters,
  PGFSteward    as Steward,
  PGFFunding    as Funding,
}

type Connection = {
  abciQuery: (path: string)=>Promise<Uint8Array>
  decode: {
    pgf_parameters (binary: Uint8Array): Partial<PGFParameters>
  }
}

export async function fetchPGFParameters (connection: Connection) {
  const binary = await connection.abciQuery(`/vp/pgf/parameters`)
  return new PGFParameters(connection.decode.pgf_parameters(binary))
}

export async function fetchPGFStewards (connection: Connection) {
  throw new Error("not implemented")
}

export async function fetchPGFFundings (connection: Connection) {
  throw new Error("not implemented")
}

export async function isPGFSteward (connection: Connection) {
  throw new Error("not implemented")
}
