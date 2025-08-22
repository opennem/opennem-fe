import * as FT from './group-detailed.js'

export const GROUP_LABEL = 'Flexibility'
export const GROUP_NAME = 'group.flexibility'

export const VARIABLE = `${GROUP_NAME}.variable`

export const FUEL_TECH_GROUP = {}
FUEL_TECH_GROUP[VARIABLE] = [
  FT.CURTAILMENT_WIND,
  FT.CURTAILMENT_SOLAR,
]

// Fuel tech group order
export const FUEL_TECH_ORDER = [
  VARIABLE
]

// Fuel tech group colour
export const FUEL_TECH_GROUP_COLOUR = {}
FUEL_TECH_GROUP_COLOUR[VARIABLE] = '#069FAF'

// Fuel tech type
const SOURCE = 'source'
export const FUEL_TECH_CATEGORY = {}
FUEL_TECH_CATEGORY[VARIABLE] = SOURCE

// Fuel tech label
export const FUEL_TECH_LABEL = {}
FUEL_TECH_LABEL[VARIABLE] = 'Variable'
