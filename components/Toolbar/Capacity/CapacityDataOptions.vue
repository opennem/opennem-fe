<template>
  <div 
    :class="{ mobile: mobile }" 
    class="data-view-options">

    <DataOptionsBar
      :ranges="ranges"
      :intervals="intervals"
      :range="range"
      :interval="interval"
      :filter-period="filterPeriod"
      :mobile="mobile"
      @queryChange="handleQueryChange"
      @rangeChange="handleRangeChange"
      @intervalChange="handleIntervalChange"
      @filterPeriodChange="handleFilterPeriodChange"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import {
  getRangeQueryByRange,
} from '@/constants/range-queries.js'
import {
  getIntervalQueryByInterval,
} from '@/constants/interval-queries.js'
import {
  getFilterQueryByFilter,
} from '@/constants/filter-queries.js'
import { CAPACITY_RANGES, RANGE_INTERVALS } from '@/constants/ranges.js'
import DataOptionsBar from '@/components/Capacity/DataOptionsBar.vue'

export default {
  components: {
    DataOptionsBar
  },

  props: {
    mobile: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      ranges: CAPACITY_RANGES,
      intervals: RANGE_INTERVALS,
    }
  },
  watch: {
    fuelTechGroupName() {
      const query = {
        range: getRangeQueryByRange(this.range),
        interval: getIntervalQueryByInterval(this.interval)
      }
      const filterQuery = getFilterQueryByFilter(this.filterPeriod)
      if (filterQuery) {
        query.filter = filterQuery
      }


      this.handleQueryChange(query)
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      fuelTechGroupName: 'fuelTechGroupName',
      query: 'app/query',
    }),

    dashboardView: {
      get() {
        return this.$store.getters['app/dashboardView']
      },

      set(val) {
        this.$store.commit('app/dashboardView', val)
      }
    },

    regionId() {
      return this.$route.params.region
    },
  },

  methods: {
    ...mapMutations({
      setQuery: 'app/query',
      setUseCachedData: 'regionEnergy/useCachedData',
      setRange: 'range',
      setInterval: 'interval',
      setFilterPeriod: 'filterPeriod'
    }),

    handleViewChange(view) {
      this.dashboardView = view

      const query = {
          range: 'all',
          interval: '1M'
        }

        this.setUseCachedData(false)

        this.setRange('ALL')
        this.setInterval('Month')
        
        this.handleQueryChange(query)
    },

    handleQueryChange(query) {
      const updatedQuery = {
        ...query,
        view: this.dashboardView,
        group: this.fuelTechGroupName
      }

      this.$router.push({
        params: { region: this.regionId },
        query: updatedQuery
      })

      this.setQuery(updatedQuery)
    },

    handleRangeChange(range, useCache = false) {
      this.setUseCachedData(useCache)
      this.setRange(range)
    },

    handleIntervalChange(interval) {
      this.setInterval(interval)
    },

    handleFilterPeriodChange(period) {
      this.setFilterPeriod(period)
    },
  }
}
</script>


<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

$breakpoint: 769px;

.data-view-options {
  display: flex;
  gap: 8px;
  align-content: center;

  &.mobile {
    flex-direction: column;

    label {
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 500;
      display: block;
      color: #353535;
      margin-bottom: 4px;
    }

    .buttons {
      display: flex;
      width: 100%;
      justify-content: center;
    }

    button {
      display: flex;
      min-width: auto;
      width: 50%;
      height: auto;
      padding: 8px;
      gap: 8px;
      align-items: center;
    }
  }
}

.button-group .buttons {
  .button {
    margin-right: -1px;

    &.is-selected {
      z-index: 99;
    }
  }
  .button:last-child {
    margin-right: 0;
  }
}
</style>