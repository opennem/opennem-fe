import * as FT from './group-detailed.js'

export const GROUP_LABEL = 'Flexibility'
export const GROUP_NAME = 'group.flexibility'

export const PUMPS = `${GROUP_NAME}.pumps`
export const BATTERY_CHARGING = `${GROUP_NAME}.battery_charging`
export const EXPORTS = `${GROUP_NAME}.exports`
export const IMPORTS = `${GROUP_NAME}.imports`

export const VARIABLE = `${GROUP_NAME}.variable`
export const FAST_FLEXIBLE = `${GROUP_NAME}.fast_flexible`
export const SLOW_FLEXIBLE = `${GROUP_NAME}.slow_flexible`

export const FUEL_TECH_GROUP = {}
FUEL_TECH_GROUP[PUMPS] = [FT.PUMPS]
FUEL_TECH_GROUP[BATTERY_CHARGING] = [FT.BATTERY_CHARGING]
FUEL_TECH_GROUP[EXPORTS] = [FT.EXPORTS]
FUEL_TECH_GROUP[IMPORTS] = [FT.IMPORTS]
FUEL_TECH_GROUP[VARIABLE] = [
  FT.SOLAR_UTILITY,
  FT.SOLAR_ROOFTOP,
  FT.WIND
]
FUEL_TECH_GROUP[FAST_FLEXIBLE] = [
  FT.HYDRO,
  FT.GAS_RECIP,
  FT.GAS_OCGT,
  FT.GAS_CCGT,
  FT.GAS_LFG,
  FT.GAS_WCMG,
  FT.DISTILLATE,
  FT.BATTERY_DISCHARGING
]
FUEL_TECH_GROUP[SLOW_FLEXIBLE] = [
  FT.COAL_BROWN,
  FT.COAL_BLACK,
  FT.BIOENERGY_BIOMASS,
  FT.BIOENERGY_BIOGAS,
  FT.GAS_STEAM
]

// Fuel tech group order
export const FUEL_TECH_ORDER = [
  BATTERY_CHARGING,
  PUMPS,
  EXPORTS,
  IMPORTS,
  SLOW_FLEXIBLE,
  FAST_FLEXIBLE,
  VARIABLE
]

// Fuel tech group colour
export const FUEL_TECH_GROUP_COLOUR = {}
FUEL_TECH_GROUP_COLOUR[PUMPS] = '#00A5F1'
FUEL_TECH_GROUP_COLOUR[BATTERY_CHARGING] = '#4F5FD7'
FUEL_TECH_GROUP_COLOUR[EXPORTS] = '#722AF7'
FUEL_TECH_GROUP_COLOUR[IMPORTS] = '#CFA7FF'
FUEL_TECH_GROUP_COLOUR[VARIABLE] = '#52A972'
FUEL_TECH_GROUP_COLOUR[FAST_FLEXIBLE] = '#2C3DC2'
FUEL_TECH_GROUP_COLOUR[SLOW_FLEXIBLE] = '#E78114'

// Fuel tech type
const LOAD = 'load'
const SOURCE = 'source'
export const FUEL_TECH_CATEGORY = {}
FUEL_TECH_CATEGORY[PUMPS] = LOAD
FUEL_TECH_CATEGORY[BATTERY_CHARGING] = LOAD
FUEL_TECH_CATEGORY[EXPORTS] = LOAD
FUEL_TECH_CATEGORY[IMPORTS] = SOURCE
FUEL_TECH_CATEGORY[VARIABLE] = SOURCE
FUEL_TECH_CATEGORY[FAST_FLEXIBLE] = SOURCE
FUEL_TECH_CATEGORY[SLOW_FLEXIBLE] = SOURCE

// Fuel tech label
export const FUEL_TECH_LABEL = {}
FUEL_TECH_LABEL[PUMPS] = 'Pumps'
FUEL_TECH_LABEL[BATTERY_CHARGING] = 'Battery (Charging)'
FUEL_TECH_LABEL[EXPORTS] = 'Exports'
FUEL_TECH_LABEL[IMPORTS] = 'Imports'
FUEL_TECH_LABEL[VARIABLE] = 'Variable'
FUEL_TECH_LABEL[FAST_FLEXIBLE] = 'Fast flexible'
FUEL_TECH_LABEL[SLOW_FLEXIBLE] = 'Slow flexible'
