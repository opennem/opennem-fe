import { mapMutations } from 'vuex'
import { lsGet, lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_EMISSIONS,
  FEATURE_TOGGLE_REGION_COMPARE
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

      if (!emissions) lsSet(FEATURE_TOGGLE_EMISSIONS, false)
      if (!regionCompare) lsSet(FEATURE_TOGGLE_REGION_COMPARE, false)

      this.setEmissions(emissions)
      this.setRegionCompare(regionCompare)

      const exportAttribution = lsGet('exportAttribution') || '@name'
      this.setExportAttribution(exportAttribution)
    }
  },

  methods: {
    ...mapMutations({
      setEmissions: 'feature/emissions',
      setRegionCompare: 'feature/regionCompare',

      setExportAttribution: 'exportAttribution'
    })
  }
}
