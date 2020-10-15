<template>
  <div class="range-interval-selectors">
    <div class="range-buttons buttons has-addons">
      <button
        v-for="(r, i) in ranges"
        :key="i"
        :class="{ 'is-selected': r.range === selectedRange }"
        class="button is-rounded"
        @click="handleRangeChange(r.range)">
        {{ r.range }}
      </button>
    </div>

    <div class="buttons has-addons">
      <button
        v-for="(interval, i) in selectedRangeIntervals"
        :key="i"
        :class="{ 'is-selected': interval === selectedInterval }"
        class="button is-rounded"
        @click="handleIntervalChange(interval)">
        {{ interval }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import {
  FacilityPowerEnergyRanges,
  RANGE_1D,
  RANGE_3D,
  RANGE_7D,
  RANGE_1Y
} from '@/constants/ranges.js'
import {
  INTERVAL_5MIN,
  INTERVAL_30MIN,
  INTERVAL_WEEK
} from '@/constants/interval-filters.js'

export default {
  data() {
    return {
      ranges: _cloneDeep(FacilityPowerEnergyRanges)
    }
  },

  computed: {
    ...mapGetters({
      selectedRange: 'facility/range',
      selectedInterval: 'facility/interval',
      selectedFacilityNetworkRegion: 'facility/selectedFacilityNetworkRegion'
    }),
    selectedRangeIntervals() {
      const range = this.ranges.find(r => r.range === this.selectedRange)
      const intervals = range ? range.intervals : null
      return intervals
    }
  },

  created() {
    if (this.selectedFacilityNetworkRegion === 'WEM') {
      this.ranges.forEach(r => {
        if (
          r.range === RANGE_1D ||
          r.range === RANGE_3D ||
          r.range === RANGE_7D
        ) {
          r.intervals = [INTERVAL_30MIN]
        }
      })

      if (this.selectedInterval === INTERVAL_5MIN) {
        this.setInterval(INTERVAL_30MIN)
      }
    }
  },

  methods: {
    ...mapMutations({
      setRange: 'facility/range',
      setInterval: 'facility/interval'
    }),
    handleRangeChange(range) {
      const find = this.ranges.find(r => r.range === range)
      const intervals = find ? find.intervals : null
      this.setRange(range)
      if (range === RANGE_1D || range === RANGE_3D || range === RANGE_7D) {
        this.setInterval(INTERVAL_30MIN)
      } else if (range === RANGE_1Y) {
        this.setInterval(INTERVAL_WEEK)
      } else {
        this.setInterval(intervals[0])
      }
      this.$emit('rangeChange')
    },
    handleIntervalChange(interval) {
      this.setInterval(interval)
      this.$emit('intervalChange')
    }
  }
}
</script>
