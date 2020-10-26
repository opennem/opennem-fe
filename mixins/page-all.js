import { mapMutations } from 'vuex'
import { lsGet, lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_EMISSIONS,
  FEATURE_TOGGLE_REGION_COMPARE,
  FEATURE_TOGGLE_WEM_ENERGY
} from '@/constants/mutation-types/features.js'

let uuid = 0

export default {
  beforeCreate() {
    this.uuid = uuid.toString()
    uuid += 1
  },
  mounted() {
    if (process.client) {
      const emissions = lsGet(FEATURE_TOGGLE_EMISSIONS)
      const regionCompare = lsGet(FEATURE_TOGGLE_REGION_COMPARE)
      let wemEnergy = lsGet(FEATURE_TOGGLE_WEM_ENERGY)

      if (wemEnergy === 'null') {
        wemEnergy = false
      }

      if (!emissions) lsSet(FEATURE_TOGGLE_EMISSIONS, false)
      if (!regionCompare) lsSet(FEATURE_TOGGLE_REGION_COMPARE, false)
      if (!wemEnergy) lsSet(FEATURE_TOGGLE_WEM_ENERGY, false)

      this.setEmissions(emissions)
      this.setRegionCompare(regionCompare)
      this.setWemEnergy(wemEnergy)
    }
  },

  methods: {
    ...mapMutations({
      setEmissions: 'feature/emissions',
      setRegionCompare: 'feature/regionCompare',
      setWemEnergy: 'feature/wemEnergy'
    })
  }
}
