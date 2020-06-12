import { lsGet, lsSet } from '~/services/LocalStorage'

const MutationTypes = {
  FEATURE_TOGGLE_EMISSIONS: 'FEATURE_TOGGLE_EMISSIONS',
  FEATURE_TOGGLE_REGION_COMPARE: 'FEATURE_TOGGLE_REGION_COMPARE'
}

const emissions = lsGet(MutationTypes.FEATURE_TOGGLE_EMISSIONS)
const regionCompare = lsGet(MutationTypes.FEATURE_TOGGLE_REGION_COMPARE)

if (!emissions) lsSet(MutationTypes.FEATURE_TOGGLE_EMISSIONS, false)
if (!regionCompare) lsSet(MutationTypes.FEATURE_TOGGLE_REGION_COMPARE, false)

export const state = () => ({
  emissions,
  regionCompare
})

export const getters = {
  emissions: state => state.emissions,
  regionCompare: state => state.regionCompare
}

export const mutations = {
  emissions(state, emissions) {
    lsSet(MutationTypes.FEATURE_TOGGLE_EMISSIONS, emissions)
    state.emissions = emissions
  },
  regionCompare(state, regionCompare) {
    lsSet(MutationTypes.FEATURE_TOGGLE_REGION_COMPARE, regionCompare)
    state.regionCompare = regionCompare
  }
}

export const actions = {}
