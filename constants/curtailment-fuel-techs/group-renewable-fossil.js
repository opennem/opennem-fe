import * as FT from './group-detailed.js'

export const GROUP_LABEL = 'Renewables/Fossils'
export const GROUP_NAME = 'group.renewable-fossil'

export const RENEWABLES = `${GROUP_NAME}.renewables`

export const FUEL_TECH_GROUP = {}
FUEL_TECH_GROUP[RENEWABLES] = [
  FT.CURTAILMENT_WIND,
  FT.CURTAILMENT_SOLAR,
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
