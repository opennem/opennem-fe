import * as FT from './group-detailed.js'

export const GROUP_LABEL = 'Detailed (Prev)'
export const GROUP_NAME = 'group.detailed-prev'

export const PUMPS = `${GROUP_NAME}.pumps`
export const BATTERY_CHARGING = `${GROUP_NAME}.battery_charging`
export const EXPORTS = `${GROUP_NAME}.exports`
export const IMPORTS = `${GROUP_NAME}.imports`
export const COAL_BROWN = `${GROUP_NAME}.coal_brown`
export const COAL_BLACK = `${GROUP_NAME}.coal_black`
export const BIOENERGY_BIOMASS = `${GROUP_NAME}.bioenergy_biomass`
export const BIOENERGY_BIOGAS = `${GROUP_NAME}.bioenergy_biogas`
export const DISTILLATE = `${GROUP_NAME}.distillate`
export const GAS_STEAM = `${GROUP_NAME}.gas_steam`
export const GAS_CCGT = `${GROUP_NAME}.gas_ccgt`
export const GAS_OCGT = `${GROUP_NAME}.gas_ocgt`
export const GAS_RECIP = `${GROUP_NAME}.gas_recip`
export const GAS_LFG = `${GROUP_NAME}.gas_lfg' // deprecat`
export const GAS_WCMG = `${GROUP_NAME}.gas_wcmg`
export const BATTERY_DISCHARGING = `${GROUP_NAME}.battery_discharging`
export const HYDRO = `${GROUP_NAME}.hydro`
export const WIND = `${GROUP_NAME}.wind`
export const SOLAR_UTILITY = `${GROUP_NAME}.solar_utility`
export const SOLAR_ROOFTOP = `${GROUP_NAME}.solar_rooftop`

export const FUEL_TECH_GROUP = {}
FUEL_TECH_GROUP[PUMPS] = [FT.PUMPS]
FUEL_TECH_GROUP[BATTERY_CHARGING] = [FT.BATTERY_CHARGING]
FUEL_TECH_GROUP[EXPORTS] = [FT.EXPORTS]
FUEL_TECH_GROUP[IMPORTS] = [FT.IMPORTS]
FUEL_TECH_GROUP[BIOENERGY_BIOMASS] = [FT.BIOENERGY_BIOMASS]
FUEL_TECH_GROUP[BIOENERGY_BIOGAS] = [FT.BIOENERGY_BIOGAS]
FUEL_TECH_GROUP[DISTILLATE] = [FT.DISTILLATE]
FUEL_TECH_GROUP[BATTERY_DISCHARGING] = [FT.BATTERY_DISCHARGING]
FUEL_TECH_GROUP[HYDRO] = [FT.HYDRO]
FUEL_TECH_GROUP[WIND] = [FT.WIND]

FUEL_TECH_GROUP[COAL_BROWN] = [
  FT.COAL_BROWN,
]
FUEL_TECH_GROUP[COAL_BLACK] = [
  FT.COAL_BLACK
]

FUEL_TECH_GROUP[GAS_STEAM] = [
  FT.GAS_STEAM
]
FUEL_TECH_GROUP[GAS_CCGT] = [
  FT.GAS_CCGT
]
FUEL_TECH_GROUP[GAS_OCGT] = [
  FT.GAS_OCGT
]
FUEL_TECH_GROUP[GAS_RECIP] = [
  FT.GAS_RECIP
]
FUEL_TECH_GROUP[GAS_LFG] = [
  FT.GAS_LFG
]
FUEL_TECH_GROUP[GAS_WCMG] = [
  FT.GAS_WCMG
]

FUEL_TECH_GROUP[SOLAR_UTILITY] = [
  FT.SOLAR_UTILITY
]
FUEL_TECH_GROUP[SOLAR_ROOFTOP] = [
  FT.SOLAR_ROOFTOP
]

// Fuel tech default order
export const FUEL_TECH_ORDER = [
  
  BATTERY_CHARGING,
  PUMPS,
  EXPORTS,
  IMPORTS,
  COAL_BROWN,
  COAL_BLACK,
  BIOENERGY_BIOGAS,
  BIOENERGY_BIOMASS,
  DISTILLATE,
  GAS_STEAM,
  GAS_CCGT,
  GAS_OCGT,
  GAS_RECIP,
  GAS_LFG,
  GAS_WCMG,
  BATTERY_DISCHARGING,
  HYDRO,
  WIND,
  SOLAR_UTILITY,
  SOLAR_ROOFTOP

]

// Fuel tech colour
export const FUEL_TECH_GROUP_COLOUR = {}
FUEL_TECH_GROUP_COLOUR[PUMPS] = '#88AFD0'
FUEL_TECH_GROUP_COLOUR[BATTERY_CHARGING] = '#B2DAEF'
FUEL_TECH_GROUP_COLOUR[EXPORTS] = '#977AB1'
FUEL_TECH_GROUP_COLOUR[IMPORTS] = '#44146F'
FUEL_TECH_GROUP_COLOUR[COAL_BROWN] = '#8B572A'
FUEL_TECH_GROUP_COLOUR[COAL_BLACK] = '#121212'
FUEL_TECH_GROUP_COLOUR[BIOENERGY_BIOGAS] = '#4CB9B9'
FUEL_TECH_GROUP_COLOUR[BIOENERGY_BIOMASS] = '#1D7A7A'
FUEL_TECH_GROUP_COLOUR[DISTILLATE] = '#F35020'
FUEL_TECH_GROUP_COLOUR[GAS_STEAM] = '#F48E1B'
FUEL_TECH_GROUP_COLOUR[GAS_CCGT] = '#FDB462'
FUEL_TECH_GROUP_COLOUR[GAS_OCGT] = '#FFCD96'
FUEL_TECH_GROUP_COLOUR[GAS_RECIP] = '#F9DCBC'
FUEL_TECH_GROUP_COLOUR[GAS_LFG] = '#DD8018'
FUEL_TECH_GROUP_COLOUR[GAS_WCMG] = '#B46813'
FUEL_TECH_GROUP_COLOUR[BATTERY_DISCHARGING] = '#00A2FA'
FUEL_TECH_GROUP_COLOUR[HYDRO] = '#4582B4'
FUEL_TECH_GROUP_COLOUR[WIND] = '#417505'
FUEL_TECH_GROUP_COLOUR[SOLAR_UTILITY] = '#FED500'
FUEL_TECH_GROUP_COLOUR[SOLAR_ROOFTOP] = '#FFE03D'

// Fuel tech type
export const LOAD = 'load'
export const SOURCE = 'source'
export const FUEL_TECH_CATEGORY = {}
FUEL_TECH_CATEGORY[PUMPS] = LOAD
FUEL_TECH_CATEGORY[BATTERY_CHARGING] = LOAD
FUEL_TECH_CATEGORY[EXPORTS] = LOAD
FUEL_TECH_CATEGORY[IMPORTS] = SOURCE
FUEL_TECH_CATEGORY[COAL_BROWN] = SOURCE
FUEL_TECH_CATEGORY[COAL_BLACK] = SOURCE
FUEL_TECH_CATEGORY[BIOENERGY_BIOGAS] = SOURCE
FUEL_TECH_CATEGORY[BIOENERGY_BIOMASS] = SOURCE
FUEL_TECH_CATEGORY[DISTILLATE] = SOURCE
FUEL_TECH_CATEGORY[GAS_STEAM] = SOURCE
FUEL_TECH_CATEGORY[GAS_CCGT] = SOURCE
FUEL_TECH_CATEGORY[GAS_OCGT] = SOURCE
FUEL_TECH_CATEGORY[GAS_RECIP] = SOURCE
FUEL_TECH_CATEGORY[GAS_LFG] = SOURCE
FUEL_TECH_CATEGORY[GAS_WCMG] = SOURCE
FUEL_TECH_CATEGORY[BATTERY_DISCHARGING] = SOURCE
FUEL_TECH_CATEGORY[HYDRO] = SOURCE
FUEL_TECH_CATEGORY[WIND] = SOURCE
FUEL_TECH_CATEGORY[SOLAR_UTILITY] = SOURCE
FUEL_TECH_CATEGORY[SOLAR_ROOFTOP] = SOURCE

// Fuel tech label
export const FUEL_TECH_LABEL = {}
FUEL_TECH_LABEL[PUMPS] = 'Pumps'
FUEL_TECH_LABEL[BATTERY_CHARGING] = 'Battery (Charging)'
FUEL_TECH_LABEL[EXPORTS] = 'Exports'
FUEL_TECH_LABEL[IMPORTS] = 'Imports'
FUEL_TECH_LABEL[COAL_BROWN] = 'Coal (Brown)'
FUEL_TECH_LABEL[COAL_BLACK] = 'Coal (Black)'
FUEL_TECH_LABEL[BIOENERGY_BIOGAS] = 'Bioenergy (Biogas)'
FUEL_TECH_LABEL[BIOENERGY_BIOMASS] = 'Bioenergy (Biomass)'
FUEL_TECH_LABEL[DISTILLATE] = 'Distillate'
FUEL_TECH_LABEL[GAS_STEAM] = 'Gas (Steam)'
FUEL_TECH_LABEL[GAS_CCGT] = 'Gas (CCGT)'
FUEL_TECH_LABEL[GAS_OCGT] = 'Gas (OCGT)'
FUEL_TECH_LABEL[GAS_RECIP] = 'Gas (Reciprocating)'
FUEL_TECH_LABEL[GAS_LFG] = 'Gas (Landfill)'
FUEL_TECH_LABEL[GAS_WCMG] = 'Gas (Waste Coal Mine)'
FUEL_TECH_LABEL[BATTERY_DISCHARGING] = 'Battery (Discharging)'
FUEL_TECH_LABEL[HYDRO] = 'Hydro'
FUEL_TECH_LABEL[WIND] = 'Wind'
FUEL_TECH_LABEL[SOLAR_UTILITY] = 'Solar (Utility)'
FUEL_TECH_LABEL[SOLAR_ROOFTOP] = 'Solar (Rooftop)'

export const FUEL_TECH_SHORT_LABEL = {}
FUEL_TECH_SHORT_LABEL[BATTERY_CHARGING] = 'Charging'
FUEL_TECH_SHORT_LABEL[BATTERY_DISCHARGING] = 'Discharging'

