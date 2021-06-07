import { mapMutations } from 'vuex'
import _debounce from 'lodash.debounce'
import { lsGet, lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_EMISSIONS,
  FEATURE_TOGGLE_REGION_COMPARE,
  FEATURE_TOGGLE_AU_ENERGY,
  FEATURE_TOGGLE_V3_DATA
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
      this.getSetFeature(FEATURE_TOGGLE_AU_ENERGY, this.setAuEnergy)
      this.getSetFeature(FEATURE_TOGGLE_V3_DATA, this.setV3Data)

      const exportAttribution = lsGet('exportAttribution') || '@name'
      this.setExportAttribution(exportAttribution)

      this.setHostEnv(hostEnv())

      this.setWindowWidth(window.innerWidth)
      this.$nextTick(() => {
        window.addEventListener(
          'resize',
          _debounce(() => {
            this.setWindowWidth(window.innerWidth)
          }, 200)
        )
      })
    }
  },

  methods: {
    ...mapMutations({
      setWindowWidth: 'app/windowWidth',

      setEmissions: 'feature/emissions',
      setRegionCompare: 'feature/regionCompare',
      setAuEnergy: 'feature/auEnergy',
      setV3Data: 'feature/v3Data',

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
