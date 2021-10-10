<template>
  <div class="wrapper">
    <header>
      <AppLogo class="header-logo" />
      <h1>Emissions</h1>
    </header>

    <!-- <DataOptionsBar
      :ranges="ranges"
      :intervals="intervals"
      :range="range"
      :interval="interval"
      :filter-period="filterPeriod"
      @rangeChange="handleRangeChange"
      @rangeOptionChange="handleRangeChange"
      @intervalChange="handleIntervalChange"
      @filterPeriodChange="handleFilterPeriodChange" 
      style="position: relative; margin-bottom: 1rem;" />  -->
    
    <!-- <div class="buttons">
      <button class="button is-small is-rounded is-selected">Rolling Sum</button>
      <button class="button is-small is-rounded is-selected">Quarter</button>
    </div> -->

    <!-- <DatesDisplay
      :is-hovering="isHovering"
      :hovered-date="hoverDate ? hoverDate.getTime() : null"
      :focus-on="focusOn"
      :focus-date="focusDate ? focusDate.getTime() : null"
      :start-date="startDate"
      :end-date="endDate"
      :range="range"
      :interval="interval"
      :timezone-string="''"
    /> -->

    <div class="dataset-selection">
      <div class="buttons has-addons">
        <button
          :class="{ 'is-selected': datasetView === 'quarter' }"
          class="button" 
          @click="handleQuarterViewSelect">Quarterly <strong>2005 — 2021</strong></button>
        <button
          :class="{ 'is-selected': datasetView === 'year' }"
          class="button" 
          @click="handleYearViewSelect">Annual <strong>1990 — 2020</strong></button>
      </div>
      <button
        v-if="datasetView === 'year'"
        :class="{ 'is-selected': addProjections }"
        class="button" 
        @click="handleProjectionsToggle">Projections <strong>2021 — 2030</strong></button>
    </div>

    <div class="emissions-range-dates">
      <h2>
        <!-- <time v-if="isHovering">
          {{ hoverDate | customFormatDate({ range, interval, showIntervalRange: true }) }}
        </time>

        <time v-if="!isHovering && focusOn">
          {{ focusDate | customFormatDate({ range, interval, showIntervalRange: true }) }}
        </time> -->

        <!-- <span v-if="!isHovering && !focusOn"> -->
        <span>
          <time>
            {{ startDate | customFormatDate({ range: 'ALL', interval: 'Year', isStart: true }) }}
          </time>
          –
          <time>
            {{ endDate | customFormatDate({ range: 'ALL', interval: 'Year', isEnd: false }) }}
          </time>
        </span>
      </h2>

      

      <!-- <h3>
        12 month rolling sum
      </h3> -->
    </div>
    

    <div class="chart-table">
      <EmissionsChart
        v-if="dataset.length > 0"
        :emissions-dataset="dataset"
        :emissions-projection-dataset="isYearDatasetView && addProjections ? projectionDataset : []"
        :domain-emissions="filteredDomains"
        :range="range"
        :interval="interval"
        :show-x-axis="true"
        :average-emissions="averageEmissions"
        :vis-height="tabletBreak ? 300 : 600"
        :hover-on="isHovering"
        :hover-date="hoverDate"
        :zoom-extent="zoomExtent"
        :filter-period="filterPeriod"
        :hidden-domains="hidden"
        :compare-dates="compareDates"
        :show-total-line="showTotalLine"
        :use-offset-diverge="true"
        :custom-interval="'year'"
        :incomplete-intervals="isYearDatasetView && addProjections ? projectionsInterval : []"
        :show-average-value="false"
        class="chart"
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering"
        @zoomExtent="handleZoomExtent"
        @svgClick="handleSvgClick"
        @changeDataset="handleChangeDatasetChange"
      />

      <div 
        v-if="compareDifference" 
        class="compare-chart">
        <a 
          class="close-button" 
          @click.prevent="() => setCompareDifference(false)">
          <i class="fal fa-times-circle" />
        </a>

        <CompareChart
          :compare-data="compareData"
          :domains="filteredDomains"
          :range="range"
          :interval="interval"
        />
      </div>
      

      <!-- <NggiLegend
        :domains="domainEmissions"
        :hidden="hidden"
        :show-total="showTotalLine"
        :show-total-in-legend="isStackedChartType"
        @rowClick="handleTypeClick"
        @rowShiftClick="handleTypeShiftClick"
        @totalClick="handleTotalClick"
        @totalShiftClick="handleTotalShiftClick"
      /> -->

      <BarChart
        :bar-width="300"
        :domains="domainEmissions"
        :hidden="hidden"
        :dataset="filteredDataset"
        :hover-on="isHovering" 
        :hover-date="hoverDate"
        :focus-on="focusOn"
        :focus-date="focusDate"
        :show-total="showTotalLine"
        :show-total-in-legend="isStackedChartType"
        class="bar-chart"
        @rowClick="handleTypeClick"
        @rowShiftClick="handleTypeShiftClick"
        @totalClick="handleTotalClick"
        @totalShiftClick="handleTotalShiftClick"
      />
      <!-- :highlight-domain="highlightId" -->

    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from 'vuex'
import parse from 'date-fns/parse'
import subMonths from 'date-fns/subMonths'
import subDays from 'date-fns/subDays'
import isAfter from 'date-fns/isAfter'
import Papa from 'papaparse'
import _cloneDeep from 'lodash.clonedeep'
import _includes from 'lodash.includes'
import { timeYear } from 'd3-time'
import { timeFormat } from 'd3-time-format'

import {
  NGGI_RANGES,
  NGGI_RANGE_INTERVALS,
  RANGE_ALL_12MTH_ROLLING,
  RANGE_ALL
} from '@/constants/ranges.js'
import {
  INTERVAL_QUARTER,
  INTERVAL_YEAR,
  FILTER_NONE
} from '@/constants/interval-filters.js'
import * as OPTIONS from '@/constants/chart-options.js'

import regionDisplayTzs from '@/constants/region-display-timezones.js'
import DateDisplay from '@/services/DateDisplay.js'

import transformTo12MthRollingSum from '@/data/transform/emissions-quarter-12-month-rolling-sum'
import { dataRollUp, dataFilterByPeriod } from '@/data/parse/nggi-emissions/'

import AppLogo from '~/components/ui/Logo'
import EmissionsChart from '@/components/Charts/EmissionsChart'
import NggiLegend from '@/components/Nggi/Legend'
import DataOptionsBar from '@/components/Energy/DataOptionsBar.vue'
import CompareChart from '@/components/Nggi/CompareChart'
import DatesDisplay from '@/components/SummaryTable/DatesDisplay'
import BarChart from '@/components/Nggi/BarChart.vue'

const domainEmissions = [
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
  },
  {
    label: 'Land sector',
    id: 'land-sector',
    domain: 'land-sector',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#4A772F'
  }
]

export default {
  layout: 'no-container',

  components: {
    AppLogo,
    DataOptionsBar,
    NggiLegend,
    EmissionsChart,
    CompareChart,
    DatesDisplay,
    BarChart
  },

  head() {
    return {
      title: `: Australia’s latest greenhouse gas emissions`,
      meta: [
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: `OpenNEM: Australia’s latest greenhouse gas emissions`
        },
        {
          hid: 'twitter:image:src',
          name: 'twitter:image:src',
          content: this.cardFilename
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: `OpenNEM: Australia’s latest greenhouse gas emissions`
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: this.cardFilename
        },
        {
          hid: 'og:image:width',
          property: 'og:image:width',
          content: '1447'
        },
        {
          hid: 'og:image:height',
          property: 'og:image:height',
          content: '932'
        }
      ]
    }
  },

  data() {
    return {
      datasetView: 'quarter',
      addProjections: false,
      baseUrl: `${this.$config.url}/images/screens/`,
      baseDataset: [],
      rollingDataset: [],
      dataset: [],
      projectionDataset: [],
      domains: [],
      hidden: ['land-sector'],
      zoomExtent: [],
      isHovering: false,
      hoverDate: null,
      range: RANGE_ALL_12MTH_ROLLING,
      interval: INTERVAL_QUARTER,
      filterPeriod: FILTER_NONE,
      compareData: [],
      showTotalLine: true
    }
  },

  computed: {
    ...mapGetters({
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      chartType: 'chartOptionsEmissionsVolume/chartType',

      compareDifference: 'compareDifference',
      compareDates: 'compareDates',

      tabletBreak: 'app/tabletBreak'
    }),
    filteredDataset() {
      const dataset =
        this.isYearDatasetView && this.addProjections
          ? [...this.dataset, ...this.projectionDataset]
          : this.dataset

      if (this.zoomExtent.length > 0) {
        return dataset.filter(
          d => d.date >= this.zoomExtent[0] && d.date < this.zoomExtent[1]
        )
      }

      return dataset
    },

    isStackedChartType() {
      return this.chartType === OPTIONS.CHART_STACKED
    },

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
    },

    cardFilename() {
      return `${this.baseUrl}opennem-emissions-au.png`
    },

    startDate() {
      if (this.zoomExtent.length > 0) {
        return this.zoomExtent[0]
      }

      const dataLength = this.dataset.length
      return dataLength > 0 ? this.dataset[0].time : null
    },

    endDate() {
      if (this.zoomExtent.length > 0) {
        return subDays(this.zoomExtent[1], 1)
      }

      const dataset = this.hasProjectionDataset
        ? this.projectionDataset
        : this.dataset
      const dataLength = dataset.length
      return dataLength > 0 ? dataset[dataLength - 1].time : null
    },

    isYearDatasetView() {
      return this.datasetView === 'year'
    },

    isQuarterDatasetView() {
      return this.datasetView === 'quarter'
    },

    hasProjectionDataset() {
      return this.addProjections && this.projectionDataset.length > 0
    }
  },

  watch: {
    compareDifference(compare) {
      if (!compare) {
        this.compareData = []
        this.$store.dispatch('compareDates', [])
      }
    },

    datasetView(val) {
      this.setCompareDifference(false)
      if (val === 'quarter') {
        this.getQuarterData()
      } else {
        this.getYearData()
        this.getProjectionData()
      }
      this.updateAxisGuides()
    },

    tabletBreak(val) {
      console.log(val)
      if (val) {
        this.updateAxisGuides(10)
      } else {
        this.updateAxisGuides(0.1)
      }
    }
  },

  created() {
    this.domains = domainEmissions.map(d => d)
    this.domainEmissions = domainEmissions.map(d => d).reverse()
    this.displayTz = regionDisplayTzs['au']
    this.ranges = NGGI_RANGES
    this.intervals = NGGI_RANGE_INTERVALS
    this.afterDate = new Date(2004, 11, 31)

    this.projectionsInterval = [
      {
        start: new Date(2021, 0, 1),
        end: new Date(2030, 11, 31)
      }
    ]
  },

  mounted() {
    this.getQuarterData()
  },

  methods: {
    ...mapActions({
      // doUpdateXGuides: 'visInteract/doUpdateXGuides',
      // doUpdateXTicks: 'visInteract/doUpdateXTicks',
      // doUpdateTickFormats: 'visInteract/doUpdateTickFormats'
    }),

    ...mapMutations({
      setFocusDate: 'visInteract/focusDate',
      setXTicks: 'visInteract/xTicks',
      setXGuides: 'visInteract/xGuides',
      setTickFormat: 'visInteract/tickFormat',
      setCompareDifference: 'compareDifference'
    }),

    getQuarterData() {
      const url =
        'https://data.dev.opennem.org.au/nggi/nggi-emissions-2001-2021-quarterly.csv'

      this.$axios
        .get(url, { headers: { 'Content-Type': 'text/csv' } })
        .then(res => {
          const csvData = Papa.parse(res.data, { header: true })
          const data = csvData.data.map(d => {
            let total = 0
            const obj = {}
            const date = subMonths(parse(d.Quarter, 'MMM-yyyy', new Date()), 2)

            obj.date = date
            obj.time = obj.date.getTime()
            obj.quarter = d.Quarter

            this.domainEmissions.forEach(domain => {
              const val = parseFloat(d[domain.label])
              obj[domain.id] = val
              total += val
            })

            obj._total = total

            return obj
          })

          this.range = RANGE_ALL_12MTH_ROLLING
          this.interval = INTERVAL_QUARTER
          this.updateAxisGuides()

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

          rolledUpData.forEach(d => {
            let total = 0
            this.domainEmissions.forEach(domain => {
              total += d[domain.id] || 0
            })
            d._total = total
          })

          console.log(rolledUpData)

          this.dataset = rolledUpData.filter(d =>
            isAfter(d.date, this.afterDate)
          )
        })
    },

    getYearData() {
      const url =
        'https://data.dev.opennem.org.au/nggi/nggi-emissions-1990-2020-yearly.csv'

      this.$axios
        .get(url, { headers: { 'Content-Type': 'text/csv' } })
        .then(res => {
          const csvData = Papa.parse(res.data, { header: true })

          const data = csvData.data.map(d => {
            let total = 0
            const obj = {}
            const date = parse(d.Year, 'yyyy', new Date())
            obj.date = date
            obj.time = obj.date.getTime()
            obj.year = d.Year

            this.domainEmissions.forEach(domain => {
              const val = parseFloat(d[domain.label])
              obj[domain.id] = val
              total += val
            })

            obj._total = total

            return obj
          })

          this.range = RANGE_ALL
          this.interval = INTERVAL_YEAR
          this.updateAxisGuides()
          this.dataset = data
        })
    },

    getProjectionData() {
      const url =
        'https://data.dev.opennem.org.au/nggi/nggi-emissions-projections-2021-2030-yearly.csv'

      this.$axios
        .get(url, { headers: { 'Content-Type': 'text/csv' } })
        .then(res => {
          const csvData = Papa.parse(res.data, { header: true })

          const data = csvData.data.map(d => {
            let total = 0
            const obj = {}
            const date = parse(d.Year, 'yyyy', new Date())
            obj.date = date
            obj.time = obj.date.getTime()
            obj.year = d.Year

            this.domainEmissions.forEach(domain => {
              const val = parseFloat(d[domain.label])
              obj[domain.id] = val
              total += val
            })

            obj._total = total
            return obj
          })

          // this.range = RANGE_ALL
          // this.interval = INTERVAL_YEAR
          // this.updateAxisGuides()
          this.projectionDataset = data
        })
    },

    updateAxisGuides(year) {
      const y = this.tabletBreak ? timeYear.every(4) : timeYear.every(1)
      const formatYear = timeFormat('%Y')
      const format = date => formatYear(date)
      this.setXTicks(y)
      this.setXGuides([])
      this.setTickFormat(format)
    },

    handleDateHover(date) {
      this.hoverDate = DateDisplay.getClosestDateByInterval(
        date,
        this.interval,
        this.filterPeriod
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

    // handleRangeChange(range) {
    //   this.range = range

    //   let dataset = this.baseDataset

    //   if (range === RANGE_ALL_12MTH_ROLLING) {
    //     dataset = this.rollingDataset
    //   }
    //   const rolledUpData = dataRollUp({
    //     dataset,
    //     domains: this.domainEmissions,
    //     interval: this.interval
    //   })

    //   this.dataset = rolledUpData.filter(d => isAfter(d.date, this.afterDate))
    // },
    // handleIntervalChange(interval) {
    //   console.log(interval)
    //   this.interval = interval

    //   let dataset = this.baseDataset

    //   if (this.range === RANGE_ALL_12MTH_ROLLING) {
    //     dataset = this.rollingDataset
    //   }
    //   const rolledUpData = dataRollUp({
    //     dataset,
    //     domains: this.domainEmissions,
    //     interval
    //   })

    //   this.dataset = rolledUpData.filter(d => isAfter(d.date, this.afterDate))
    // },
    // handleFilterPeriodChange(period) {
    //   console.log(period)
    //   this.filterPeriod = period

    //   let dataset = this.baseDataset

    //   if (this.range === RANGE_ALL_12MTH_ROLLING) {
    //     dataset = this.rollingDataset
    //   }
    //   const rolledUpData = dataRollUp({
    //     dataset,
    //     domains: this.domainEmissions,
    //     interval: this.interval
    //   })

    //   this.dataset = dataFilterByPeriod({
    //     dataset: rolledUpData.filter(d => isAfter(d.date, this.afterDate)),
    //     interval: this.interval,
    //     period
    //   })
    // },

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

    handleTotalClick() {
      this.showTotalLine = !this.showTotalLine
    },
    handleTotalShiftClick() {},

    getDataByTime(dataset, time) {
      return dataset.find(d => d.time === time)
    },

    handleSvgClick(metaKey) {
      const dataset = this.hasProjectionDataset
        ? [..._cloneDeep(this.dataset), ..._cloneDeep(this.projectionDataset)]
        : _cloneDeep(this.dataset)

      if (metaKey && this.focusOn && !this.compareDifference) {
        this.setCompareDifference(true)

        const hoverTime = this.hoverDate ? this.hoverDate.getTime() : 0
        const focusTime = this.focusDate ? this.focusDate.getTime() : 0
        const firstData = this.getDataByTime(dataset, focusTime)
        const secondData = this.getDataByTime(dataset, hoverTime)

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
            const firstData = this.getDataByTime(dataset, compareDates[0])
            const secondData = this.getDataByTime(dataset, compareDates[1])
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
    },

    handleQuarterViewSelect() {
      this.datasetView = 'quarter'
      this.addProjections = false
    },

    handleYearViewSelect() {
      this.datasetView = 'year'
    },

    handleProjectionsToggle() {
      this.addProjections = !this.addProjections
    },

    handleChangeDatasetChange(dataset) {
      // console.log(dataset[dataset.length - 1]._totalChange)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.wrapper {
  padding-right: 10px;

  @include mobile {
    padding-right: 0;
  }
}

header {
  color: #000;
  display: flex;
  align-items: center;
  padding: $app-padding / 2;
  background-color: $background-alpha;
  margin: 2rem 0 0;

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

.emissions-range-dates {
  position: absolute;
  right: 1rem;
  margin-top: -3.3rem;
  color: #333;
  h2 {
    font-weight: 100;
    font-size: 1.4rem;
  }
  h3 {
    font-family: Playfair Display, Georgia, Times New Roman, Times, serif;
    font-weight: 700;
    font-size: 1.1rem;
  }

  @include mobile {
    position: relative;
    margin: 10px 0;
    right: 0;
    text-align: center;
  }
}

.buttons {
  margin: 1rem;
  .is-small {
    border-radius: 100px;
  }
}

.compare-chart {
  position: relative;
  margin-left: 1rem;
  .close-button {
    position: absolute;
    right: 1rem;
    top: 1.3em;
    font-size: 1.3em;
  }
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

.dataset-selection {
  display: flex;
  align-items: center;

  strong {
    margin-left: 10px;
  }

  @include mobile {
    background-color: rgba(255, 255, 255, 0.5);
    display: block;
    text-align: center;

    .buttons {
      margin: 0;
      justify-content: center;
      border-radius: 0;
    }

    .button {
      border-radius: 0;
    }
  }
}

.bar-chart {
  width: 400px;
  margin: 0 auto;

  @include mobile {
    width: 100%;
    padding: 2rem;
  }
}

// ::v-deep .x-axis {
//   .tick:last-child text {
//     text-anchor: end;
//   }
// }
</style>
