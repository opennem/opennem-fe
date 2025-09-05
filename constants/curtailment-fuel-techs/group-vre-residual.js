import * as FT from './group-detailed.js'

export const GROUP_LABEL = 'VRE/Residual'
export const GROUP_NAME = 'group.curtailment.vre-residual'

export const NAME_VRE = `curtailment_vre`

export const VRE = `${GROUP_NAME}.${NAME_VRE}`

export const NAME_FUEL_TECH_GROUP = {}
NAME_FUEL_TECH_GROUP[VRE] = NAME_VRE

export const FUEL_TECH_GROUP = {}
FUEL_TECH_GROUP[VRE] = [
  FT.CURTAILMENT_WIND,
  FT.CURTAILMENT_SOLAR_UTILITY,
]

// Fuel tech group order
export const FUEL_TECH_ORDER = [
  VRE
]

// Fuel tech group colour
export const FUEL_TECH_GROUP_COLOUR = {}
FUEL_TECH_GROUP_COLOUR[VRE] = '#069FAF'

// Fuel tech type
const SOURCE = 'source'
export const FUEL_TECH_CATEGORY = {}
FUEL_TECH_CATEGORY[VRE] = SOURCE

// Fuel tech label
export const FUEL_TECH_LABEL = {}
FUEL_TECH_LABEL[VRE] = 'VRE'
