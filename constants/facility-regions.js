// Centre of AU states and territories provided by: https://www.ga.gov.au/scientific-topics/national-location-information/dimensions/centre-of-australia-states-territories
export const FacilityRegions = [
  {
    id: 'all',
    abbr: 'All',
    label: 'All Regions',
    colour: '#e34a33',
    location: [-25, 133]
  },
  {
    id: 'nem1',
    abbr: 'NEM',
    label: 'NEM',
    colour: '#e34a33',
    location: [-25, 133]
  },
  {
    id: 'nsw1',
    abbr: 'NSW',
    label: 'New South Wales',
    colour: '#24CBF9',
    location: [-32, 147]
  },
  {
    id: 'qld1',
    abbr: 'Qld',
    label: 'Queensland',
    colour: '#E71D36',
    location: [-22, 147]
  },
  {
    id: 'sa1',
    abbr: 'SA',
    label: 'South Australia',
    colour: '#FF9F1C',
    location: [-30, 135]
  },
  {
    id: 'tas1',
    abbr: 'Tas',
    label: 'Tasmania',
    colour: '#5F9E7D',
    location: [-42, 146]
  },
  {
    id: 'vic1',
    abbr: 'Vic',
    label: 'Victoria',
    colour: '#183170',
    location: [-36, 144]
  },
  {
    id: 'wem',
    abbr: 'WA',
    label: 'Western Australia',
    colour: '#000000',
    location: [-25, 122]
  }
]

export function getNEMRegionArray() {
  return FacilityRegions.filter(r => r.id !== 'all' && r.id !== 'wem').map(
    r => r.id
  )
}

export function getFacilityRegionLabel(id) {
  const find = FacilityRegions.find(r => r.id === id)
  return find ? find.label : ''
}

export function getRegionLocationById(id) {
  const region = FacilityRegions.find(r => r.id === id)
  return region ? region.location : null
}
