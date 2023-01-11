<template>
  <div class="wrapper">
    <div class="dataset-selection">
      <div class="buttons has-addons">
        <button 
          :class="{ 'is-selected': isQuarterDatasetView }" 
          class="button" 
          @click="handleQuarterViewSelect">
          Quarter
        </button>
        <button 
          :class="{ 'is-selected': isYearDatasetView }" 
          class="button" 
          @click="handleYearViewSelect">
          Year
        </button>
      </div>

      <div class="buttons">
        <button 
          v-if="isYearDatasetView" 
          :class="{ 'is-selected': addHistory }" 
          class="button"
          @click="handleHistoryToggle">
          History <strong>FY 1990 — 2004</strong>
        </button>
        <button 
          v-if="isYearDatasetView" 
          :class="{ 'is-selected': addProjections }" 
          class="button"
          @click="handleProjectionsToggle">
          Projections <strong>FY 2021 — 2035</strong>
        </button>
      </div>
    </div>

    <div class="chart-table">
      <div class="chart-wrapper">
        <div class="emissions-range-dates">
          <h2>
            <span v-if="isYearDatasetView">FY</span>

            <span v-if="isHovering">
              {{ hoverDate | customFormatDate({ range, interval }) }}
            </span>

            <span v-else>
              <time>
                {{
                  startDate
                    | customFormatDate({
                      range: 'ALL',
                      interval: 'Year',
                      isStart: true
                    })
                }}
              </time>
              –
              <time>
                {{
                  endDate
                    | customFormatDate({
                      range: 'ALL',
                      interval: 'Year',
                      isEnd: false
                    })
                }}
              </time>
            </span>
          </h2>
        </div>
        <EmissionsChart 
          v-if="!fetching && dataset.length > 0" 
          :emissions-dataset="dataset"
          :emissions-projection-dataset="
            isYearDatasetView && addProjections ? projectionDataset : []
          " 
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
          :incomplete-intervals="
            isYearDatasetView && addProjections ? projectionsInterval : []
          " 
          :show-average-value="false" 
          @dateHover="handleDateHover" 
          @isHovering="handleIsHovering"
          @zoomExtent="handleZoomExtent" 
          @svgClick="handleSvgClick" 
          @changeDataset="handleChangeDatasetChange" />
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
            :domains="filteredDomainEmissions" 
            :range="range"
            :interval="interval" 
            :unit="chartCurrentUnit" 
            :is-f-y="isYearDatasetView" />
        </div>
      </div>
      <BarChart 
        :bar-width="200" 
        :domains="domainEmissions" 
        :hidden="hidden" 
        :dataset="filteredDataset"
        :hover-on="isHovering" 
        :hover-date="hoverDate" 
        :focus-on="focusOn" 
        :focus-date="focusDate"
        :show-total="showTotalLine" 
        :show-total-in-legend="isStackedChartType" 
        class="legend-bar"
        @rowClick="handleTypeClick" 
        @rowShiftClick="handleTypeShiftClick" 
        @totalClick="handleTotalClick"
        @totalShiftClick="handleTotalShiftClick" 
        @mouseEnter="handleMouseEnter" 
        @mouseLeave="handleMouseLeave" />
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
  EMISSIONS_RANGES,
  EMISSIONS_RANGE_INTERVALS,
  RANGE_ALL_12MTH_ROLLING,
  RANGE_ALL
} from '@/constants/ranges.js'
import {
  INTERVAL_QUARTER,
  INTERVAL_YEAR,
  FILTER_NONE
} from '@/constants/interval-filters.js'
import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si'

import regionDisplayTzs from '@/constants/region-display-timezones.js'
import DateDisplay from '@/services/DateDisplay.js'

import transformTo12MthRollingSum from '@/data/transform/emissions-quarter-12-month-rolling-sum'
import { dataRollUp } from '@/data/parse/nggi-emissions/'

import EmissionsChart from '@/components/Charts/EmissionsChart'
import DataOptionsBar from '@/components/Energy/DataOptionsBar.vue'
import CompareChart from '@/components/Nggi/CompareChart'
import DatesDisplay from '@/components/SummaryTable/DatesDisplay'
import BarChart from '@/components/Nggi/BarChart.vue'

const domainEmissions = [
  {
    csvLabel: 'Agriculture',
    label: 'Agriculture',
    id: 'agriculture',
    domain: 'agriculture',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#79350F',
    description: `Emissions from agricultural sources other than energy, <br>land clearing and landfill and liquid wastes <br> <em>(e.g. ruminant methane, fertiliser application)</em>`
  },
  {
    csvLabel: 'Electricity',
    label: 'Electricity',
    id: 'electricity',
    domain: 'electricity',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#3C67BC',
    description: `Emissions from creating power provided to a public electricity network <br> <em>(e.g. generators operating in the NEM, SWIS, DKIS)</em>`
  },
  {
    csvLabel: 'Fugitives',
    label: 'Fugitives',
    id: 'fugitives',
    domain: 'fugitives',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#EA722B',
    description: `Non-productive supply chain emissions from fossil fuel production and transport<br> <em>(e.g. emissions from venting and flaring in gas production, emissions released from <br>coal seams during coal mining)</em>`
  },
  {
    csvLabel: 'Industrial',
    label: 'Industrial processes',
    id: 'industrial',
    domain: 'industrial',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#F7C4A3',
    description: `Chemical and other industrial sources, including fossil fuels used as a chemical feedstock<br> <em>(e.g. coke use in steel-making, gas use in fertiliser manufacture)</em>`
  },

  {
    csvLabel: 'Stationary',
    label: 'Other stationary',
    id: 'stationary',
    domain: 'stationary',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#FFB800',
    description: `Emissions produced providing energy on-site, other than transport of electricity<br> <em>(e.g. industrial heat, household gas, on-site electricity)</em>`
  },
  {
    csvLabel: 'Transport',
    label: 'Transport',
    id: 'transport',
    domain: 'transport',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#9B9B9B',
    description: `Emissions produced to drive domestic transport <br> <em>(e.g. cars, trucks, trains, planes, and boats)</em>`
  },
  {
    csvLabel: 'Waste',
    label: 'Waste',
    id: 'waste',
    domain: 'waste',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#223C6D',
    description: `Emissions from solid and liquid wastes<br> <em>(e.g. landfill, sewage)</em>`
  },
  {
    csvLabel: 'Land sector',
    label: 'Land management',
    id: 'land-sector',
    domain: 'land-sector',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#4A772F',
    description: `Emissions from clearing, restoration and conversion of managed lands <br> <em>(e.g. natural regrowth of managed forests, clearing for agricultural and forestry purposes)</em>`
  }
]

const domainEmissionsObj = {
  Agriculture: {
    label: 'Agriculture',
    id: 'agriculture',
    domain: 'agriculture',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#79350F',
    description: `Emissions from agricultural sources other than energy, <br>land clearing and landfill and liquid wastes <br> <em>(e.g. ruminant methane, fertiliser application)</em>`
  },
  Electricity: {
    label: 'Electricity',
    id: 'electricity',
    domain: 'electricity',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#3C67BC',
    description: `Emissions from creating power provided to a public electricity network <br> <em>(e.g. generators operating in the NEM, SWIS, DKIS)</em>`
  },
  Fugitives: {
    label: 'Fugitives',
    id: 'fugitives',
    domain: 'fugitives',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#EA722B',
    description: `Non-productive supply chain emissions from fossil fuel production and transport<br> <em>(e.g. emissions from venting and flaring in gas production, emissions released from <br>coal seams during coal mining)</em>`
  },
  'Industrial processes': {
    label: 'Industrial processes',
    id: 'industrial',
    domain: 'industrial',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#F7C4A3',
    description: `Chemical and other industrial sources, including fossil fuels used as a chemical feedstock<br> <em>(e.g. coke use in steel-making, gas use in fertiliser manufacture)</em>`
  },
  'Stationary energy': {
    label: 'Other stationary',
    id: 'stationary',
    domain: 'stationary',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#FFB800',
    description: `Emissions produced providing energy on-site, other than transport of electricity<br> <em>(e.g. industrial heat, household gas, on-site electricity)</em>`
  },
  Transport: {
    label: 'Transport',
    id: 'transport',
    domain: 'transport',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#9B9B9B',
    description: `Emissions produced to drive domestic transport <br> <em>(e.g. cars, trucks, trains, planes, and boats)</em>`
  },
  Waste: {
    label: 'Waste',
    id: 'waste',
    domain: 'waste',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#223C6D',
    description: `Emissions from solid and liquid wastes<br> <em>(e.g. landfill, sewage)</em>`
  },
  LULUCF: {
    label: 'Land management',
    id: 'land-sector',
    domain: 'land-sector',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#4A772F',
    description: `Emissions from clearing, restoration and conversion of managed lands <br> <em>(e.g. natural regrowth of managed forests, clearing for agricultural and forestry purposes)</em>`
  }
}

export default {
  layout: 'main',

  components: {
    DataOptionsBar,
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
      fetching: false,
      datasetView: INTERVAL_QUARTER,
      addHistory: false,
      addProjections: false,
      baseUrl: `${this.$config.url}/images/screens/`,
      baseDataset: [],
      rollingDataset: [],
      dataset: [],
      yearlyDataset: [],
      historyDataset: [],
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
      chartCurrentUnit: 'chartOptionsEmissionsVolume/chartCurrentUnit',

      compareDifference: 'compareDifference',
      compareDates: 'compareDates',

      tabletBreak: 'app/tabletBreak',
      widthBreak: 'app/widthBreak',
      wideScreenBreak: 'app/wideScreenBreak'
    }),

    queryInterval() {
      return this.$route.query.interval
    },

    queryHistory() {
      return this.$route.query.history
    },

    queryProjections() {
      return this.$route.query.projections
    },

    filteredDataset() {
      const dataset =
        this.isYearDatasetView && this.addProjections
          ? [...this.dataset, ...this.projectionDataset]
          : this.dataset

      if (this.zoomExtent.length > 0) {
        return dataset.filter(
          (d) => d.date >= this.zoomExtent[0] && d.date < this.zoomExtent[1]
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
      return this.domains.filter((d) => !_includes(this.hidden, d.id))
    },

    filteredDomainEmissions() {
      return this.domainEmissions.filter((d) => !_includes(this.hidden, d.id))
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
      return this.datasetView === INTERVAL_YEAR
    },

    isQuarterDatasetView() {
      return this.datasetView === INTERVAL_QUARTER
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
      if (val === INTERVAL_QUARTER) {
        this.getQuarterData()
      } else {
        this.getYearData()
      }
    },

    tabletBreak() {
      this.updateAxisGuides()
    },

    widthBreak() {
      this.updateAxisGuides()
    },

    wideScreenBreak() {
      this.updateAxisGuides()
    }
  },

  created() {
    this.domains = domainEmissions.map((d) => d)
    this.domainEmissions = domainEmissions.map((d) => d).reverse()
    this.displayTz = regionDisplayTzs['au']
    this.ranges = EMISSIONS_RANGES
    this.intervals = EMISSIONS_RANGE_INTERVALS
    this.afterDate = new Date(2004, 11, 31)

    this.projectionsInterval = [
      {
        start: new Date(2021, 0, 1),
        end: new Date(2035, 11, 31)
      }
    ]
    this.$store.dispatch('currentView', 'emissions')
    this.setStepCurve()
  },

  mounted() {
    let interval = this.queryInterval
    let projections = this.queryProjections
    let history = this.queryHistory

    if (!this.queryInterval) {
      interval = INTERVAL_QUARTER
    }
    if (interval === INTERVAL_QUARTER) {
      this.handleQuarterViewSelect()
      this.getQuarterData()
      this.setEmissionsVolumePrefix(SI.MEGA)
    } else {
      if (history && history === 'true') this.addHistory = true
      if (projections && projections === 'true') this.addProjections = true
      this.handleYearViewSelect()
      this.getYearData()
    }
    this.updateAxisGuides()
  },

  methods: {
    ...mapActions({
      setStepCurve: 'chartOptionsEmissionsVolume/setStepCurve'
    }),
    ...mapMutations({
      setFocusDate: 'visInteract/focusDate',
      setXTicks: 'visInteract/xTicks',
      setXGuides: 'visInteract/xGuides',
      setTickFormat: 'visInteract/tickFormat',
      setHighlightDomain: 'visInteract/highlightDomain',
      setCompareDifference: 'compareDifference',

      setSourceLabel: 'emissionsPage/footerSourceLabel',
      setSourceUrl: 'emissionsPage/footerSourceUrl',

      setEmissionsVolumePrefix: 'chartOptionsEmissionsVolume/chartUnitPrefix'
    }),

    async getQuarterData() {
      console.log('get Quarter data')

      if (!this.fetching) {
        const jsonUrl =
          'https://opennem-edge-data.netlify.app/data/au/emissions/quarter.json'

        this.fetching = true

        const response = await fetch(jsonUrl)

        if (response.ok) {
          const json = await response.json()
          const jData = json.data || json
          console.log('quarter ok', json)

          this.updateFooterSource(json.source)

          const data = jData.map((d) => {
            let total = 0
            const obj = {}
            const date = subMonths(parse(d.Quarter, 'MMM-yyyy', new Date()), 2)

            obj.date = date
            obj.time = obj.date.getTime()
            obj.quarter = d.Quarter

            this.domainEmissions.forEach((domain) => {
              const val = parseFloat(d[domain.csvLabel])
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
            this.domainEmissions
          )

          const rolledUpData = dataRollUp({
            dataset: this.rollingDataset,
            domains: this.domainEmissions,
            interval: this.interval
          })

          rolledUpData.forEach((d) => {
            let total = 0
            this.domainEmissions.forEach((domain) => {
              total += d[domain.id] || 0
            })
            d._total = total
          })

          this.dataset = rolledUpData.filter((d) =>
            isAfter(d.date, this.afterDate)
          )

          this.fetching = false
        } else {
          alert('HTTP-Error: ' + response.status)
        }
      }
    },

    async getYearData() {
      console.log('get year data')
      if (!this.fetching) {
        const jsonUrl =
          'https://opennem-edge-data.netlify.app/data/au/emissions/year.json'

        this.fetching = true

        const response = await fetch(jsonUrl)

        if (response.ok) {
          const json = await response.json()
          const jData = json.data || json
          console.log('year ok', json)

          this.updateFooterSource(json.source)

          const data = []

          jData.forEach((d) => {
            const domain = domainEmissionsObj[d['Sector']]
            const years = Object.keys(d).filter((k) => k !== 'Sector')
            if (data.length === 0) {
              years.forEach((y) => {
                const obj = {
                  year: parseInt(y, 10)
                }
                obj[domain.id] = parseFloat(d[y])
                data.push(obj)
              })
            } else {
              years.forEach((y) => {
                const find = data.find((d) => d.year === parseInt(y, 10))
                find[domain.id] = parseFloat(d[y])
              })
            }
          })

          data.forEach((d) => {
            let total = 0
            const date = parse(d.year, 'yyyy', new Date())
            d.date = date
            d.time = date.getTime()

            this.domainEmissions.forEach((domain) => {
              const val = parseFloat(d[domain.id])
              total += val
            })

            d._total = total
          })

          this.range = RANGE_ALL
          this.interval = INTERVAL_YEAR
          this.yearlyDataset = data.filter(
            (d) => d.year >= 2005 && d.year <= 2020
          )
          this.historyDataset = data.filter((d) => d.year <= 2004)
          this.projectionDataset = data.filter((d) => d.year >= 2021)

          if (this.addHistory) {
            this.dataset = [...this.historyDataset, ...this.yearlyDataset]
          } else {
            this.dataset = this.yearlyDataset
          }

          this.updateAxisGuides()

          this.fetching = false
        } else {
          alert('HTTP-Error: ' + response.status)
        }
      }
    },

    updateFooterSource(source) {
      this.setSourceLabel(source.label)
      this.setSourceUrl(source.url)
    },

    updateAxisGuides() {
      let years = 1
      if (this.widthBreak) {
        years = 4
      } else if (this.widthBreak) {
        years = 2
      } else if (this.wideScreenBreak) {
        if (this.addHistory || this.addProjections) {
          years = 2
        } else {
          years = 1
        }
      }

      const y = timeYear.every(years)
      const formatYear = timeFormat('%Y')
      const format = (date) => formatYear(date)
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
    },

    handleTypeShiftClick(id) {
      const toBeHidden = this.domainEmissions.filter((d) => d.id !== id)
      this.hidden = toBeHidden.map((d) => d.id)
    },

    handleTotalClick() {
      this.showTotalLine = !this.showTotalLine
    },
    handleTotalShiftClick() { },

    getDataByTime(dataset, time) {
      return dataset.find((d) => d.time === time)
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
            const newCompareDates = compareDates.filter((d) => d !== hoverTime)
            if (newCompareDates.length === 1) {
              compareDates = newCompareDates
              newCompare = true
            } else {
              compareDates.pop()
            }
          }
          if (compareDates.length < 2 && !newCompare) {
            const newCompareDates = compareDates.filter((d) => d !== hoverTime)
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
      this.datasetView = INTERVAL_QUARTER
      this.addProjections = false
      this.addHistory = false
      this.updateQueries()
    },

    handleYearViewSelect() {
      this.datasetView = INTERVAL_YEAR
      this.updateQueries()
    },

    handleProjectionsToggle() {
      this.addProjections = !this.addProjections
      this.updateAxisGuides()
      this.updateQueries()
    },

    handleHistoryToggle() {
      const add = !this.addHistory
      this.addHistory = add
      if (add) {
        this.dataset = [...this.historyDataset, ...this.yearlyDataset]
      } else {
        this.dataset = this.yearlyDataset
      }
      this.updateAxisGuides()
      this.updateQueries()
    },

    handleChangeDatasetChange(dataset) {
      // console.log(dataset[dataset.length - 1]._totalChange)
    },

    handleMouseEnter(id) {
      this.setHighlightDomain(id)
    },
    handleMouseLeave() {
      this.setHighlightDomain('')
    },

    updateQueries() {
      this.$router.push({
        query: {
          interval: this.datasetView,
          projections: this.addProjections,
          history: this.addHistory
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.wrapper {
  padding-right: 0;
  margin-bottom: 4.5rem;

  @include desktop {
    padding-right: 10px;
    margin-bottom: 3rem;
  }
}

header {
  color: #000;
  display: flex;
  align-items: center;
  padding: $app-padding / 2;
  background-color: $background-alpha;
  margin: 1rem 0.5rem;

  @include desktop {
    margin: 2rem 0 0;
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
  position: relative;
  margin: 10px 0;
  right: 0;
  text-align: center;
  color: #333;

  h2 {
    font-weight: 100;
    font-size: 1.4rem;
  }

  @include desktop {
    position: absolute;
    right: 2rem;
    margin-top: -3.3rem;
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
    top: 2em;
    font-size: 1.3em;
  }
}

.chart-table {
  display: block;
  padding-right: 0.5rem;

  .chart-wrapper {
    width: 100%;
  }

  .legend-bar {
    width: 430px;
    background-color: transparent;
    margin: 18px auto;
  }

  @include desktop {
    display: flex;
    align-items: stretch;
    gap: 1rem;

    .chart-wrapper {
      width: calc(100% - 400px);
    }

    .legend-bar {
      width: 400px;
    }
  }
}

.dataset-selection {
  background-color: rgba(255, 255, 255, 0.5);
  display: block;
  text-align: center;
  margin-bottom: 0.5rem;

  .buttons {
    margin: 0;
    justify-content: center;
    border-radius: 0;

    .button {
      margin-right: 0;
    }
  }

  .button {
    font-size: 0.8em;
    border-radius: 0;
  }

  strong {
    margin-left: 10px;
  }

  @include desktop {
    display: flex;
    align-items: center;
    background-color: transparent;
    text-align: left;

    .buttons {
      margin: 1rem;
      justify-content: flex-start;
      border-radius: 10px;

      &:not(.has-addons) .button:first-child {
        margin-right: 0.5rem;
      }
    }

    .button {
      font-size: 1em;
      border-radius: 10px;
    }
  }
}

.bar-chart {
  width: 100%;
  padding: 5px;

  @include desktop {
    width: 450px;
    margin: 0 auto;
  }
}
</style>
