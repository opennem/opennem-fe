import Domain from '@/services/Domain.js'
import * as DefaultGroup from './group-default.js'
import * as SimplifiedGroup from './group-simplified.js'
import * as FlexibilityGroup from './group-flexibility.js'
import * as RenewableFossilGroup from './group-renewable-fossil.js'
import * as SolarResidualGroup from './group-solar-residual.js'

export const Groups = {
  Default: DefaultGroup, // default group is just the root power/energy
  Simplified: SimplifiedGroup,
  Flexibility: FlexibilityGroup,
  'Renewable/Fossil': RenewableFossilGroup,
  'Solar/Residual': SolarResidualGroup
}

export function getAllGroups(powerEnergyDomains, type) {
  const parsed = {}
  Object.keys(Groups).forEach(key => {
    parsed[key] =
      key === 'Default'
        ? powerEnergyDomains
        : Domain.parseDomains(powerEnergyDomains, Groups[key], type).reverse()
  })
  return parsed
}
