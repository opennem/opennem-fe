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
        v-on-clickaway="handleClickAway"
        v-for="(interval, i) in selectedRangeIntervals"
        :key="i"
        :class="{ 'is-selected': interval === selectedInterval }"
        class="button is-rounded"
        @click.stop="handleIntervalChange(interval)">

        <div v-if="!hasFilter(interval)">{{ interval }}</div>
        <div v-if="hasFilter(interval)">{{ intervalLabel(interval) }}</div>
        <i
          v-if="hasFilter(interval)"
          class="filter-caret fal fa-chevron-down" />
        
        <div
          v-show="showFilter(interval)"
          class="filter-menu dropdown-menu">
          <div class="dropdown-content">
            <a
              v-for="(period, i) in filters"
              :key="`period${i}`"
              :class="{ 'is-selected': filterPeriod === period }"
              class="dropdown-item"
              @click.stop="handleFilterPeriodClick(period)">
              {{ period }}
            </a>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'
import {
  FuelTechRanges,
  RANGE_1D,
  RANGE_3D,
  RANGE_7D
} from '~/constants/ranges.js'
import {
  INTERVAL_FILTERS,
  FILTER_NONE,
  INTERVAL_MONTH,
  INTERVAL_SEASON,
  INTERVAL_QUARTER,
  INTERVAL_HALFYEAR,
  hasIntervalFilters
} from '@/constants/interval-filters.js'
import {
  isValidIntervalQuery,
  getDefaultInterval,
  getIntervalQueryByInterval,
  getIntervalByIntervalQuery
} from '@/constants/interval-queries.js'
import {
  isValidRangeQuery,
  getDefaultRange,
  getRangeQueryByRange,
  getRangeByRangeQuery
} from '@/constants/range-queries.js'

export default {
  mixins: [clickaway],
  data() {
    return {
      ranges: FuelTechRanges,
      intervalFilters: INTERVAL_FILTERS,
      selectedRange: '',
      selectedInterval: '',
      showMonthFilter: false,
      showSeasonFilter: false,
      showQuarterFilter: false,
      showHalfYearFilter: false,
      monthFilters: INTERVAL_FILTERS[INTERVAL_MONTH],
      seasonFilters: INTERVAL_FILTERS[INTERVAL_SEASON],
      quarterFilters: INTERVAL_FILTERS[INTERVAL_QUARTER],
      halfYearFilters: INTERVAL_FILTERS[INTERVAL_HALFYEAR]
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval'
    }),
    regionId() {
      return this.$route.params.region
    },
    queryRange() {
      return this.$route.query.range
    },
    queryInterval() {
      return this.$route.query.interval
    },
    isPowerRange() {
      return (
        this.selectedRange === RANGE_1D ||
        this.selectedRange === RANGE_3D ||
        this.selectedRange === RANGE_7D
      )
    },
    selectedRangeIntervals() {
      const range = this.ranges.find(r => r.range === this.selectedRange)
      let intervals = range ? range.intervals : null
      if (this.regionId === 'wem' && this.isPowerRange) {
        intervals = ['30m']
      }
      return intervals
    },
    filterPeriod() {
      return this.$store.getters.filterPeriod
    },
    periodArray() {
      return this.intervalFilters[this.selectedInterval]
    },
    filters() {
      switch (this.interval) {
        case INTERVAL_MONTH:
          return this.monthFilters
        case INTERVAL_SEASON:
          return this.seasonFilters
        case INTERVAL_QUARTER:
          return this.quarterFilters
        default:
          // Half Year
          return this.halfYearFilters
      }
    }
  },

  watch: {
    range(updated) {
      this.selectedRange = updated
    },
    interval(updated) {
      this.selectedInterval = updated
    },
    periodArray(arr) {
      if (arr && !this.filterPeriod) {
        this.$store.dispatch('filterPeriod', FILTER_NONE)
      }
    }
  },

  created() {
    console.log(this.range, this.interval)
    console.log(this.queryRange, this.queryInterval)

    const validRangeQuery = isValidRangeQuery(this.queryRange)
    const validIntervalQuery = isValidIntervalQuery(this.queryInterval)

    if (validRangeQuery && validIntervalQuery) {
      console.log('valid')
      this.setRange(getRangeByRangeQuery(this.queryRange))
      this.setInterval(getIntervalByIntervalQuery(this.queryInterval))
    } else if (!validRangeQuery && !validIntervalQuery) {
      console.log('invalid')
      this.updateRoute(this.range, this.interval)
    } else if (validRangeQuery && !validIntervalQuery) {
      console.log('valid range, invalid interval:', this.queryInterval)
    } else if (!validRangeQuery && validIntervalQuery) {
      console.log('valid interval, invalid range:', this.queryRange)
    }
  },

  mounted() {
    this.selectedRange = this.range
    this.selectedInterval = this.interval
  },

  methods: {
    ...mapMutations({
      setRange: 'range',
      setInterval: 'interval'
    }),
    showFilter(interval) {
      return (
        (interval === INTERVAL_MONTH && this.showMonthFilter) ||
        (interval === INTERVAL_SEASON && this.showSeasonFilter) ||
        (interval === INTERVAL_QUARTER && this.showQuarterFilter) ||
        (interval === INTERVAL_HALFYEAR && this.showHalfYearFilter)
      )
    },
    hideAllFilters() {
      this.showMonthFilter = false
      this.showSeasonFilter = false
      this.showQuarterFilter = false
      this.showHalfYearFilter = false
    },
    hasFilter(interval) {
      return (
        this.interval === interval && hasIntervalFilters(interval, this.range)
      )
    },
    intervalLabel(interval) {
      if (this.filterPeriod === FILTER_NONE) {
        return this.interval
      } else {
        return this.filterPeriod
      }
    },
    handleRangeChange(range) {
      this.$store.commit('regionEnergy/filteredDates', [])
      this.$store.dispatch('filterPeriod', FILTER_NONE)
      this.$store.dispatch('si/emissionsVolumePrefix', '')

      let interval = ''
      let isPower = false
      switch (range) {
        case '1D':
          interval = '30m'
          isPower = true
          break
        case '3D':
        case '7D':
          interval = '30m'
          isPower = true
          break
        case '30D':
          interval = 'Day'
          break
        case '1Y':
          interval = 'Week'
          break
        case 'ALL':
          interval = 'Month'
          break
        default:
          console.log('nothing yet')
      }

      if (this.regionId === 'wem' && isPower) {
        interval = '30m'
      }

      this.$store.dispatch('interval', interval)
      this.$store.dispatch('range', range)
      this.updateRoute(range, interval)
    },
    handleIntervalChange(interval) {
      const hasFilter = this.hasFilter(interval)
      if (hasFilter && this.interval === interval) {
        if (interval === INTERVAL_MONTH) {
          this.showMonthFilter = true
        }
        if (interval === INTERVAL_SEASON) {
          this.showSeasonFilter = true
        }
        if (interval === INTERVAL_QUARTER) {
          this.showQuarterFilter = true
        }
        if (interval === INTERVAL_HALFYEAR) {
          this.showHalfYearFilter = true
        }
      } else {
        this.hideAllFilters()
        this.$store.dispatch('filterPeriod', FILTER_NONE)
        this.$store.dispatch('si/emissionsVolumePrefix', '')
        this.$store.dispatch('interval', interval)
      }
      this.updateRoute(this.range, interval)
    },
    handleFilterPeriodClick(period) {
      this.$store.dispatch('filterPeriod', period)
      this.$store.dispatch('compareDifference', false)
      this.$store.dispatch('compareDates', [])
      this.hideAllFilters()
    },
    handleClickAway() {
      this.hideAllFilters()
    },
    updateRoute(range, interval) {
      this.$router.push({
        params: { region: this.regionId },
        query: {
          range: getRangeQueryByRange(range),
          interval: getIntervalQueryByInterval(interval)
        }
      })
    }
  }
}
</script>
