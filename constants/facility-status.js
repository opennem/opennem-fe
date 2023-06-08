export const FACILITY_COMMITTED = 'committed'
export const FACILITY_OPERATING = 'operating'
export const FACILITY_RETIRED = 'retired'

export const FacilityStatus = [
  {
    id: FACILITY_COMMITTED,
    label: 'Committed'
  },
  {
    id: FACILITY_OPERATING,
    label: 'Operating'
  },
  {
    id: FACILITY_RETIRED,
    label: 'Retired'
  }
]

export function getFacilityStatusLabelById(id) {
  const find = FacilityStatus.find((s) => s.id === id)
  return find ? find.label : ''
}

export function isValidFacilityStatus(id) {
  const find = FacilityStatus.find((s) => s.id === id)
  return find ? true : false
}
