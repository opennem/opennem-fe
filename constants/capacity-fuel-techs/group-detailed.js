export const GROUP_LABEL = 'Detailed'
export const GROUP_NAME = 'detailed'

export const PUMPS = 'pumps'
export const BATTERY_CHARGING = 'battery_charging'
export const EXPORTS = 'exports'
export const IMPORTS = 'imports'
export const COAL_BROWN = 'coal_brown'
export const COAL_BLACK = 'coal_black'
export const BIOENERGY_BIOMASS = 'bioenergy_biomass'
export const BIOENERGY_BIOGAS = 'bioenergy_biogas'
export const DISTILLATE = 'distillate'
export const GAS_STEAM = 'gas_steam'
export const GAS_CCGT = 'gas_ccgt'
export const GAS_OCGT = 'gas_ocgt'
export const GAS_RECIP = 'gas_recip'
export const GAS_LFG = 'gas_lfg' // deprecate
export const GAS_WCMG = 'gas_wcmg'
export const BATTERY_DISCHARGING = 'battery_discharging'
export const BATTERY = 'battery'
export const HYDRO = 'hydro'
export const WIND = 'wind'
export const SOLAR_UTILITY = 'solar_utility'
export const SOLAR_ROOFTOP = 'solar_rooftop'

// Fuel tech default order
export const DEFAULT_FUEL_TECH_ORDER = [
  SOLAR_ROOFTOP,
  SOLAR_UTILITY,
  WIND,
  HYDRO,
  PUMPS,
  BATTERY_DISCHARGING,
  BATTERY,
  GAS_WCMG,
  GAS_LFG,
  GAS_RECIP,
  GAS_OCGT,
  GAS_CCGT,
  GAS_STEAM,
  DISTILLATE,
  BIOENERGY_BIOMASS,
  BIOENERGY_BIOGAS,
  COAL_BLACK,
  COAL_BROWN,
  IMPORTS,
  EXPORTS,
  BATTERY_CHARGING
]

// Fuel tech colour
export const DEFAULT_FUEL_TECH_COLOUR = {}
DEFAULT_FUEL_TECH_COLOUR[PUMPS] = '#88AFD0' // 00A5F1
DEFAULT_FUEL_TECH_COLOUR[BATTERY_CHARGING] = '#577CFF'
DEFAULT_FUEL_TECH_COLOUR[EXPORTS] = '#927BAD' // 722AF7
DEFAULT_FUEL_TECH_COLOUR[IMPORTS] = '#521986' // CFA7FF
DEFAULT_FUEL_TECH_COLOUR[COAL_BROWN] = '#744A26'
DEFAULT_FUEL_TECH_COLOUR[COAL_BLACK] = '#121212'
DEFAULT_FUEL_TECH_COLOUR[BIOENERGY_BIOGAS] = '#4CB9B9'
DEFAULT_FUEL_TECH_COLOUR[BIOENERGY_BIOMASS] = '#1D7A7A'
DEFAULT_FUEL_TECH_COLOUR[DISTILLATE] = '#E15C34'
DEFAULT_FUEL_TECH_COLOUR[GAS_STEAM] = '#F48E1B'
DEFAULT_FUEL_TECH_COLOUR[GAS_CCGT] = '#FDB462'
DEFAULT_FUEL_TECH_COLOUR[GAS_OCGT] = '#FFCD96'
DEFAULT_FUEL_TECH_COLOUR[GAS_RECIP] = '#F9DCBC'
DEFAULT_FUEL_TECH_COLOUR[GAS_LFG] = '#CF4B09'
DEFAULT_FUEL_TECH_COLOUR[GAS_WCMG] = '#B46813'
DEFAULT_FUEL_TECH_COLOUR[BATTERY_DISCHARGING] = '#3245c9'
DEFAULT_FUEL_TECH_COLOUR[BATTERY] = '#3245c9'
DEFAULT_FUEL_TECH_COLOUR[HYDRO] = '#5EA0C0' // ACE9FE
DEFAULT_FUEL_TECH_COLOUR[WIND] = '#2C7629'
DEFAULT_FUEL_TECH_COLOUR[SOLAR_UTILITY] = '#FED500'
DEFAULT_FUEL_TECH_COLOUR[SOLAR_ROOFTOP] = '#FFF58D'

// Fuel tech type
export const LOAD = 'load'
export const SOURCE = 'source'
export const FUEL_TECH_CATEGORY = {}
FUEL_TECH_CATEGORY[PUMPS] = SOURCE
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
FUEL_TECH_CATEGORY[BATTERY] = SOURCE
FUEL_TECH_CATEGORY[HYDRO] = SOURCE
FUEL_TECH_CATEGORY[WIND] = SOURCE
FUEL_TECH_CATEGORY[SOLAR_UTILITY] = SOURCE
FUEL_TECH_CATEGORY[SOLAR_ROOFTOP] = SOURCE

export const FUEL_TECH_RENEWABLE = {}
FUEL_TECH_RENEWABLE[PUMPS] = true
FUEL_TECH_RENEWABLE[BATTERY_CHARGING] = false
FUEL_TECH_RENEWABLE[EXPORTS] = false
FUEL_TECH_RENEWABLE[IMPORTS] = false
FUEL_TECH_RENEWABLE[COAL_BROWN] = false
FUEL_TECH_RENEWABLE[COAL_BLACK] = false
FUEL_TECH_RENEWABLE[BIOENERGY_BIOGAS] = true
FUEL_TECH_RENEWABLE[BIOENERGY_BIOMASS] = true
FUEL_TECH_RENEWABLE[DISTILLATE] = false
FUEL_TECH_RENEWABLE[GAS_STEAM] = false
FUEL_TECH_RENEWABLE[GAS_CCGT] = false
FUEL_TECH_RENEWABLE[GAS_OCGT] = false
FUEL_TECH_RENEWABLE[GAS_RECIP] = false
FUEL_TECH_RENEWABLE[GAS_LFG] = false
FUEL_TECH_RENEWABLE[GAS_WCMG] = false
FUEL_TECH_RENEWABLE[BATTERY_DISCHARGING] = false
FUEL_TECH_RENEWABLE[BATTERY] = false
FUEL_TECH_RENEWABLE[HYDRO] = true
FUEL_TECH_RENEWABLE[WIND] = true
FUEL_TECH_RENEWABLE[SOLAR_UTILITY] = true
FUEL_TECH_RENEWABLE[SOLAR_ROOFTOP] = true

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
FUEL_TECH_LABEL[BATTERY] = 'Battery'
FUEL_TECH_LABEL[HYDRO] = 'Hydro'
FUEL_TECH_LABEL[WIND] = 'Wind'
FUEL_TECH_LABEL[SOLAR_UTILITY] = 'Solar (Utility)'
FUEL_TECH_LABEL[SOLAR_ROOFTOP] = 'Solar (Rooftop)'

export const FUEL_TECH_SHORT_LABEL = {}
FUEL_TECH_SHORT_LABEL[BATTERY_CHARGING] = 'Charging'
FUEL_TECH_SHORT_LABEL[BATTERY_DISCHARGING] = 'Discharging'
FUEL_TECH_SHORT_LABEL[BATTERY] = 'Battery'
export function getFuelTechObjs(fuelTechs, type) {
  return Object.keys(fuelTechs).map((ft) => {
    return {
      id: fuelTechs[ft],
      domain: fuelTechs[ft],
      fuelTech: ft,
      label: FUEL_TECH_LABEL[ft],
      colour: DEFAULT_FUEL_TECH_COLOUR[ft],
      category: FUEL_TECH_CATEGORY[ft],
      renewable: FUEL_TECH_RENEWABLE[ft],
      type
    }
  })
}

export function isNetFuelTech(fuelTech) {
  return (
    fuelTech === BATTERY_CHARGING ||
    fuelTech === BATTERY_DISCHARGING ||
    fuelTech === BATTERY ||
    fuelTech === HYDRO ||
    fuelTech === PUMPS ||
    fuelTech === EXPORTS ||
    fuelTech === IMPORTS
  )
}

export function isCoal(fuelTech) {
  return (
    fuelTech === COAL_BROWN ||
    fuelTech === COAL_BLACK
  )
}

export function isGas(fuelTech) {
  return (
    fuelTech === GAS_STEAM ||
    fuelTech === GAS_CCGT ||
    fuelTech === GAS_OCGT ||
    fuelTech === GAS_RECIP ||
    fuelTech === GAS_LFG ||
    fuelTech === GAS_WCMG
  )
}

export function isWind(fuelTech) {
  return fuelTech === WIND
}

export function isHydro(fuelTech) {
  return fuelTech === HYDRO
}

export function isSolar(fuelTech) {
  return (
    fuelTech === SOLAR_UTILITY ||
    fuelTech === SOLAR_ROOFTOP
  )
}

export function isLoad(fuelTech) {
  return (
    fuelTech === BATTERY_CHARGING ||
    fuelTech === IMPORTS ||
    fuelTech === EXPORTS
  )
}

export function isValidFuelTech(fuelTech) {
  return FUEL_TECH_LABEL[fuelTech] !== undefined
}
