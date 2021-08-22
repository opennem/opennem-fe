export const FACILITY_LESS_THAN_1_MW = 'LESS_THAN_1_MW'
export const FACILITY_1_TO_5_MW = '1_TO_5_MW'
export const FACILITY_5_TO_30_MW = '5_TO_30_MW'
export const FACILITY_MORE_THAN_30_MW = 'MORE_THAN_30_MW'

export const FACILITY_SIZE = {}
FACILITY_SIZE[FACILITY_LESS_THAN_1_MW] = val => val < 1
FACILITY_SIZE[FACILITY_1_TO_5_MW] = val => val >= 1 && val <= 5
FACILITY_SIZE[FACILITY_5_TO_30_MW] = val => val > 5 && val <= 30
FACILITY_SIZE[FACILITY_MORE_THAN_30_MW] = val => val > 30

export const FacilitySize = [
  {
    id: FACILITY_LESS_THAN_1_MW,
    label: '< 1MW'
  },
  {
    id: FACILITY_1_TO_5_MW,
    label: '1 – 5MW'
  },
  {
    id: FACILITY_5_TO_30_MW,
    label: '5 – 30MW'
  },
  {
    id: FACILITY_MORE_THAN_30_MW,
    label: '> 30MW'
  }
]

export function getFacilitySizeLabelById(id) {
  const find = FacilitySize.find(s => s.id === id)
  return find ? find.label : ''
}

export function isValidFacilitySize(id) {
  const find = FacilitySize.find(s => s.id === id)
  return find ? true : false
}
