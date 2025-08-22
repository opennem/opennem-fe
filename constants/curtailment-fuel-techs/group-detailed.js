export const GROUP_LABEL = 'Detailed'
export const GROUP_NAME = 'detailed'

export const CURTAILMENT_WIND = 'curtailment_wind'
export const CURTAILMENT_SOLAR = 'curtailment_solar'

// Fuel tech default order
export const DEFAULT_FUEL_TECH_ORDER = [
  CURTAILMENT_SOLAR,
  CURTAILMENT_WIND,
]

// Fuel tech colour
export const DEFAULT_FUEL_TECH_COLOUR = {}
DEFAULT_FUEL_TECH_COLOUR[CURTAILMENT_WIND] = '#2C7629'
DEFAULT_FUEL_TECH_COLOUR[CURTAILMENT_SOLAR] = '#FED500'

// Fuel tech type
export const LOAD = 'load'
export const SOURCE = 'source'
export const FUEL_TECH_CATEGORY = {}
FUEL_TECH_CATEGORY[CURTAILMENT_WIND] = SOURCE
FUEL_TECH_CATEGORY[CURTAILMENT_SOLAR] = SOURCE

export const FUEL_TECH_RENEWABLE = {}
FUEL_TECH_RENEWABLE[CURTAILMENT_WIND] = true
FUEL_TECH_RENEWABLE[CURTAILMENT_SOLAR] = true

// Fuel tech label
export const FUEL_TECH_LABEL = {}
FUEL_TECH_LABEL[CURTAILMENT_WIND] = 'Wind'
FUEL_TECH_LABEL[CURTAILMENT_SOLAR] = 'Solar'

export const FUEL_TECH_SHORT_LABEL = {}

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

export function isValidFuelTech(fuelTech) {
  return FUEL_TECH_LABEL[fuelTech] !== undefined
}
