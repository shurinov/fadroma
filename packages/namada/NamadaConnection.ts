import * as CW from '@fadroma/cw'
import NamadaBlock from './NamadaBlock'
import * as PoS from './NamadaPoS'
import * as PGF from './NamadaPGF'
import * as Gov from './NamadaGov'
import * as Epoch from './NamadaEpoch'
import type { Chain as Namada } from './Namada'

export default class NamadaConnection extends CW.Connection {
  get chain (): Namada {
    return super.chain as unknown as Namada
  }
  get decode () {
    return this.chain.decode
  }

  override async fetchBlockImpl (
    parameter?: ({ height: number }|{ hash: string }) & { raw?: boolean }
  ): Promise<NamadaBlock> {
    if (!this.url) {
      throw new CW.Error("Can't fetch block: missing connection URL")
    }
    if (!parameter) {
      parameter = {} as any
    }
    if ('height' in parameter!) {
      return NamadaBlock.fetchByHeight(this, parameter)
    } else if ('hash' in parameter!) {
      return NamadaBlock.fetchByHash(this, parameter)
    } else {
      return NamadaBlock.fetchByHeight(this, {})
    }
  }

  fetchCurrentEpochImpl () {
    return Epoch.fetchCurrentEpoch(this)
  }
  fetchCurrentEpochFirstBlockImpl () {
    return Epoch.fetchCurrentEpochFirstBlock(this)
  }

  fetchGovernanceParametersImpl () {
    return Gov.fetchGovernanceParameters(this)
  }
  fetchProposalCountImpl () {
    return Gov.fetchProposalCount(this)
  }
  fetchProposalInfoImpl (id: number) {
    return Gov.fetchProposalInfo(this, id)
  }

  fetchPGFParametersImpl () {
    return PGF.fetchPGFParameters(this)
  }
  fetchPGFStewardsImpl () {
    return PGF.fetchPGFStewards(this)
  }
  fetchPGFFundingsImpl () {
    return PGF.fetchPGFFundings(this)
  }
  isPGFStewardImpl (address: string) {
    return PGF.isPGFSteward(this)
  }

  fetchStakingParametersImpl () {
    return PoS.fetchStakingParameters(this)
  }
  fetchValidatorAddressesImpl () {
    return PoS.fetchValidatorAddresses(this)
  }
  fetchValidatorImpl (address: string) {
    return PoS.fetchValidator(this.chain, address)
  }
  fetchValidatorsImpl (options?: {
    details?:         boolean,
    pagination?:      [number, number]
    allStates?:       boolean,
    addresses?:       string[],
    parallel?:        boolean,
    parallelDetails?: boolean,
  }) {
    return PoS.fetchValidators(this.chain, options)
  }
  fetchValidatorsConsensusImpl () {
    return PoS.fetchValidatorsConsensus(this)
  }
  fetchValidatorsBelowCapacityImpl () {
    return PoS.fetchValidatorsBelowCapacity(this)
  }
  fetchDelegationsImpl (address: string) {
    return PoS.fetchDelegations(this, address)
  }
  fetchDelegationsAtImpl (address: string, epoch?: number) {
    return PoS.fetchDelegationsAt(this, address, epoch)
  }
  fetchTotalStakedImpl () {
    return PoS.fetchTotalStaked(this)
  }
  fetchValidatorStakeImpl (address: string) {
    return PoS.fetchValidatorStake(this, address)
  }
}
