import Domain from '@/services/Domain.js'
import * as DefaultGroup from './group-default.js'
import * as SimplifiedGroup from './group-simplified.js'
import * as FlexibilityGroup from './group-flexibility.js'
import * as RenewableFossilGroup from './group-renewable-fossil.js'
import * as SolarResidualGroup from './group-solar-residual.js'
import * as CoalGasRenewablesGroup from './group-coal-gas-renewables.js'
import * as VreResidualGroup from './group-vre-residual.js'

export const GROUP_DEFAULT = 'Default'
export const GROUP_SIMPLIFIED = 'Simplified'
export const GROUP_COAL_GAS_RENEWABLES = 'Coal/Gas/Renewables'
export const GROUP_FLEXIBILITY = 'Flexibility'
export const GROUP_RENEWABLE_FOSSIL = 'Renewable/Fossil'
export const GROUP_SOLAR_RESIDUAL = 'Solar/Residual'
export const GROUP_VRE_RESIDUAL = 'VRE/Residual'

export const Groups = {}
Groups[GROUP_DEFAULT] = DefaultGroup // default group is just the root power/energy
Groups[GROUP_SIMPLIFIED] = SimplifiedGroup
Groups[GROUP_COAL_GAS_RENEWABLES] = CoalGasRenewablesGroup
Groups[GROUP_FLEXIBILITY] = FlexibilityGroup
Groups[GROUP_RENEWABLE_FOSSIL] = RenewableFossilGroup
Groups[GROUP_SOLAR_RESIDUAL] = SolarResidualGroup
Groups[GROUP_VRE_RESIDUAL] = VreResidualGroup

export const ftGroups = Object.keys(Groups)

export function getAllGroups(powerEnergyDomains, type) {
  const parsed = {}
  Object.keys(Groups).forEach((key) => {
    parsed[key] =
      key === 'Default'
        ? powerEnergyDomains
        : Domain.parseDomains(powerEnergyDomains, Groups[key], type).reverse()
  })
  return parsed
}
