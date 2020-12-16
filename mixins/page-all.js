import { mapMutations } from 'vuex'
import { lsGet, lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_EMISSIONS,
  FEATURE_TOGGLE_REGION_COMPARE,
  FEATURE_TOGGLE_V3_PATHS,
  FEATURE_TOGGLE_METRICS,
  FEATURE_TOGGLE_AU_ENERGY
} from '@/constants/mutation-types/features.js'
import hostEnv from '@/services/HostEnv.js'

let uuid = 0

export default {
  beforeCreate() {
    this.uuid = uuid.toString()
    uuid += 1
  },
  mounted() {
    if (process.client) {
      this.getSetFeature(FEATURE_TOGGLE_EMISSIONS, this.setEmissions)
      this.getSetFeature(FEATURE_TOGGLE_REGION_COMPARE, this.setRegionCompare)
      this.getSetFeature(FEATURE_TOGGLE_V3_PATHS, this.setV3Paths)
      this.getSetFeature(FEATURE_TOGGLE_METRICS, this.setMetrics)
      this.getSetFeature(FEATURE_TOGGLE_AU_ENERGY, this.setAuEnergy)

      const exportAttribution = lsGet('exportAttribution') || '@name'
      this.setExportAttribution(exportAttribution)

      this.setHostEnv(hostEnv())
    }
  },

  methods: {
    ...mapMutations({
      setEmissions: 'feature/emissions',
      setRegionCompare: 'feature/regionCompare',
      setV3Paths: 'feature/v3Paths',
      setMetrics: 'feature/metrics',
      setAuEnergy: 'feature/auEnergy',

      setExportAttribution: 'exportAttribution',

      setHostEnv: 'hostEnv'
    }),

    getSetFeature(feature, setter) {
      let f = lsGet(feature)
      if (!f || f === 'null') {
        lsSet(feature, false)
      }
      setter(f)
    }
  }
}
