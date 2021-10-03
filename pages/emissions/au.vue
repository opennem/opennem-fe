<template>
  <div class="container">
    <header>
      <AppLogo class="header-logo" />
      <h1> NGGI Emissions</h1>
    </header>

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
        :domain-emissions="filteredDomains"
        :range="range"
        :interval="interval"
        :show-x-axis="true"
        :average-emissions="averageEmissions"
        :vis-height="600"
        :hover-on="isHovering"
        :hover-date="hoverDate"
        :zoom-extent="zoomExtent"
        :filter-period="filterPeriod"
        :hidden-domains="hidden"
        :compare-dates="compareDates"
        :show-total-line="true"
        :use-offset-diverge="true"
        class="chart"
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering"
        @zoomExtent="handleZoomExtent"
        @svgClick="handleSvgClick"
      />

      <CompareChart
        v-if="compareDifference"
        :compare-data="compareData"
        :domains="filteredDomains"
        :range="range"
        :interval="interval"
      />

      <NggiLegend
        :domains="domainEmissions"
        :hidden="hidden"
        @rowClick="handleTypeClick"
        @rowShiftClick="handleTypeShiftClick"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from 'vuex'
import parse from 'date-fns/parse'
import subMonths from 'date-fns/subMonths'
import Papa from 'papaparse'
import _cloneDeep from 'lodash.clonedeep'
import _includes from 'lodash.includes'

import {
  NGGI_RANGES,
  NGGI_RANGE_INTERVALS,
  RANGE_ALL_12MTH_ROLLING
} from '@/constants/ranges.js'
import { INTERVAL_QUARTER, FILTER_NONE } from '@/constants/interval-filters.js'

import regionDisplayTzs from '@/constants/region-display-timezones.js'
import DateDisplay from '@/services/DateDisplay.js'

import transformTo12MthRollingSum from '@/data/transform/emissions-quarter-12-month-rolling-sum'
import { dataRollUp, dataFilterByPeriod } from '@/data/parse/nggi-emissions/'

import AppLogo from '~/components/ui/Logo'
import EmissionsChart from '@/components/Charts/EmissionsChart'
import NggiLegend from '@/components/Nggi/Legend'
import DataOptionsBar from '@/components/Energy/DataOptionsBar.vue'
import CompareChart from '@/components/Nggi/CompareChart'

const domainEmissions = [
  {
    label: 'Land sector',
    id: 'land-sector',
    domain: 'land-sector',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#4A772F'
  },
  {
    label: 'Agriculture',
    id: 'agriculture',
    domain: 'agriculture',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#79350F'
  },
  {
    label: 'Electricity',
    id: 'electricity',
    domain: 'electricity',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#3C67BC'
  },
  {
    label: 'Fugitives',
    id: 'fugitives',
    domain: 'fugitives',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#EA722B'
  },
  {
    label: 'Industrial',
    id: 'industrial',
    domain: 'industrial',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#F7C4A3'
  },

  {
    label: 'Stationary',
    id: 'stationary',
    domain: 'stationary',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#FFB800'
  },
  {
    label: 'Transport',
    id: 'transport',
    domain: 'transport',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#9B9B9B'
  },
  {
    label: 'Waste',
    id: 'waste',
    domain: 'waste',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#223C6D'
  }
]

export default {
  layout: 'no-container',

  components: {
    AppLogo,
    DataOptionsBar,
    NggiLegend,
    EmissionsChart,
    CompareChart
  },

  data() {
    return {
      baseDataset: [],
      rollingDataset: [],
      dataset: [],
      domains: [],
      hidden: ['land-sector'],
      zoomExtent: [],
      isHovering: false,
      hoverDate: null,
      range: RANGE_ALL_12MTH_ROLLING,
      interval: INTERVAL_QUARTER,
      filterPeriod: FILTER_NONE,
      compareData: []
    }
  },

  computed: {
    ...mapGetters({
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',

      compareDifference: 'compareDifference',
      compareDates: 'compareDates'
    }),
    averageEmissions() {
      const totalEmissions = this.dataset.reduce(
        (prev, cur) => prev + cur._totalEmissions,
        0
      )
      return totalEmissions / this.dataset.length
    },

    filteredDomains() {
      console.log(this.domains)
      return this.domains.filter(d => !_includes(this.hidden, d.id))
    }
  },

  watch: {
    compareDifference(compare) {
      if (!compare) {
        this.compareData = []
        this.$store.dispatch('compareDates', [])
      }
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
          dataset: this.rollingDataset,
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

    ...mapMutations({
      setFocusDate: 'visInteract/focusDate',
      setCompareDifference: 'compareDifference'
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
    },

    handleTypeClick(id) {
      const index = this.hidden.indexOf(id)

      if (index === -1) {
        this.hidden.push(id)
      } else {
        this.hidden.splice(index, 1)
      }

      if (this.hidden.length === this.domainEmissions.length) {
        this.hidden = []
      }

      console.log(this.hidden)
    },

    handleTypeShiftClick(id) {
      const toBeHidden = this.domainEmissions.filter(d => d.id !== id)
      this.hidden = toBeHidden.map(d => d.id)
    },

    getDataByTime(dataset, time) {
      return dataset.find(d => d.time === time)
    },

    handleSvgClick(metaKey) {
      console.log(metaKey)
      if (metaKey && this.focusOn && !this.compareDifference) {
        this.setCompareDifference(true)

        const hoverTime = this.hoverDate ? this.hoverDate.getTime() : 0
        const focusTime = this.focusDate ? this.focusDate.getTime() : 0
        const firstData = this.getDataByTime(this.dataset, focusTime)
        const secondData = this.getDataByTime(this.dataset, hoverTime)

        setTimeout(() => {
          this.$store.dispatch('compareDates', [focusTime, hoverTime])
          this.compareData = [firstData, secondData].slice()
          this.setFocusDate(null)
        }, 10)
      } else {
        if (this.compareDifference) {
          const hoverTime = this.hoverDate ? this.hoverDate.getTime() : 0
          let newCompare = false
          let compareDates = this.compareDates.slice()
          if (compareDates.length === 2) {
            const newCompareDates = compareDates.filter(d => d !== hoverTime)
            if (newCompareDates.length === 1) {
              compareDates = newCompareDates
              newCompare = true
            } else {
              compareDates.pop()
            }
          }
          if (compareDates.length < 2 && !newCompare) {
            const newCompareDates = compareDates.filter(d => d !== hoverTime)
            if (newCompareDates.length === 0) {
              compareDates = newCompareDates
            } else {
              compareDates.push(hoverTime)
            }
          }
          if (compareDates.length === 2) {
            const firstData = this.getDataByTime(this.dataset, compareDates[0])
            const secondData = this.getDataByTime(this.dataset, compareDates[1])
            this.compareData = [firstData, secondData]
          }
          if (compareDates.length === 0) {
            this.setCompareDifference(false)
          }
          this.$store.dispatch('compareDates', compareDates)
        } else if (!this.isTouchDevice) {
          const hoverTime = this.hoverDate ? this.hoverDate.getTime() : 0
          const focusTime = this.focusDate ? this.focusDate.getTime() : 0
          if (this.focusDate && focusTime === hoverTime) {
            this.setFocusDate(null)
          } else {
            this.setFocusDate(this.hoverDate)
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.container {
  max-width: 80%;

  @include mobile {
    max-width: 100%;
  }
}
header {
  color: #000;
  display: flex;
  align-items: center;
  padding: $app-padding / 2;
  background-color: $background-alpha;
  margin: 2rem 0;

  @include mobile {
    margin: 1rem 0.5rem;
  }

  .header-logo {
    width: 2.3rem;
    max-height: 2.3rem;
    margin: 0.2rem $app-padding / 2;
  }
}

h1 {
  font-family: Playfair Display, Georgia, Times New Roman, Times, serif;
  font-weight: 700;
  font-size: 1.3rem;
  margin: 0;
}

.chart-table {
  // display: flex;
  // gap: 2rem;

  .chart {
    width: 100%;
  }
  .table {
    background-color: transparent;
  }
}
</style>
