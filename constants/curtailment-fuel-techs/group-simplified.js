import * as FT from './group-detailed.js'

export const GROUP_LABEL = 'Simplified'
export const GROUP_NAME = 'group.curtailment.simplified'

export const CURTAILMENT_WIND = `${GROUP_NAME}.curtailment_wind`
export const CURTAILMENT_SOLAR = `${GROUP_NAME}.curtailment_solar`

export const FUEL_TECH_GROUP = {}
FUEL_TECH_GROUP[CURTAILMENT_WIND] = [FT.CURTAILMENT_WIND]
FUEL_TECH_GROUP[CURTAILMENT_SOLAR] = [FT.CURTAILMENT_SOLAR]

// Fuel tech group order
export const FUEL_TECH_ORDER = [
  CURTAILMENT_WIND,
  CURTAILMENT_SOLAR,
]

// Fuel tech group colour
export const FUEL_TECH_GROUP_COLOUR = {}
FUEL_TECH_GROUP_COLOUR[CURTAILMENT_WIND] = '#2C7629'
FUEL_TECH_GROUP_COLOUR[CURTAILMENT_SOLAR] = '#FED500'

// Fuel tech type
const SOURCE = 'source'
export const FUEL_TECH_CATEGORY = {}
FUEL_TECH_CATEGORY[CURTAILMENT_WIND] = SOURCE
FUEL_TECH_CATEGORY[CURTAILMENT_SOLAR] = SOURCE

// Fuel tech label
export const FUEL_TECH_LABEL = {}
FUEL_TECH_LABEL[CURTAILMENT_WIND] = 'Wind'
FUEL_TECH_LABEL[CURTAILMENT_SOLAR] = 'Solar'
