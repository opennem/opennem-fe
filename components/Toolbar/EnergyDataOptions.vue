<template>
  <div class="data-view-options">
    <div class="dashboard-btns">
      <button 
        class="dashboard-view-btn"
        v-tooltip="dashboardView === 'discrete-time' ? '' : 'Switch to discrete time view'"
        :class="{ 'is-selected': dashboardView === 'discrete-time' }"
        @click="() => handleViewChange('discrete-time')">
        <span class="icon">
          <IconDiscreteTime />
        </span>
      </button>

      <button 
        class="dashboard-view-btn"
        v-tooltip="dashboardView === 'time-of-day' ? '' : 'Switch to time of day view'"
        :class="{ 'is-selected': dashboardView === 'time-of-day' }"
        @click="() => handleViewChange('time-of-day')">
        <span class="icon">
          <IconTimeOfDay />
        </span>
      </button>
    </div>

    <DataOptionsBar
      v-show="dashboardView === 'discrete-time'"
      style="padding-right: 0.5rem;"
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
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { isPowerRange, RANGES, RANGE_INTERVALS } from '@/constants/ranges.js'

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
$breakpoint: 769px;

.data-view-options {
  display: flex;
  gap: 2px;
  padding-left: 0.5rem;

  & > * {
    width: 100%;
  }

  @media screen and (min-width: $breakpoint) {
    display: flex;
    align-items: center;
    margin-left: 1rem;
    padding-left: 0;
  }
}

.dashboard-btns {
  width: auto;
  margin-bottom: 0;
  border-radius: 0px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 55px;
  padding: 2px;
  background-color: rgba(255, 255, 255, 0.5);

  @media screen and (min-width: $breakpoint) {
    flex-direction: row;
    height: 30px;
    border-radius: 4px;
  }
}

.dashboard-view-btn {
  cursor: pointer;
  background: none;
  border-radius: 2px;
  border: 1px solid transparent;

  .icon {
    padding: 2px;
    width: 20px;
    height: 20px;
    align-items: center;
    display: flex;
    pointer-events: none;
  }

  &.is-selected {
    border: 1px solid #bbb;
    background-color: #ddd;
  }

  &:hover {
    background-color: #ddd;
  }
}
</style>