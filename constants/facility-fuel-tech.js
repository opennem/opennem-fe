import * as FT from '~/constants/energy-fuel-techs/group-default.js'

export const FACILITY_GROUP_SOLAR = 'group_solar'
export const FACILITY_GROUP_WIND = 'group_wind'
export const FACILITY_GROUP_HYDRO = 'group_hydro'
export const FACILITY_GROUP_BATTERY = 'group_battery'
export const FACILITY_GROUP_GAS = 'group_gas'
export const FACILITY_GROUP_DISTILLATE = 'group_distillate'
export const FACILITY_GROUP_BIOENERGY = 'group_bioenergy'
export const FACILITY_GROUP_COAL = 'group_coal'
export const FACILITY_GROUP_PUMPS = 'group_pumps'

export const FacilityGroups = [
  {
    id: FACILITY_GROUP_SOLAR,
    label: 'Solar',
    type: 'source',
    colour: '#F8E71C',
    fields: [FT.SOLAR_UTILITY, FT.SOLAR_ROOFTOP]
  },

  {
    id: FACILITY_GROUP_WIND,
    label: 'Wind',
    type: 'source',
    colour: '#417505',
    fields: [FT.WIND]
  },

  {
    id: FACILITY_GROUP_HYDRO,
    label: 'Hydro',
    type: 'source',
    colour: '#4582B4',
    fields: [FT.HYDRO]
  },

  {
    id: FACILITY_GROUP_BATTERY,
    label: 'Battery (Discharging)',
    type: 'source',
    colour: '#00A2FA',
    fields: [FT.BATTERY_DISCHARGING]
  },

  {
    id: FACILITY_GROUP_GAS,
    label: 'Gas',
    type: 'source',
    colour: '#F48E1B',
    fields: [FT.GAS_RECIP, FT.GAS_OCGT, FT.GAS_CCGT, FT.GAS_STEAM, FT.GAS_WCMG]
  },

  {
    id: FACILITY_GROUP_DISTILLATE,
    label: 'Distillate',
    type: 'source',
    colour: '#F35020',
    fields: [FT.DISTILLATE]
  },

  {
    id: FACILITY_GROUP_BIOENERGY,
    label: 'Bioenergy',
    type: 'source',
    colour: '#4CB9B9',
    fields: [FT.BIOENERGY_BIOMASS, FT.BIOENERGY_BIOGAS]
  },

  {
    id: FACILITY_GROUP_COAL,
    label: 'Coal',
    type: 'source',
    colour: '#131313',
    fields: [FT.COAL_BLACK, FT.COAL_BROWN]
  },

  {
    id: FACILITY_GROUP_PUMPS,
    label: 'Pumps',
    type: 'loads',
    colour: '#88AFD0',
    fields: [FT.PUMPS]
  }
]
