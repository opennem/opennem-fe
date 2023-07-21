import _cloneDeep from 'lodash.clonedeep'

export const ENERGY_AU = 'au'
export const ENERGY_NEM = 'nem'
export const ENERGY_NSW = 'nsw1'
export const ENERGY_QLD = 'qld1'
export const ENERGY_SA = 'sa1'
export const ENERGY_TAS = 'tas1'
export const ENERGY_VIC = 'vic1'
export const ENERGY_WEM = 'wem'

const EnergyRegions = [
  {
    id: ENERGY_AU,
    abbr: 'All',
    label: 'All Regions',
    colour: '#e34a33',
    timezoneString: 'AEST'
  },
  {
    id: ENERGY_NEM,
    abbr: 'NEM',
    label: 'NEM',
    colour: '#e34a33',
    timezoneString: 'AEST'
  },
  {
    id: ENERGY_NSW,
    abbr: 'NSW',
    label: 'New South Wales',
    colour: '#49A4E8',
    timezoneString: 'AEST',
    parentRegion: ENERGY_NEM,
    parentFirstChild: true
  },
  {
    id: ENERGY_QLD,
    abbr: 'Qld',
    label: 'Queensland',
    colour: '#DC3A33',
    timezoneString: 'AEST',
    parentRegion: ENERGY_NEM
  },
  {
    id: ENERGY_SA,
    abbr: 'SA',
    label: 'South Australia',
    colour: '#F8D35B',
    timezoneString: 'AEST',
    parentRegion: ENERGY_NEM
  },
  {
    id: ENERGY_TAS,
    abbr: 'Tas',
    label: 'Tasmania',
    colour: '#65C7AA',
    timezoneString: 'AEST',
    parentRegion: ENERGY_NEM
  },
  {
    id: ENERGY_VIC,
    abbr: 'Vic',
    label: 'Victoria',
    colour: '#153BA5',
    timezoneString: 'AEST',
    parentRegion: ENERGY_NEM,
    parentLastChild: true
  },
  {
    id: ENERGY_WEM,
    abbr: 'WA',
    label: 'Western Australia (SWIS)',
    colour: '#877BCD',
    timezoneString: 'AWST'
  }
]

export function getEnergyRegions() {
  return _cloneDeep(EnergyRegions)
}

export function getAuRegions() {
  return EnergyRegions.map(d => {
    return {
      ...d,
      domain: d.id
    }
  }).filter(
    d => d.id === ENERGY_NSW ||
      d.id === ENERGY_QLD ||
      d.id === ENERGY_SA ||
      d.id === ENERGY_TAS ||
      d.id === ENERGY_VIC ||
      d.id === ENERGY_WEM
    )
}

export function getEnergyRegionLabel(id) {
  const find = EnergyRegions.find((r) => r.id === id)
  return find ? find.label : ''
}

export function isValidRegion(id) {
  // if (id === ENERGY_AU) return false
  const find = EnergyRegions.find((r) => r.id === id)
  return find ? true : false
}
