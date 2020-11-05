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
  RANGE_7D,
  getDefaultIntervalByRange,
  isValidRangeInterval
} from '~/constants/ranges.js'
import {
  INTERVAL_FILTERS,
  FILTER_NONE,
  INTERVAL_5MIN,
  INTERVAL_30MIN,
  INTERVAL_MONTH,
  INTERVAL_SEASON,
  INTERVAL_QUARTER,
  INTERVAL_HALFYEAR,
  hasIntervalFilters
} from '@/constants/interval-filters.js'
import {
  isValidRangeQuery,
  getDefaultRange,
  getRangeQueryByRange,
  getRangeByRangeQuery
} from '@/constants/range-queries.js'
import {
  isValidIntervalQuery,
  getDefaultInterval,
  getIntervalQueryByInterval,
  getIntervalByIntervalQuery
} from '@/constants/interval-queries.js'
import {
  isValidFilterQuery,
  getFilterQueryByFilter,
  getFilterByFilterQuery
} from '@/constants/filter-queries.js'

export default {
  mixins: [clickaway],
  data() {
    return {
      ranges: FuelTechRanges,
      selectedRange: '',
      selectedInterval: '',
      selectedRangeIntervals: [],
      filters: [],
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
      interval: 'interval',
      filterPeriod: 'filterPeriod'
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
    queryFilter() {
      return this.$route.query.filter
    },
    isPowerRange() {
      return (
        this.selectedRange === RANGE_1D ||
        this.selectedRange === RANGE_3D ||
        this.selectedRange === RANGE_7D
      )
    }
  },

  mounted() {
    this.checkQueries()
  },

  methods: {
    ...mapMutations({
      setRange: 'range',
      setInterval: 'interval',
      setFilterPeriod: 'filterPeriod'
    }),

    checkQueries() {
      const validRangeQuery = isValidRangeQuery(this.queryRange)
      const validIntervalQuery = isValidIntervalQuery(this.queryInterval)
      const validIntervalFilterQuery = isValidFilterQuery(this.queryFilter)

      let range = this.range
      let interval = this.interval
      let filterPeriod = this.filterPeriod

      if (validRangeQuery && validIntervalQuery) {
        range = getRangeByRangeQuery(this.queryRange)
        interval = getIntervalByIntervalQuery(this.queryInterval)

        if (!isValidRangeInterval(range, interval)) {
          interval = getDefaultIntervalByRange(range)
          this.updateRoute(range, interval)
        } else if (validIntervalFilterQuery) {
          filterPeriod = getFilterByFilterQuery(this.queryFilter)
        } else if (!validIntervalFilterQuery) {
          this.updateRoute(range, interval, filterPeriod)
        }
      } else if (!validRangeQuery && !validIntervalQuery) {
        if (range === '') {
          range = '7D'
        }
        if (interval === '') {
          interval = '30m'
        }

        this.updateRoute(range, interval, filterPeriod)
      } else if (validRangeQuery && !validIntervalQuery) {
        range = getRangeByRangeQuery(this.queryRange)
        interval = getDefaultIntervalByRange(range)

        this.updateRoute(range, interval, filterPeriod)
      } else if (!validRangeQuery && validIntervalQuery) {
        range = '7D'
        interval = '30m'

        this.updateRoute(range, interval, filterPeriod)
      }

      this.setRangeInterval(range, interval, filterPeriod)
    },

    setRangeInterval(range, interval, filter) {
      this.setRange(range)
      this.setInterval(interval)
      this.selectedRange = range
      this.selectedInterval = interval
      this.setSelectedRangeIntervals(range)
      this.setFilters(interval)

      if (filter) {
        this.setFilterPeriod(filter)
      }
    },

    setSelectedRangeIntervals(selected) {
      if (selected !== '') {
        const range = this.ranges.find(r => r.range === selected)
        let intervals = range ? range.intervals : null
        if (this.regionId === 'wem' && this.isPowerRange) {
          intervals = ['30m']
        }
        this.selectedRangeIntervals = intervals
      }
    },
    setFilters(interval) {
      let filters = []
      switch (interval) {
        case INTERVAL_MONTH:
          filters = this.monthFilters
          break
        case INTERVAL_SEASON:
          filters = this.seasonFilters
          break
        case INTERVAL_QUARTER:
          filters = this.quarterFilters
          break
        case INTERVAL_HALFYEAR:
          filters = this.halfYearFilters
          break
        default:
          filters = []
      }
      this.filters = filters
    },

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
      this.setFilterPeriod(FILTER_NONE)
      this.$store.dispatch('si/emissionsVolumePrefix', '')

      const is5mOr30m =
        this.interval === INTERVAL_5MIN || this.interval === INTERVAL_30MIN

      let interval = ''
      let isPower = false
      switch (range) {
        case '1D':
        case '3D':
        case '7D':
          interval = is5mOr30m ? this.interval : '30m'
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

      this.setRangeInterval(range, interval)
      this.updateRoute(range, interval)
    },
    handleIntervalChange(interval) {
      this.selectedInterval = interval

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
        this.$store.dispatch('si/emissionsVolumePrefix', '')
        this.setInterval(interval)
        this.setFilterPeriod(FILTER_NONE)
      }
      this.setFilters(interval)
      this.updateRoute(this.range, interval)
    },
    handleFilterPeriodClick(period) {
      this.$store.dispatch('compareDifference', false)
      this.$store.dispatch('compareDates', [])
      this.setFilterPeriod(period)
      this.hideAllFilters()
      this.updateRoute(this.range, this.interval, period)
    },
    handleClickAway() {
      this.hideAllFilters()
    },
    updateRoute(range, interval, filter) {
      const query = {
        range: getRangeQueryByRange(range),
        interval: getIntervalQueryByInterval(interval)
      }
      const filterQuery = getFilterQueryByFilter(filter)
      if (filterQuery) {
        query.filter = filterQuery
      }
      this.$router.push({
        params: { region: this.regionId },
        query
      })
    }
  }
}
</script>
