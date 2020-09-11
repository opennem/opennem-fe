import { lsGet, lsSet } from '~/services/LocalStorage'

const MutationTypes = {
  FEATURE_TOGGLE_EMISSIONS: 'FEATURE_TOGGLE_EMISSIONS',
  FEATURE_TOGGLE_REGION_COMPARE: 'FEATURE_TOGGLE_REGION_COMPARE',
  FEATURE_TOGGLE_WEM_ENERGY: 'FEATURE_TOGGLE_WEM_ENERGY'
}

const emissions = lsGet(MutationTypes.FEATURE_TOGGLE_EMISSIONS)
const regionCompare = lsGet(MutationTypes.FEATURE_TOGGLE_REGION_COMPARE)
const wemEnergy = lsGet(MutationTypes.FEATURE_TOGGLE_WEM_ENERGY)

if (!emissions) lsSet(MutationTypes.FEATURE_TOGGLE_EMISSIONS, false)
if (!regionCompare) lsSet(MutationTypes.FEATURE_TOGGLE_REGION_COMPARE, false)
if (!wemEnergy) lsSet(MutationTypes.FEATURE_TOGGLE_WEM_ENERGY, false)

export const state = () => ({
  emissions,
  regionCompare,
  wemEnergy
})

export const getters = {
  emissions: state => state.emissions,
  regionCompare: state => state.regionCompare,
  wemEnergy: state => state.wemEnergy
}

export const mutations = {
  emissions(state, emissions) {
    lsSet(MutationTypes.FEATURE_TOGGLE_EMISSIONS, emissions)
    state.emissions = emissions
  },
  regionCompare(state, regionCompare) {
    lsSet(MutationTypes.FEATURE_TOGGLE_REGION_COMPARE, regionCompare)
    state.regionCompare = regionCompare
  },
  wemEnergy(state, wemEnergy) {
    lsSet(MutationTypes.FEATURE_TOGGLE_WEM_ENERGY, wemEnergy)
    state.wemEnergy = wemEnergy
  }
}

export const actions = {}
