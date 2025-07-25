import { mapMutations } from 'vuex'
import _debounce from 'lodash.debounce'
import { lsGet, lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_COMPARE_PRICE,
  FEATURE_TOGGLE_CAPACITY_CHARTS,
  SHOW_BANNER
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
      this.getSetFeature(FEATURE_TOGGLE_COMPARE_PRICE, this.setComparePrice)

      if (lsGet(SHOW_BANNER) === null) {
        this.setShowBanner(true)
        lsSet(SHOW_BANNER, true)
      } else {
        this.setShowBanner(lsGet(SHOW_BANNER))
      }

      const exportAttribution = lsGet('exportAttribution') || '@name'
      this.setExportAttribution(exportAttribution)

      this.setHostEnv(hostEnv())

      this.setIsTouchDevice(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.msMaxTouchPoints > 0
      )

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
      setIsTouchDevice: 'app/isTouchDevice',

      setComparePrice: 'feature/comparePrice',
      setShowBanner: 'feature/showBanner',

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
