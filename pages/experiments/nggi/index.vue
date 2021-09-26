<template>
  <div class="container">
    <h1>NGGI Emissions</h1>

    <!-- <DataOptionsBar
      :ranges="ranges"
      :intervals="intervals"
      :range="range"
      :interval="interval"
      :filter-period="filterPeriod"
      @rangeChange="handleRangeChange"
      @intervalChange="handleIntervalChange"
      @queryChange="handleQueryChange"
      @filterPeriodChange="handleFilterPeriodChange" /> -->

    <DataOptionsBar
      :ranges="ranges"
      :intervals="intervals"
      :range="range"
      :interval="interval"
      :filter-period="filterPeriod"
      style="position: relative; margin-bottom: 1rem;"
      @rangeChange="handleRangeChange"
      @rangeOptionChange="handleRangeChange"
      @intervalChange="handleIntervalChange"
      @filterPeriodChange="handleFilterPeriodChange" /> 

    <div class="chart-table">
      <EmissionsChart
        v-if="dataset.length > 0"
        :emissions-dataset="dataset"
        :domain-emissions="domains"
        :range="range"
        :interval="interval"
        :show-x-axis="true"
        :average-emissions="averageEmissions"
        :vis-height="450"
        :hover-on="isHovering"
        :hover-date="hoverDate"
        :zoom-extent="zoomExtent"
        :filter-period="filterPeriod"
        class="chart"
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering"
        @zoomExtent="handleZoomExtent"
      />

      <div class="table">
        <table class="summary-list">
          <tbody>
            <tr
              v-for="(d, i) in domainEmissions"
              :key="i">
              <td>
                <div
                  :style="{ backgroundColor: d.colour}"
                  class="colour-square" />
                <span>{{ d.label }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
import parse from 'date-fns/parse'
import subMonths from 'date-fns/subMonths'
import Papa from 'papaparse'
import _cloneDeep from 'lodash.clonedeep'

import {
  NGGI_RANGES,
  NGGI_RANGE_INTERVALS,
  RANGE_ALL,
  RANGE_ALL_12MTH_ROLLING
} from '@/constants/ranges.js'
import { INTERVAL_QUARTER, FILTER_NONE } from '@/constants/interval-filters.js'

import regionDisplayTzs from '@/constants/region-display-timezones.js'
import DateDisplay from '@/services/DateDisplay.js'
import { mutateDate } from '@/services/datetime-helpers.js'

import transformTo12MthRollingSum from '@/data/transform/emissions-quarter-12-month-rolling-sum'
import { dataRollUp, dataFilterByPeriod } from '@/data/parse/nggi-emissions/'

import EmissionsChart from '@/components/Charts/EmissionsChart'
import DataOptionsBar from '@/components/Energy/DataOptionsBar.vue'

const domainEmissions = [
  {
    label: 'Agriculture',
    id: 'agriculture',
    domain: 'agriculture',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#003f5c'
  },
  {
    label: 'Electricity',
    id: 'electricity',
    domain: 'electricity',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#2f4b7c'
  },
  {
    label: 'Fugitives',
    id: 'fugitives',
    domain: 'fugitives',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#665191'
  },
  {
    label: 'Industrial',
    id: 'industrial',
    domain: 'industrial',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#a05195'
  },
  {
    label: 'Land sector',
    id: 'land-sector',
    domain: 'land-sector',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#d45087'
  },
  {
    label: 'Stationary',
    id: 'stationary',
    domain: 'stationary',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#f95d6a'
  },
  {
    label: 'Transport',
    id: 'transport',
    domain: 'transport',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#ff7c43'
  },
  {
    label: 'Waste',
    id: 'waste',
    domain: 'waste',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#ffa600'
  }
]

export default {
  layout: 'no-container',

  components: {
    DataOptionsBar,
    EmissionsChart
  },

  data() {
    return {
      baseDataset: [],
      rollingDataset: [],
      dataset: [],
      zoomExtent: [],
      isHovering: false,
      hoverDate: null,
      range: RANGE_ALL,
      interval: INTERVAL_QUARTER,
      filterPeriod: FILTER_NONE
    }
  },

  computed: {
    averageEmissions() {
      const totalEmissions = this.dataset.reduce(
        (prev, cur) => prev + cur._totalEmissions,
        0
      )
      return totalEmissions / this.dataset.length
    }
  },

  created() {
    this.domains = domainEmissions.map(d => d)
    this.domainEmissions = domainEmissions.map(d => d).reverse()
    this.displayTz = regionDisplayTzs['au']
    this.ranges = NGGI_RANGES
    this.intervals = NGGI_RANGE_INTERVALS
  },

  mounted() {
    const url = 'https://data.dev.opennem.org.au/nggi/nggi-emissions.csv'

    this.$axios
      .get(url, { headers: { 'Content-Type': 'text/csv' } })
      .then(res => {
        const csvData = Papa.parse(res.data, { header: true })
        const data = csvData.data.map(d => {
          const obj = {}
          const date = subMonths(parse(d.Quarter, 'MMM-yyyy', new Date()), 2)

          obj.date = date
          obj.time = obj.date.getTime()
          obj.quarter = d.Quarter

          this.domainEmissions.forEach(domain => {
            obj[domain.id] = parseFloat(d[domain.label])
          })

          return obj
        })

        this.updateAxisGuides(data)

        this.baseDataset = data
        this.rollingDataset = transformTo12MthRollingSum(
          _cloneDeep(data),
          this.domainEmissions,
          true
        )

        const rolledUpData = dataRollUp({
          dataset: this.baseDataset,
          domains: this.domainEmissions,
          interval: this.interval
        })

        this.updateAxisGuides(rolledUpData)

        this.dataset = rolledUpData
      })
  },

  methods: {
    ...mapActions({
      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateXTicks: 'visInteract/doUpdateXTicks',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats'
    }),

    updateAxisGuides(data) {
      this.doUpdateXGuides({
        interval: this.interval,
        start: data[0].time,
        end: data[data.length - 1].time
      })

      this.doUpdateXTicks({
        range: this.range,
        interval: this.interval,
        isZoomed: false,
        filterPeriod: false
      })
    },

    handleDateHover(date) {
      this.hoverDate = DateDisplay.getClosestDateByInterval(
        date,
        this.interval,
        'All'
      )
    },

    handleIsHovering(hovering) {
      this.isHovering = hovering
    },

    handleZoomExtent(dateRange) {
      let filteredDates = []
      if (dateRange && dateRange.length > 0) {
        let startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        let endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )
        // if (this.interval === 'Fin Year') {
        //   startTime = addYears(startTime, 2)
        //   endTime = addYears(endTime, 1)
        // }

        filteredDates = [startTime, endTime]
      } else {
        filteredDates = []
      }

      this.zoomExtent = filteredDates
    },

    handleRangeChange(range) {
      this.range = range

      let dataset = this.baseDataset

      if (range === RANGE_ALL_12MTH_ROLLING) {
        dataset = this.rollingDataset
      }
      const rolledUpData = dataRollUp({
        dataset,
        domains: this.domainEmissions,
        interval: this.interval
      })

      this.dataset = rolledUpData
    },
    handleIntervalChange(interval) {
      this.interval = interval

      let dataset = this.baseDataset

      if (this.range === RANGE_ALL_12MTH_ROLLING) {
        dataset = this.rollingDataset
      }
      const rolledUpData = dataRollUp({
        dataset,
        domains: this.domainEmissions,
        interval
      })

      this.dataset = rolledUpData
    },

    handleFilterPeriodChange(period) {
      console.log(period)
      this.filterPeriod = period

      let dataset = this.baseDataset

      if (this.range === RANGE_ALL_12MTH_ROLLING) {
        dataset = this.rollingDataset
      }
      const rolledUpData = dataRollUp({
        dataset,
        domains: this.domainEmissions,
        interval: this.interval
      })

      this.dataset = dataFilterByPeriod({
        dataset: rolledUpData,
        interval: this.interval,
        period
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.container {
  max-width: 80%;
}
h1 {
  font-family: Playfair Display, Georgia, Times New Roman, Times, serif;
  font-weight: 700;
  font-size: 36px;
  margin: 2rem 0;
}
.colour-square {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 5px;
  border-radius: 4px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);

  @include mobile {
    display: inline;
    float: none;
  }
}
.chart-table {
  display: flex;
  gap: 2rem;

  .chart {
    width: 70%;
  }
  .table {
    width: 30%;
  }
}
</style>
