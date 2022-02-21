import _cloneDeep from 'lodash.clonedeep'

export const EMISSIONS_AU = 'emissions-au'
export const EMISSIONS_WORLD = 'emissions-world'

const EmissionsRegions = [
  {
    id: EMISSIONS_AU,
    abbr: 'AU',
    label: 'Australia'
  },
  {
    id: EMISSIONS_WORLD,
    abbr: 'World',
    label: 'World'
  }
]

export function getEmissionsRegions() {
  return _cloneDeep(EmissionsRegions)
}

export function getEmissionsRegionLabel(id) {
  const find = EmissionsRegions.find(r => r.id === id)
  return find ? find.label : ''
}
