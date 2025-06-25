import Domain from '@/services/Domain.js'
import * as DetailedGroup from './group-detailed.js'
import * as SimplifiedGroup from './group-simplified.js'
import * as FlexibilityGroup from './group-flexibility.js'
import * as RenewableFossilGroup from './group-renewable-fossil.js'
import * as CoalGasRenewablesGroup from './group-coal-gas-renewables.js'
import * as VreResidualGroup from './group-vre-residual.js'

export const GROUP_DETAILED = 'Detailed'
// export const GROUP_OLD_DETAILED = 'Detailed (Prev)'
export const GROUP_SIMPLIFIED = 'Simplified'
export const GROUP_COAL_GAS_RENEWABLES = 'Coal/Gas/Renewables'
export const GROUP_FLEXIBILITY = 'Flexibility'
export const GROUP_RENEWABLE_FOSSIL = 'Renewables/Fossils'
export const GROUP_VRE_RESIDUAL = 'VRE/Residual'

export const GROUP_DEFAULT = GROUP_DETAILED // default group is detailed

export const Groups = {}
Groups[GROUP_DETAILED] = DetailedGroup // default group is just the root power/energy
// Groups[GROUP_OLD_DETAILED] = OldDetailedGroup // default group is just the root power/energy
Groups[GROUP_SIMPLIFIED] = SimplifiedGroup
Groups[GROUP_COAL_GAS_RENEWABLES] = CoalGasRenewablesGroup
Groups[GROUP_FLEXIBILITY] = FlexibilityGroup
Groups[GROUP_RENEWABLE_FOSSIL] = RenewableFossilGroup
Groups[GROUP_VRE_RESIDUAL] = VreResidualGroup

export const ftGroups = Object.keys(Groups)

export function getAllGroups(powerEnergyDomains, type) {
  const parsed = {}
  Object.keys(Groups).forEach((key) => {
    parsed[key] =
      key === GROUP_DETAILED
        ? powerEnergyDomains
        : Domain.parseDomains(powerEnergyDomains, Groups[key], type).reverse()
  })
  return parsed
}
