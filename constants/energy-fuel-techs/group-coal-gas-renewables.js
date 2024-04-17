import * as FT from './group-detailed.js'

export const GROUP_NAME = 'group.coal-gas-renewables'

export const PUMPS = `${GROUP_NAME}.pumps`
export const BATTERY_CHARGING = `${GROUP_NAME}.battery_charging`
export const EXPORTS = `${GROUP_NAME}.exports`
export const IMPORTS = `${GROUP_NAME}.imports`

export const RENEWABLES = `${GROUP_NAME}.renewables`
export const DISTILLATE = `${GROUP_NAME}.distillate`
export const BATTERY_DISCHARGING = `${GROUP_NAME}.battery_discharging`
export const COAL = `${GROUP_NAME}.coal`
export const GAS = `${GROUP_NAME}.gas`

export const FUEL_TECH_GROUP = {}
FUEL_TECH_GROUP[PUMPS] = [FT.PUMPS]
FUEL_TECH_GROUP[BATTERY_CHARGING] = [FT.BATTERY_CHARGING]
FUEL_TECH_GROUP[EXPORTS] = [FT.EXPORTS]
FUEL_TECH_GROUP[IMPORTS] = [FT.IMPORTS]
FUEL_TECH_GROUP[RENEWABLES] = [
  FT.SOLAR_UTILITY,
  FT.SOLAR_ROOFTOP,
  FT.WIND,
  FT.HYDRO,
  FT.BIOENERGY_BIOMASS,
  FT.BIOENERGY_BIOGAS
]
FUEL_TECH_GROUP[DISTILLATE] = [FT.DISTILLATE]
FUEL_TECH_GROUP[BATTERY_DISCHARGING] = [FT.BATTERY_DISCHARGING]
FUEL_TECH_GROUP[COAL] = [
  FT.COAL_BROWN,
  FT.COAL_BLACK
]
FUEL_TECH_GROUP[GAS] = [
  FT.GAS_STEAM,
  FT.GAS_CCGT,
  FT.GAS_OCGT,
  FT.GAS_RECIP,
  FT.GAS_LFG,
  FT.GAS_WCMG
]

// Fuel tech group order
export const FUEL_TECH_ORDER = [
  BATTERY_CHARGING,
  PUMPS,
  EXPORTS,
  IMPORTS,
  COAL,
  DISTILLATE,
  GAS,
  BATTERY_DISCHARGING,
  RENEWABLES
]

// Fuel tech group colour
export const FUEL_TECH_GROUP_COLOUR = {}
FUEL_TECH_GROUP_COLOUR[PUMPS] = '#00A5F1'
FUEL_TECH_GROUP_COLOUR[BATTERY_CHARGING] = '#4F5FD7'
FUEL_TECH_GROUP_COLOUR[EXPORTS] = '#722AF7'
FUEL_TECH_GROUP_COLOUR[IMPORTS] = '#CFA7FF'
FUEL_TECH_GROUP_COLOUR[COAL] = '#251C00'
FUEL_TECH_GROUP_COLOUR[DISTILLATE] = '#E46E56'
FUEL_TECH_GROUP_COLOUR[GAS] = '#E78114'
FUEL_TECH_GROUP_COLOUR[BATTERY_DISCHARGING] = '#3145CE'
FUEL_TECH_GROUP_COLOUR[RENEWABLES] = '#52A972'

// Fuel tech type
const LOAD = 'load'
const SOURCE = 'source'
export const FUEL_TECH_CATEGORY = {}
FUEL_TECH_CATEGORY[PUMPS] = LOAD
FUEL_TECH_CATEGORY[BATTERY_CHARGING] = LOAD
FUEL_TECH_CATEGORY[EXPORTS] = LOAD
FUEL_TECH_CATEGORY[IMPORTS] = SOURCE
FUEL_TECH_CATEGORY[COAL] = SOURCE
FUEL_TECH_CATEGORY[DISTILLATE] = SOURCE
FUEL_TECH_CATEGORY[GAS] = SOURCE
FUEL_TECH_CATEGORY[BATTERY_DISCHARGING] = SOURCE
FUEL_TECH_CATEGORY[RENEWABLES] = SOURCE

// Fuel tech label
export const FUEL_TECH_LABEL = {}
FUEL_TECH_LABEL[PUMPS] = 'Pumps'
FUEL_TECH_LABEL[BATTERY_CHARGING] = 'Battery (Charging)'
FUEL_TECH_LABEL[EXPORTS] = 'Exports'
FUEL_TECH_LABEL[IMPORTS] = 'Imports'
FUEL_TECH_LABEL[COAL] = 'Coal'
FUEL_TECH_LABEL[DISTILLATE] = 'Distillate'
FUEL_TECH_LABEL[GAS] = 'Gas'
FUEL_TECH_LABEL[BATTERY_DISCHARGING] = 'Battery (Discharging)'
FUEL_TECH_LABEL[RENEWABLES] = 'Renewables'
