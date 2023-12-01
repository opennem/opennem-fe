<template>
  <div class="data-view-options">
    <div class="button-group has-addons">
      <div class="buttons">
        <button 
          class="button is-small"
          v-tooltip="dashboardView === 'discrete-time' ? '' : 'Switch to discrete time view'"
          :class="{ 'is-selected': dashboardView === 'discrete-time' }"
          @click="() => handleViewChange('discrete-time')">
          <span class="icon">
            <IconDiscreteTime />
          </span>
        </button>

        <button 
          class="button is-small"
          v-tooltip="dashboardView === 'time-of-day' ? '' : 'Switch to time of day view'"
          :class="{ 'is-selected': dashboardView === 'time-of-day' }"
          @click="() => handleViewChange('time-of-day')">
          <span class="icon">
            <IconTimeOfDay />
          </span>
        </button>
      </div>
    </div>

    <DataOptionsBar
      v-show="dashboardView === 'discrete-time'"
      :ranges="ranges"
      :intervals="intervals"
      :range="range"
      :interval="interval"
      :filter-period="filterPeriod"
      :view="dashboardView"
      @queryChange="handleQueryChange"
      @rangeChange="handleRangeChange"
      @intervalChange="handleIntervalChange"
      @filterPeriodChange="handleFilterPeriodChange"
    />

    <DataOptionsBarTimeOfDay
      style="padding-right: 0;"
      v-show="dashboardView === 'time-of-day'"
      :view="dashboardView"
      :range="range"
      :interval="interval"
      @queryChange="handleQueryChange"
      @rangeChange="handleRangeChange"
      @intervalChange="handleIntervalChange"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { RANGES, RANGE_INTERVALS } from '@/constants/ranges.js'

import DataOptionsBar from '@/components/Energy/DataOptionsBar.vue'
import DataOptionsBarTimeOfDay from '~/components/Energy/DataOptionsBarTimeOfDay.vue'
import IconTimeOfDay from '~/components/Vis/IconTimeOfDay.vue'
import IconDiscreteTime from '~/components/Vis/IconDiscreteTime.vue'

export default {
  components: {
    DataOptionsBar,
    DataOptionsBarTimeOfDay,
    IconTimeOfDay,
    IconDiscreteTime
  },

  data() {
    return {
      ranges: RANGES,
      intervals: RANGE_INTERVALS,
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
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

      if (view === 'time-of-day') {
        // if it's not 28D, switch to 28D and and then set view
        if (this.range !== '28D') {
          this.setRange('28D')
          this.setInterval('30m')
          this.handleQueryChange({ range: '28d', interval: '30m' })
        }  else {
          this.handleQueryChange(this.query || { range: '28d', interval: '30m' })
        }
      } else {

        const query = {
          range: '7d',
          interval: '30m'
        }

        this.setUseCachedData(false)

        this.setRange('7D')
        this.setInterval('30m')
        
        this.handleQueryChange(query)
      }
    },

    handleQueryChange(query) {
      const updatedQuery = {
        ...query,
        view: this.dashboardView
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
  align-items: center;
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