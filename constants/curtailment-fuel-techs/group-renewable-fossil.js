import * as FT from './group-detailed.js'

export const GROUP_LABEL = 'Renewables/Fossils'
export const GROUP_NAME = 'group.curtailment.renewable-fossil'

export const NAME_RENEWABLES = `curtailment_renewables`

export const RENEWABLES = `${GROUP_NAME}.${NAME_RENEWABLES}`

export const NAME_FUEL_TECH_GROUP = {}
NAME_FUEL_TECH_GROUP[RENEWABLES] = NAME_RENEWABLES

export const FUEL_TECH_GROUP = {}
FUEL_TECH_GROUP[RENEWABLES] = [
  FT.CURTAILMENT_WIND,
  FT.CURTAILMENT_SOLAR_UTILITY,
]

// Fuel tech group order
export const FUEL_TECH_ORDER = [
  RENEWABLES
]

// Fuel tech group colour
export const FUEL_TECH_GROUP_COLOUR = {}
FUEL_TECH_GROUP_COLOUR[RENEWABLES] = '#52A972'

// Fuel tech type
const SOURCE = 'source'
export const FUEL_TECH_CATEGORY = {}
FUEL_TECH_CATEGORY[RENEWABLES] = SOURCE

// Fuel tech label
export const FUEL_TECH_LABEL = {}
FUEL_TECH_LABEL[RENEWABLES] = 'Renewables'
