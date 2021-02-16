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
  RANGE_30D,
  RANGE_1Y
} from '@/constants/ranges.js'
import {
  INTERVAL_5MIN,
  INTERVAL_30MIN,
  INTERVAL_DAY,
  INTERVAL_WEEK
} from '@/constants/interval-filters.js'
import {
  isValidRangeQuery,
  getRangeQueryByRange,
  getRangeByRangeQuery
} from '@/constants/range-queries.js'
import {
  isValidIntervalQuery,
  getIntervalQueryByInterval,
  getIntervalByIntervalQuery
} from '@/constants/interval-queries.js'

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
    isWemRegion() {
      return this.selectedFacilityNetworkRegion === 'WEM'
    },

    selectedRangeIntervals() {
      const range = this.ranges.find(r => r.range === this.selectedRange)
      const intervals = range ? range.intervals : null
      return intervals
    },

    queryRange() {
      return this.$route.query.range
    },
    queryInterval() {
      return this.$route.query.interval
    }
  },

  watch: {
    '$route.query': 'checkQueries'
  },

  created() {
    if (this.isWemRegion) {
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

  mounted() {
    this.checkQueries()
  },

  methods: {
    ...mapMutations({
      setRange: 'facility/range',
      setInterval: 'facility/interval'
    }),

    checkQueries() {
      const validRangeQuery = isValidRangeQuery(this.queryRange)
      const validIntervalQuery = isValidIntervalQuery(this.queryInterval)

      let range = this.selectedRange
      let interval = this.selectedInterval

      if (validRangeQuery && validIntervalQuery) {
        range = getRangeByRangeQuery(this.queryRange)
        interval = getIntervalByIntervalQuery(this.queryInterval)

        if (this.isWemRegion && interval === INTERVAL_5MIN) {
          interval = INTERVAL_30MIN
          this.updateQuery(range, interval)
        }
      } else if (!validRangeQuery && !validIntervalQuery) {
        this.updateQuery(range, interval)
      } else if (validRangeQuery && !validIntervalQuery) {
      } else if (!validRangeQuery && validIntervalQuery) {
      }

      this.setRangeInterval(range, interval)
    },

    setRangeInterval(range, interval) {
      console.log('setting', range, interval)
      this.setRange(range)
      this.setInterval(interval)
    },

    updateQuery(range, interval) {
      const query = {
        range: getRangeQueryByRange(range),
        interval: getIntervalQueryByInterval(interval)
      }
      this.$emit('queryChange', query)
    },

    handleRangeChange(range) {
      const find = this.ranges.find(r => r.range === range)
      const intervals = find ? find.intervals : null

      let interval = ''
      if (range === RANGE_1D || range === RANGE_3D || range === RANGE_7D) {
        interval = INTERVAL_30MIN
      } else if (range === RANGE_30D) {
        interval = INTERVAL_DAY
      } else if (range === RANGE_1Y) {
        interval = INTERVAL_WEEK
      } else {
        interval = intervals[0]
      }

      this.setRangeInterval(range, interval)
      this.updateQuery(range, interval)
      this.$emit('rangeChange')
    },
    handleIntervalChange(interval) {
      this.setInterval(interval)
      this.updateQuery(this.selectedRange, interval)
      this.$emit('intervalChange')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';

.range-interval-selectors {
  @include tablet {
    padding: 0.5rem 0;
  }
}
</style>
