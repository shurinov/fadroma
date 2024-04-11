import * as CW from '@fadroma/cw'
import init, { Decode } from './pkg/fadroma_namada.js'
import {
  getTotalStaked,
  getStakingParameters,
  getValidators,
  getValidatorsConsensus,
  getValidatorsBelowCapacity,
  getValidatorAddresses,
  getValidator,
  getValidatorStake,
  getDelegations,
  getDelegationsAt,
} from './namada-pos'
import {
  getGovernanceParameters,
  getProposalCount,
  getProposalInfo
} from './namada-gov'
import {
  getCurrentEpoch
} from "./namada-epoch";
import {
  getPGFParameters,
  getPGFStewards,
  getPGFFundings,
  isPGFSteward
} from "./namada-pgf"
import * as TX from './namada-tx'

export async function connect (optionsWithDecoder: ConstructorParameters<typeof NamadaConnection>[0] & {
  decoder: string|URL|Uint8Array
}) {
  let { decoder, ...options } = optionsWithDecoder
  if (decoder) {
    await initDecoder(decoder)
  }
  return new NamadaConnection(options)
}

export async function initDecoder (decoder: string|URL|Uint8Array) {
  if (decoder instanceof Uint8Array) {
    await init(decoder)
  } else if (decoder) {
    await init(await fetch(decoder))
  }
}

export { Decode }

export class NamadaBlock extends CW.Block {
  txs:  TX.Transaction[]
  time: string
  constructor ({ hash, height, rawTxs, txs, time }: Partial<NamadaBlock> = {}) {
    super({ hash, height, rawTxs })
    this.txs = [...txs||[]]
  }
}

export class NamadaConnection extends CW.Connection {

  decode = Decode

  async doGetBlockInfo (height?: number): Promise<NamadaBlock> {
    if (!this.url) {
      throw new CW.Error("Can't fetch block: missing connection URL")
    }
    // Fetch block and results as undecoded JSON
    const [block, results] = await Promise.all([
      fetch(`${this.url}/block?height=${height||''}`)
        .then(response=>response.text()),
      fetch(`${this.url}/block_results?height=${height||''}`)
        .then(response=>response.text()),
    ])
    const { id, txs, header: { time } } = this.decode.block(block, results) as {
      id: string,
      txs: Partial<TX.Transaction[]>[]
      header: { time: string }
    }
    const txsDecoded: TX.Transaction[] = []
    for (const i in txs) {
      try {
        txsDecoded[i] = TX.Transaction.fromDecoded(txs[i] as any)
      } catch (error) {
        console.error(error)
        console.warn(`Failed to decode transaction #${i} in block ${height}, see above for details.`)
        txsDecoded[i] = new TX.Transactions.Undecoded({
          data: txs[i] as any,
          error: error as any
        })
      }
    }
    return new NamadaBlock({ time, height, hash: id, rawTxs: [], txs: txsDecoded })
  }

  getPGFParameters () {
    return getPGFParameters(this)
  }

  getPGFStewards () {
    return getPGFStewards(this)
  }

  getPGFFundings () {
    return getPGFFundings(this)
  }

  isPGFSteward (address: string) {
    return isPGFSteward(this)
  }

  getStakingParameters () {
    return getStakingParameters(this)
  }

  getValidatorAddresses () {
    return getValidatorAddresses(this)
  }

  getValidators (options?: {
    details?:         boolean,
    pagination?:      [number, number]
    allStates?:       boolean,
    addresses?:       string[],
    parallel?:        boolean,
    parallelDetails?: boolean,
  }) {
    return getValidators(this, options)
  }

  getValidatorsConsensus () {
    return getValidatorsConsensus(this)
  }

  getValidatorsBelowCapacity () {
    return getValidatorsBelowCapacity(this)
  }

  getValidator (address: string) {
    return getValidator(this, address)
  }

  getDelegations (address: string) {
    return getDelegations(this, address)
  }

  getDelegationsAt (address: string, epoch?: number) {
    return getDelegationsAt(this, address, epoch)
  }

  getGovernanceParameters () {
    return getGovernanceParameters(this)
  }

  getProposalCount () {
    return getProposalCount(this)
  }

  getProposalInfo (id: number) {
    return getProposalInfo(this, id)
  }

  getCurrentEpoch () {
    return getCurrentEpoch(this)
  }

  getTotalStaked () {
    return getTotalStaked(this)
  }

  getValidatorStake (address: string) {
    return getValidatorStake(this, address)
  }
}

const defaults = {
  coinType:       118,
  bech32Prefix:   'tnam', 
  hdAccountIndex: 0,
}

export class NamadaMnemonicIdentity extends CW.MnemonicIdentity {
  constructor (properties?: { mnemonic?: string } & Partial<CW.MnemonicIdentity>) {
    super({ ...defaults, ...properties||{} })
  }
}
