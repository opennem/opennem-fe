<template>
  <div class="wrapper">

    <!-- <header>
      <div class="chart-label">
        <strong>{{ firstDate | customFormatDate({ range, interval, showIntervalRange: true }) }}</strong>
        —
        <strong>{{ secondDate | customFormatDate({ range, interval, showIntervalRange: true }) }}</strong>
      </div>
    </header> -->

    <div class="chart-table">
      <div class="chart-wrapper">
        <EmissionsChart
          v-if="ready"
          :emissions-dataset="dataset"
          :domain-emissions="filteredDisplayDomains"
          :range="range"
          :interval="interval"
          :show-x-axis="true"
          :vis-height="300"
          :show-average-value="false"
          :hover-on="isHovering"
          :hover-date="hoverDate"
          :zoom-extent="zoomExtent"
          :filter-period="filterPeriod"
          :hidden-domains="hidden"
          :compare-dates="compareDates"
          :emissions-options="emissionsOptions"
          @dateHover="handleDateHover"
          @isHovering="handleIsHovering"
          @zoomExtent="handleZoomExtent"
        />

        <div 
          v-if="compareDifference" 
          class="compare-chart">          
          <CompareChart
            :compare-data="compareData"
            :domains="filteredDisplayDomains"
            :range="range"
            :interval="interval"
            :unit="chartCurrentUnit"
            :use-percentage="true"
            :vis-height="350"
          />
        </div>
      </div>

      <CountryLegend
        :area-codes="areaCodes"
        :domains="domains"
        :hidden="hidden"
        class="legend"
        @rowClick="handleTypeClick"
        @rowShiftClick="handleTypeShiftClick"
        @codeAdd="handleCodeAdd"
        @codeRemove="handleCodeRemove"
      />
    </div>

    <!-- <CountrySelector /> -->
    
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import Papa from 'papaparse'
import _uniq from 'lodash.uniq'
import _includes from 'lodash.includes'
import { timeYear } from 'd3-time'
import { timeFormat } from 'd3-time-format'
import subYears from 'date-fns/subYears'
import { RANGE_ALL } from '@/constants/ranges.js'
import * as OPTIONS from '@/constants/chart-options.js'
import { INTERVAL_YEAR, FILTER_NONE } from '@/constants/interval-filters.js'
import DateDisplay from '@/services/DateDisplay.js'
import EmissionsChart from '@/components/Charts/EmissionsChart'
import CountryLegend from '@/components/Emissions/CountryLegend'
import CompareChart from '@/components/Nggi/CompareChart'

const extraAreaCodes = [
  {
    code: 'EARTH',
    area: 'Aggregated emissions for all countries'
  },
  {
    code: 'ANNEXI',
    area: 'Annex I Parties to the Convention'
  },
  {
    code: 'NONANNEXI',
    area: 'Non-Annex I Parties to the Convention'
  },
  {
    code: 'AOSIS',
    area: 'Alliance of Small Island States'
  },
  {
    code: 'BASIC',
    area: 'BASIC countries (Brazil, South Africa, India and China)'
  },
  {
    code: 'EU27BX',
    area: 'European Union post Brexit'
  },
  {
    code: 'LDC',
    area: 'Least Developed Countries'
  },
  {
    code: 'UMBRELLA',
    area: 'Umbrella Group'
  }
]

// const colours = [
//   '#4e79a7',
//   '#f28e2c',
//   '#e15759',
//   '#76b7b2',
//   '#59a14f',
//   '#edc949',
//   '#af7aa1',
//   '#ff9da7',
//   '#9c755f',
//   '#bab0ab'
// ]
const colours = [
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6',
  '#6a3d9a',
  '#ffff99',
  '#b15928'
]

const emissionsOptions = {
  type: [
    OPTIONS.CHART_HIDDEN,
    OPTIONS.CHART_LINE,
    OPTIONS.CHART_CHANGE_SINCE_LINE
  ],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: []
}

export default {
  layout: 'main',

  // TODO: head

  components: {
    EmissionsChart,
    CountryLegend,
    CompareChart
  },

  data() {
    return {
      ready: false,
      showAreas: ['AUS', 'GBR', 'USA', 'JPN', 'NZL', 'CAN'],
      dataset: [],
      domains: [],
      hidden: [],
      displayDomains: [],
      range: RANGE_ALL,
      interval: INTERVAL_YEAR,
      filterPeriod: FILTER_NONE,
      zoomExtent: [],
      isHovering: false,
      hoverDate: null,
      compareData: [],
      emissionsOptions,
      firstDate: null,
      secondDate: null
    }
  },

  computed: {
    ...mapGetters({
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      chartCurrentUnit: 'chartOptionsEmissionsVolume/chartCurrentUnit'
    }),

    compareDates: {
      get() {
        return this.$store.getters.compareDates
      },
      set(val) {
        this.$store.dispatch('compareDates', val)
      }
    },

    compareDifference: {
      get() {
        return this.$store.getters.compareDifference
      },
      set(val) {
        this.$store.dispatch('compareDifference', val)
      }
    },

    filteredDomains() {
      return this.domains.filter(d => !_includes(this.hidden, d.id))
    },
    filteredDisplayDomains() {
      return this.displayDomains.filter(d => !_includes(this.hidden, d.id))
    }
  },

  watch: {
    ready(val) {
      if (val) {
        this.generateDatasetWithCategory(['M.0.EL'])
        setTimeout(() => {
          this.handleZoomExtent([])
        }, 10)
      }
    },

    showAreas() {
      this.compareDifference = false
      this.generateDatasetWithCategory(['M.0.EL'])
      setTimeout(() => {
        this.handleZoomExtent(this.zoomExtent)
      }, 10)
    },

    compareDifference(compare) {
      if (!compare) {
        this.compareData = []
        this.compareDates = []
      }
    },

    zoomExtent(val) {
      if (val.length === 2) {
        this.firstDate = val[0]
        this.secondDate = subYears(val[1], 1)
      } else {
        this.firstDate = this.dataset[0].date
        this.secondDate = this.dataset[this.dataset.length - 1].date
      }
    }
  },

  created() {
    this.years = []
    this.categories = []
    this.areaCodes = []
    this.emissionsData = []
    this.$store.dispatch('currentView', 'emissions-world')
    this.setChartYAxis(OPTIONS.CHART_YAXIS_PERCENTAGE)
    this.setChartType(OPTIONS.CHART_CHANGE_SINCE_LINE)

    this.updateAxisGuides()
  },

  mounted() {
    this.getData()
  },

  methods: {
    ...mapMutations({
      setXTicks: 'visInteract/xTicks',
      setXGuides: 'visInteract/xGuides',
      setTickFormat: 'visInteract/tickFormat',
      setVisSecondTickFormat: 'visInteract/secondTickFormat',
      setFocusDate: 'visInteract/focusDate',
      setChartType: 'chartOptionsEmissionsVolume/chartType',
      setChartYAxis: 'chartOptionsEmissionsVolume/chartYAxis'
    }),

    getFilteredDataObj(categories) {
      const data = this.emissionsData.filter(
        d =>
          _includes(this.showAreas, d.area) && _includes(categories, d.category)
      )

      const emissionsDataObj = {}

      data.forEach(d => {
        emissionsDataObj[d.area] = d
      })

      return emissionsDataObj
    },

    generateDatasetWithCategory(categories) {
      const dataset = []
      const filteredDataObj = this.getFilteredDataObj(categories)
      const getAreaLabel = code => {
        const find = this.areaCodes.find(a => a.code === code)
        return find ? find.area : ''
      }

      this.years.forEach(y => {
        const date = new Date(parseInt(y, 10), 0, 1)
        const time = date.getTime()
        const obj = {
          date,
          time
        }

        this.showAreas.forEach(a => {
          obj[a] = parseInt(filteredDataObj[a][y], 10)
        })

        dataset.push(obj)
      })

      this.dataset = dataset
      this.domains = this.showAreas.map((a, i) => {
        return {
          id: a,
          domain: a,
          label: getAreaLabel(a),
          colour: colours[i]
        }
      })
      this.displayDomains = [...this.domains].reverse()
      this.firstDate = this.dataset[0].date
      this.secondDate = this.dataset[this.dataset.length - 1].date
    },

    updateAreaCodes({ emissions, areaDict, codeDict }) {
      const emissionsAreas = _uniq(emissions.map(d => d.area)).sort()
      const areaCodes = {}

      emissionsAreas.forEach(a => {
        areaCodes[a] = codeDict[a]
      })

      const areaCodeValues = Object.values(areaCodes)
        .filter(c => c)
        .sort()

      this.areaCodes = areaCodeValues.map(c => {
        return {
          code: areaDict[c],
          area: c
        }
      })
    },

    getData() {
      this.ready = false

      this.getCategories().then(categories => {
        this.categories = categories

        this.getAreaCodes().then(({ areaDict, codeDict }) => {
          this.getEmissions().then(emissions => {
            this.emissionsData = emissions
            this.updateAreaCodes({ emissions, areaDict, codeDict })

            // console.log(this.emissionsData, this.areaCodes)
            this.ready = true
          })
        })
      })
    },

    getCategories() {
      // const url = '/data/categories.csv'
      const url =
        'https://data.dev.opennem.org.au/temp-emissions-data/world/categories.csv'

      return this.$axios
        .get(url, { headers: { 'Content-Type': 'text/csv' } })
        .then(res => {
          const csvData = Papa.parse(res.data, { header: true })
          return csvData.data
        })
    },

    getAreaCodes() {
      // const url = '/data/country-codes.csv'
      const url =
        'https://data.dev.opennem.org.au/temp-emissions-data/world/country-codes.csv'

      return this.$axios
        .get(url, { headers: { 'Content-Type': 'text/csv' } })
        .then(res => {
          const csvData = Papa.parse(res.data, { header: true })
          const codeDict = {}
          const areaDict = {}

          csvData.data.forEach(d => {
            codeDict[d.Code.trim()] = d.Country.trim()
            areaDict[d.Country.trim()] = d.Code.trim()
          })

          extraAreaCodes.forEach(a => {
            codeDict[a.code] = a.area
            areaDict[a.area] = a.code
          })

          return {
            codeDict,
            areaDict
          }
        })
    },

    getEmissions() {
      // const url = '/data/country-emissions.csv'
      const url =
        'https://data.dev.opennem.org.au/temp-emissions-data/world/country-emissions.csv'

      const keyArea = 'area (ISO3)'
      const keyCategory = 'category (IPCC2006_PRIMAP)'

      return this.$axios
        .get(url, { headers: { 'Content-Type': 'text/csv' } })
        .then(res => {
          const csvData = Papa.parse(res.data, { header: true })

          let years = []

          Object.keys(csvData.data[0]).forEach(d => {
            if (d !== keyArea && d !== keyCategory) {
              years.push(d)
            }
          })

          this.years = years.sort()

          return csvData.data.map(d => {
            const data = { ...d }

            this.years.forEach(y => {
              // convert to mega
              data[y] = d[y] / 1000
            })

            return {
              ...data,
              area: d[keyArea],
              category: d[keyCategory]
            }
          })
        })
    },

    updateAxisGuides() {
      const y = timeYear.every(1)
      const formatYear = timeFormat('%Y')
      const format = date => formatYear(date)
      this.setXTicks(y)
      this.setXGuides([])
      this.setTickFormat(format)
      this.setVisSecondTickFormat('secondaryFormat')
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

      if (dateRange && dateRange.length === 2) {
        const startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        const endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )
        filteredDates = [startTime, endTime]
      } else {
        filteredDates = []
      }

      this.zoomExtent = filteredDates

      // COMPARE
      this.setCompareData(filteredDates)
    },

    setCompareData(filteredDates) {
      const firstPoint = this.dataset[0]
      const lastPoint = this.dataset[this.dataset.length - 1]

      this.compareDifference = true
      const getDataByTime = date =>
        this.dataset.find(d => d.time === date.getTime())

      setTimeout(() => {
        let secondComparePoint = null

        if (filteredDates.length === 2) {
          secondComparePoint = subYears(filteredDates[1], 1)
          this.compareDates = [filteredDates[0], secondComparePoint]
        } else {
          this.compareDates = [firstPoint.date, lastPoint.date]
          secondComparePoint = lastPoint.date
        }

        this.compareData = [
          getDataByTime(this.compareDates[0]),
          getDataByTime(secondComparePoint)
        ]

        console.log(this.compareData)
      }, 10)
    },

    handleTypeClick(id) {
      const index = this.hidden.indexOf(id)

      if (index === -1) {
        this.hidden.push(id)
      } else {
        this.hidden.splice(index, 1)
      }

      if (this.hidden.length === this.domains.length) {
        this.hidden = []
      }

      console.log(this.hidden)
    },

    handleTypeShiftClick(id) {
      const toBeHidden = this.domains.filter(d => d.id !== id)
      this.hidden = toBeHidden.map(d => d.id)
    },

    handleCodeAdd(code) {
      this.showAreas.push(code)
    },
    handleCodeRemove(code) {
      if (this.showAreas.length !== 1) {
        this.showAreas = this.showAreas.filter(a => a !== code)
      }
    }

    // handleSvgClick(metaKey) {
    //   const dataset = this.dataset
    //   const getDataByTime = time => dataset.find(d => d.time === time)

    //   if (metaKey && this.focusOn && !this.compareDifference) {
    //     this.compareDifference = true

    //     const hoverTime = this.hoverDate ? this.hoverDate.getTime() : 0
    //     const focusTime = this.focusDate ? this.focusDate.getTime() : 0
    //     const firstData = getDataByTime(focusTime)
    //     const secondData = getDataByTime(hoverTime)

    //     setTimeout(() => {
    //       this.compareDates = [focusTime, hoverTime]
    //       this.compareData = [firstData, secondData].slice()
    //       this.setFocusDate(null)
    //     }, 10)
    //   } else {
    //     if (this.compareDifference) {
    //       const hoverTime = this.hoverDate ? this.hoverDate.getTime() : 0
    //       let newCompare = false
    //       let compareDates = this.compareDates.slice()
    //       if (compareDates.length === 2) {
    //         const newCompareDates = compareDates.filter(d => d !== hoverTime)
    //         if (newCompareDates.length === 1) {
    //           compareDates = newCompareDates
    //           newCompare = true
    //         } else {
    //           compareDates.pop()
    //         }
    //       }
    //       if (compareDates.length < 2 && !newCompare) {
    //         const newCompareDates = compareDates.filter(d => d !== hoverTime)
    //         if (newCompareDates.length === 0) {
    //           compareDates = newCompareDates
    //         } else {
    //           compareDates.push(hoverTime)
    //         }
    //       }
    //       if (compareDates.length === 2) {
    //         const firstData = getDataByTime(compareDates[0])
    //         const secondData = getDataByTime(compareDates[1])
    //         console.log(firstData, secondData)
    //         this.compareData = [firstData, secondData]
    //       }
    //       if (compareDates.length === 0) {
    //         this.compareDifference = false
    //       }
    //       this.$store.dispatch('compareDates', compareDates)
    //     } else if (!this.isTouchDevice) {
    //       const hoverTime = this.hoverDate ? this.hoverDate.getTime() : 0
    //       const focusTime = this.focusDate ? this.focusDate.getTime() : 0
    //       if (this.focusDate && focusTime === hoverTime) {
    //         this.setFocusDate(null)
    //       } else {
    //         this.setFocusDate(this.hoverDate)
    //       }
    //     }
    //   }
    // }
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

// header {
//   text-align: center;
//   h2 {
//     font-family: $header-font-family;
//     font-size: 2rem;
//     font-weight: bold;
//     margin-top: 0.5rem;
//     color: black;
//   }
// }

.chart-table {
  display: block;
  padding-right: 0.8rem;

  .chart-wrapper {
    width: 100%;
  }
  .legend {
    width: 80%;
    background-color: transparent;
    margin: 18px auto;
  }

  @include tablet {
    display: flex;
    align-items: stretch;
    gap: 0.2rem;

    .chart-wrapper {
      width: calc(100% - 200px);
    }
    .legend {
      width: 200px;
    }
  }
}

.compare-chart {
  position: relative;
  margin-left: 1rem;

  // .close-button {
  //   position: absolute;
  //   right: 1rem;
  //   top: 1.3em;
  //   font-size: 1.3em;
  // }
}
</style>
