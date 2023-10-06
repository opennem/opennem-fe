import * as FT from './group-detailed.js'

export const GROUP_LABEL = 'Renewable/Fossil'
export const GROUP_NAME = 'group.renewable-fossil'

export const PUMPS = `${GROUP_NAME}.pumps`
export const BATTERY_CHARGING = `${GROUP_NAME}.battery_charging`
export const EXPORTS = `${GROUP_NAME}.exports`
export const IMPORTS = `${GROUP_NAME}.imports`

export const RENEWABLES = `${GROUP_NAME}.renewables`
export const FOSSILS = `${GROUP_NAME}.fossils`
export const BATTERY_DISCHARGING = `${GROUP_NAME}.battery_discharging`

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
FUEL_TECH_GROUP[FOSSILS] = [
  FT.GAS_RECIP,
  FT.GAS_OCGT,
  FT.GAS_CCGT,
  FT.GAS_STEAM,
  FT.GAS_LFG,
  FT.GAS_WCMG,
  FT.DISTILLATE,
  FT.COAL_BROWN,
  FT.COAL_BLACK
]
FUEL_TECH_GROUP[BATTERY_DISCHARGING] = [FT.BATTERY_DISCHARGING]

// Fuel tech group order
export const FUEL_TECH_ORDER = [
  BATTERY_CHARGING,
  PUMPS,
  EXPORTS,
  IMPORTS,
  BATTERY_DISCHARGING,
  FOSSILS,
  RENEWABLES
]

// Fuel tech group colour
export const FUEL_TECH_GROUP_COLOUR = {}
FUEL_TECH_GROUP_COLOUR[PUMPS] = '#88AFD0'
FUEL_TECH_GROUP_COLOUR[BATTERY_CHARGING] = '#B2DAEF'
FUEL_TECH_GROUP_COLOUR[EXPORTS] = '#977AB1'
FUEL_TECH_GROUP_COLOUR[IMPORTS] = '#44146F'
FUEL_TECH_GROUP_COLOUR[RENEWABLES] = '#52BCA3'
FUEL_TECH_GROUP_COLOUR[FOSSILS] = '#444'
FUEL_TECH_GROUP_COLOUR[BATTERY_DISCHARGING] = '#00A2FA'

// Fuel tech type
const LOAD = 'load'
const SOURCE = 'source'
export const FUEL_TECH_CATEGORY = {}
FUEL_TECH_CATEGORY[PUMPS] = LOAD
FUEL_TECH_CATEGORY[BATTERY_CHARGING] = LOAD
FUEL_TECH_CATEGORY[EXPORTS] = LOAD
FUEL_TECH_CATEGORY[IMPORTS] = SOURCE
FUEL_TECH_CATEGORY[RENEWABLES] = SOURCE
FUEL_TECH_CATEGORY[FOSSILS] = SOURCE
FUEL_TECH_CATEGORY[BATTERY_DISCHARGING] = SOURCE

// Fuel tech label
export const FUEL_TECH_LABEL = {}
FUEL_TECH_LABEL[PUMPS] = 'Pumps'
FUEL_TECH_LABEL[BATTERY_CHARGING] = 'Battery (Charging)'
FUEL_TECH_LABEL[EXPORTS] = 'Exports'
FUEL_TECH_LABEL[IMPORTS] = 'Imports'
FUEL_TECH_LABEL[RENEWABLES] = 'Renewables'
FUEL_TECH_LABEL[FOSSILS] = 'Fossils'
FUEL_TECH_LABEL[BATTERY_DISCHARGING] = 'Battery (Discharging)'
