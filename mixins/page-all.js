import { mapMutations } from 'vuex'
import { lsGet, lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_EMISSIONS,
  FEATURE_TOGGLE_REGION_COMPARE,
  FEATURE_TOGGLE_V3_PATHS,
  FEATURE_TOGGLE_METRICS
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
      let emissions = lsGet(FEATURE_TOGGLE_EMISSIONS)
      let regionCompare = lsGet(FEATURE_TOGGLE_REGION_COMPARE)
      let v3Paths = lsGet(FEATURE_TOGGLE_V3_PATHS)
      let metrics = lsGet(FEATURE_TOGGLE_METRICS)

      if (!emissions || emissions === 'null') {
        lsSet(FEATURE_TOGGLE_EMISSIONS, false)
      }
      if (!regionCompare || regionCompare === 'null') {
        lsSet(FEATURE_TOGGLE_REGION_COMPARE, false)
      }
      if (!v3Paths || v3Paths === 'null') {
        lsSet(FEATURE_TOGGLE_V3_PATHS, false)
      }
      if (!metrics || metrics === 'null') {
        lsSet(FEATURE_TOGGLE_METRICS, false)
      }
      this.setEmissions(emissions)
      this.setRegionCompare(regionCompare)
      this.setV3Paths(v3Paths)
      this.setMetrics(metrics)

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

      setExportAttribution: 'exportAttribution',

      setHostEnv: 'hostEnv'
    })
  }
}
