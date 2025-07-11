<template>
  <div 
    :class="{ mobile: tabletBreak }"
    class="button-group"
    style="gap: 8px;">
    <!-- <div 
      v-if="use12MthRollingToggle" 
      class="range-buttons buttons has-addons">
      <button 
        :class="{ 'is-selected': is12MthRollingSelected }" 
        class="button is-rounded"
        @click="handle12MthRollingClick">
        12 Mth Rolling
      </button>
    </div>

    <div v-if="rangeDropdownBreak">
      <RangeDropdown
        :selected="selectedRange" 
        :options="ranges.flat()"
        :mobile="mobile"
        @option-change="handleRangeDropdownClick" />
    </div> -->

    <!-- <div v-if="!rangeDropdownBreak">
      <label 
        v-if="tabletBreak" 
        style="margin-top: 8px;">Range:</label>
      <div 
        v-if="!use12MthRollingToggle" 
        :class="{ mobile: tabletBreak }"
        class="range-buttons buttons has-addons">
        <button
          v-on-clickaway="handleClickAway"
          v-for="(r, i) in ranges"
          :key="i"
          :class="{ 'is-selected': isRangeSelected(r) }"
          class="button is-rounded"
          @click.stop="handleRangeClick(r)"
        >
          <span>
            <div v-if="isString(r)">{{ r }}</div>
            <div v-if="!isString(r)">
              {{ getSelectedRangeLabel(r) }}
            </div>
            <i
              v-if="hasRangeFilter(r)"
              :class="[
                'fal dropdown-trigger-icon',
                showRangeOptions(r) ? 'fa-chevron-up' : 'fa-chevron-down'
              ]"
            />
            <div 
              v-show="showRangeOptions(r)" 
              class="filter-menu dropdown-menu">
              <div class="dropdown-content">
                <button
                  v-for="(range, rIndex) in r"
                  :key="`rangeOption${rIndex}`"
                  :class="{ 'is-selected': range === selectedRange }"
                  @click="handleRangeOptionClick(range)"
                >
                  {{ range }}
                </button>
              </div>
            </div>
          </span>
        </button>
      </div>
    </div> -->

    <div>
      <label 
        v-if="tabletBreak" 
        style="margin-top: 16px;">Time Interval:</label>

      <div 
        v-if="(isPowerRange && !periodDropdownBreak) || (is1yRange && !periodDropdownBreak)" 
        class="period-buttons buttons has-addons">
        <button
          v-on-clickaway="handleClickAway"
          v-for="(p, i) in selectedRangeIntervals"
          :key="i"
          :class="{ 'is-selected': p === selectedInterval }"
          class="button is-rounded"
          @click.stop="handleIntervalChange(p)"
        >{{ p }}</button>
      </div>

      <div 
        v-else 
        class="interval-dropdowns">
        <IntervalDropdown
          :show-caret="selectedRangeIntervals && selectedRangeIntervals.length > 1"
          :selected="selectedInterval" 
          :options="selectedRangeIntervals"
          :mobile="tabletBreak"
          @option-change="handleIntervalChange" />

        <IntervalDropdown
          v-if="filters.length > 0"
          :selected="selectedFilter" 
          :options="filters"
          :mobile="tabletBreak"
          @option-change="handleFilterPeriodClick" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'
import _includes from 'lodash.includes'
import IntervalDropdown from '~/components/Energy/IntervalDropdown.vue'
import RangeDropdown from '~/components/Energy/RangeDropdown.vue'

import {
  RANGE_1D,
  RANGE_3D,
  RANGE_7D,
  RANGE_1Y,
  RANGE_ALL,
  RANGE_ALL_12MTH_ROLLING,
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
  INTERVAL_ABBR_LABELS,
  hasIntervalFilters
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
import {
  isValidFilterQuery,
  getFilterQueryByFilter,
  getFilterByFilterQuery
} from '@/constants/filter-queries.js'

export default {
  mixins: [clickaway],

  components: {
    RangeDropdown,
    IntervalDropdown
  },

  props: {
    ranges: {
      type: Array,
      default: () => []
    },
    intervals: {
      type: Object,
      default: () => null
    },
    range: {
      type: String,
      default: null
    },
    interval: {
      type: String,
      default: null
    },
    filterPeriod: {
      type: String,
      default: null
    },
    use12MthRollingToggle: {
      type: Boolean,
      default: false
    },
    mobile: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      selectedRange: '',
      selectedInterval: '',
      selectedFilter: '',
      selectedRangeIntervals: [],
      filters: [],
      showMonthFilter: false,
      showSeasonFilter: false,
      showQuarterFilter: false,
      showHalfYearFilter: false,
      monthFilters: INTERVAL_FILTERS[INTERVAL_MONTH],
      seasonFilters: INTERVAL_FILTERS[INTERVAL_SEASON],
      quarterFilters: INTERVAL_FILTERS[INTERVAL_QUARTER],
      halfYearFilters: INTERVAL_FILTERS[INTERVAL_HALFYEAR],
      showAllRangeOptions: false,
      show1YRangeOptions: false,
      is12MthRollingSelected: true
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',
      rangeDropdownBreak: 'app/rangeDropdownBreak',
      periodDropdownBreak: 'app/periodDropdownBreak'
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
    isWemOrAu() {
      return this.regionId === 'wem' || this.regionId === 'au'
    },
    isPowerRange() {
      return (
        this.selectedRange === RANGE_1D ||
        this.selectedRange === RANGE_3D ||
        this.selectedRange === RANGE_7D
      )
    },
    is1yRange() {
      return (
        this.selectedRange === RANGE_1Y
      )
    }
  },

  watch: {
    '$route.query': 'checkQueries'
  },

  mounted() {
    if (this.use12MthRollingToggle) {
      this.is12MthRollingSelected = this.range === RANGE_ALL_12MTH_ROLLING
      this.updateSelections(this.range, this.interval, this.filterPeriod)
    } else {
      this.checkQueries()
    }
  },

  methods: {
    checkQueries() {
      const validRangeQuery = isValidRangeQuery(this.queryRange)
      const validIntervalQuery = isValidIntervalQuery(this.queryInterval)
      const validIntervalFilterQuery =
        isValidFilterQuery(this.queryFilter) || !this.queryFilter

      if (!this.queryFilter) {
        this.selectedFilter = this.filterPeriod
      }

      let range = this.range || 'ALL'
      let interval = this.interval || 'Month'
      let filter = this.filterPeriod

      if (validRangeQuery && validIntervalQuery) {
        range = getRangeByRangeQuery(this.queryRange)
        interval = getIntervalByIntervalQuery(this.queryInterval)

        if (!isValidRangeInterval(range, interval)) {
          interval = getDefaultIntervalByRange(range)
          this.updateQuery(range, interval, filter)
        } else if (validIntervalFilterQuery) {
          filter = this.queryFilter
            ? getFilterByFilterQuery(this.queryFilter)
            : FILTER_NONE
        } else if (!validIntervalFilterQuery) {
          filter = FILTER_NONE
          this.updateQuery(range, interval, filter)
        }
      } else if (!validRangeQuery && !validIntervalQuery) {
        if (range === '') {
          range = RANGE_7D
        }
        if (interval === '') {
          interval = INTERVAL_30MIN
        }

        this.updateQuery(range, interval, filter)
      } else if (validRangeQuery && !validIntervalQuery) {
        range = getRangeByRangeQuery(this.queryRange)
        interval = getDefaultIntervalByRange(range)

        this.updateQuery(range, interval, filter)
      } else if (!validRangeQuery && validIntervalQuery) {
        range = RANGE_7D
        interval = INTERVAL_30MIN

        this.updateQuery(range, interval, filter)
      }

      this.updateSelections(range, interval, filter)
    },

    updateSelections(range, interval, filter) {
      this.selectedRange = range
      this.selectedInterval = interval
      this.setSelectedRangeIntervals(range)
      this.setFilters(interval)

      this.$emit('rangeChange', range)
      this.$emit('intervalChange', interval)

      if (filter) {
        this.selectedFilter = filter

        this.$emit('filterPeriodChange', filter)
      }
    },

    setSelectedRangeIntervals(selected) {
      if (selected !== '') {
        let intervals = this.intervals[selected]

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

    hideAllPopups() {
      this.showMonthFilter = false
      this.showSeasonFilter = false
      this.showQuarterFilter = false
      this.showHalfYearFilter = false

      this.show1YRangeOptions = false
      this.showAllRangeOptions = false
    },

    hasFilter(interval) {
      return (
        this.interval === interval && hasIntervalFilters(interval, this.range)
      )
    },

    hasRangeFilter(range) {
      return _includes(range, this.range) && !this.isString(range)
    },

    getIntervalLabel(interval) {
      return this.tabletBreak
        ? INTERVAL_ABBR_LABELS[interval] || interval
        : interval
    },

    intervalLabel(interval) {
      if (this.selectedFilter === FILTER_NONE) {
        return this.getIntervalLabel(interval)
      } else {
        return this.selectedFilter
      }
    },

    showRangeOptions(r) {
      const hasOptions = !this.isString(r)
      return hasOptions
        ? (_includes(r, RANGE_ALL) && this.showAllRangeOptions) ||
            (_includes(r, RANGE_1Y) && this.show1YRangeOptions)
        : false
    },

    handleRangeClick(r) {
      this.hideAllPopups()

      if (this.isString(r)) {
        this.handleRangeChange(r)
      } else {
        const range = r[0]
        if (this.selectedRange !== range && !_includes(r, this.selectedRange)) {
          this.handleRangeChange(range)
        } else {
          if (range === RANGE_ALL) {
            this.showAllRangeOptions = true
          }
          if (range === RANGE_1Y) {
            this.show1YRangeOptions = true
          }
        }
      }
    },

    handleRangeDropdownClick(r) {
      console.log('range', r)
      this.hideAllPopups()

      if (r === RANGE_ALL_12MTH_ROLLING) {
        this.handleRangeOptionClick(r)
      } else {
        this.handleRangeChange(r)
      }

    },

    handleRangeChange(range) {
      this.$store.commit('regionEnergy/filteredDates', [])
      this.selectedFilter = FILTER_NONE

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

      this.updateSelections(range, interval)
      this.$emit('rangeChange', range)
      this.$emit('intervalChange', interval)
      this.$emit('filterPeriodChange', FILTER_NONE)
      this.updateQuery(range, interval, this.selectedFilter)
    },

    handleRangeOptionClick(range) {
      this.selectedRange = range
      this.hideAllPopups()
      this.$store.dispatch('compareDifference', false)
      this.$store.dispatch('compareDates', [])
      this.selectedInterval = getDefaultIntervalByRange(range)

      this.updateSelections(range, this.selectedInterval)

      this.updateQuery(range, this.selectedInterval, this.selectedFilter)
      this.$emit('rangeOptionChange', range)
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
        this.hideAllPopups()
        this.$emit('filterPeriodChange', FILTER_NONE)
        this.selectedFilter = FILTER_NONE

        this.updateQuery(this.range, interval, this.selectedFilter)
      }

      this.setFilters(interval)
      this.$emit('intervalChange', interval)
    },

    handleFilterPeriodClick(filter) {
      this.selectedFilter = filter
      this.hideAllPopups()
      this.$store.dispatch('compareDifference', false)
      this.$store.dispatch('compareDates', [])

      this.$emit('filterPeriodChange', filter)
      this.updateQuery(this.range, this.interval, filter)
    },

    handleClickAway() {
      this.hideAllPopups()
    },

    updateQuery(range, interval, filter) {
      const query = {
        range: getRangeQueryByRange(range),
        interval: getIntervalQueryByInterval(interval)
      }
      const filterQuery = getFilterQueryByFilter(filter)
      if (filterQuery) {
        query.filter = filterQuery
      }

      this.$emit('queryChange', query)
      this.$emit('rangeIntervalChange', { query, range, interval, filterPeriod: filter })
    },

    isString(v) {
      return typeof v === 'string'
    },

    isRangeSelected(r) {
      if (this.isString(r)) {
        return r === this.selectedRange
      }

      return _includes(r, this.selectedRange)
    },

    getSelectedRangeLabel(r) {
      let label = null

      r.forEach((d) => {
        if (d === this.selectedRange) {
          label = d
        }
      })

      return label || r[0]
    },

    handle12MthRollingClick() {
      this.is12MthRollingSelected = !this.is12MthRollingSelected
      const range = this.is12MthRollingSelected ? RANGE_ALL_12MTH_ROLLING : RANGE_ALL
      this.handleRangeOptionClick(range)
    }
  }
}
</script>

<style lang="scss" scoped>
.button-group.mobile {
  display: block;
}

label {
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
  display: block;
  color: #353535;
  margin-bottom: 4px;
}

.range-buttons.mobile {
  width: 100%;
  flex-wrap: nowrap;

  button {
    min-width: auto;
    width: 100%;
  }
}

.interval-dropdowns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
