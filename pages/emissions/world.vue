<template>
  <div class="wrapper">

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
import addYears from 'date-fns/addYears'
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
    code: 'EU27',
    alpha2code: 'EU',
    area: 'European Union post Brexit'
  },
  {
    code: 'LDC',
    area: 'Least Developed Countries'
  },
  {
    code: 'UMBRELLA',
    area: 'Umbrella Group'
  },
  {
    code: 'OECD',
    area: 'OECD Average'
  }
]

const colours = [
  '#4e79a7',
  '#f28e2c',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc949',
  '#af7aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ab'
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

  head() {
    return {
      title: `: Emissions by country`,
      meta: [
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: `OpenNEM: Emissions by country`
        },
        {
          hid: 'twitter:image:src',
          name: 'twitter:image:src',
          content: this.cardFilename
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: `OpenNEM: Emissions by country`
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
      ],
      script: [
        {
          src: 'https://platform.twitter.com/widgets.js',
          charset: 'utf-8'
        }
      ]
    }
  },

  components: {
    EmissionsChart,
    CountryLegend,
    CompareChart
  },

  data() {
    return {
      ready: false,
      baseUrl: `${this.$config.url}/images/screens/`,
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
      chartCurrentUnit: 'chartOptionsEmissionsVolume/chartCurrentUnit',

      tabletBreak: 'app/tabletBreak',
      widthBreak: 'app/widthBreak',
      wideScreenBreak: 'app/wideScreenBreak'
    }),

    cardFilename() {
      return `${this.baseUrl}opennem-emissions-world.png`
    },

    queryAreas() {
      return this.$route.query.areas
    },

    queryRange() {
      return this.$route.query.range
    },

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
          this.handleZoomExtent(this.zoomExtent)
        }, 10)
      }
    },

    showAreas() {
      if (this.ready) {
        this.compareDifference = false
        this.generateDatasetWithCategory(['M.0.EL'])
        setTimeout(() => {
          this.handleZoomExtent(this.zoomExtent)
        }, 10)
      }
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
      this.updateAxisGuides()
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
    if (this.queryAreas) {
      this.showAreas = this.queryAreas.split(',')
    }
    if (this.queryRange) {
      const range = this.queryRange.split(',')

      try {
        this.checkQueryRangeIsCorrect(range)
        range.forEach(e => this.checkYearIsWithinRange(e))
        this.zoomExtent = [
          new Date(range[0], 0, 1),
          addYears(new Date(range[1], 0, 1), 1)
        ]
      } catch (e) {
        console.log('Invalid values for range query: ' + e.message)
      }
    }

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

    checkYearIsWithinRange(year) {
      const yearInt = parseInt(year, 10)
      if (yearInt >= 1990 && yearInt <= 2019) {
        return true
      } else {
        throw new RangeError('The year must be between 1990 and 2019.')
      }
    },

    checkQueryRangeIsCorrect(range) {
      if (range.length !== 2) {
        throw new RangeError('Range query must contain two year values.')
      }

      const firstValue = parseInt(range[0], 10)
      const secondValue = parseInt(range[1], 10)
      if (firstValue >= secondValue) {
        throw new Error('First year value must be before second year value.')
      }
    },

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
      const getArea = code => {
        const find = this.areaCodes.find(a => a.code === code)
        return find ? find : ''
      }

      this.years.forEach(y => {
        const date = new Date(parseInt(y, 10), 0, 1)
        const time = date.getTime()
        const obj = {
          date,
          time
        }

        this.showAreas.forEach(a => {
          obj[a] = filteredDataObj[a][y]
        })

        dataset.push(obj)
      })

      this.dataset = dataset
      this.domains = this.showAreas.map((a, i) => {
        const area = getArea(a)
        return {
          id: a,
          domain: a,
          label: area.area,
          colour: colours[i],
          flag: area.flag
        }
      })
      this.displayDomains = [...this.domains].reverse()
      this.firstDate = this.dataset[0].date
      this.secondDate = this.dataset[this.dataset.length - 1].date
    },

    updateAreaCodesAndCheckShowAreaCodes({
      emissions,
      areaDict,
      codeDict,
      alpha2AreaDict
    }) {
      const emissionsAreas = _uniq(emissions.map(d => d.area)).sort()
      const areaCodes = {}
      const getFlagEmoji = countryCode => {
        if (countryCode) {
          const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt())
          return String.fromCodePoint(...codePoints)
        }
        return ''
      }

      emissionsAreas.forEach(a => {
        areaCodes[a] = codeDict[a]
      })

      const areaCodeValues = Object.values(areaCodes)
        .filter(c => c)
        .sort()

      // check show areas
      const showAreas = []
      this.showAreas.forEach(a => {
        if (areaCodes[a]) {
          showAreas.push(a)
        }
      })
      this.showAreas = showAreas

      // update area codes
      this.areaCodes = areaCodeValues.map(c => {
        const flag = getFlagEmoji(alpha2AreaDict[c])
        return {
          code: areaDict[c],
          alpha2code: alpha2AreaDict[c],
          area: `${flag} ${c}`,
          flag
        }
      })
    },

    getData() {
      this.ready = false

      this.getCategories().then(categories => {
        this.categories = categories

        this.getAreaCodes().then(({ areaDict, codeDict, alpha2AreaDict }) => {
          this.getEmissions().then(emissions => {
            this.emissionsData = emissions
            this.updateAreaCodesAndCheckShowAreaCodes({
              emissions,
              areaDict,
              codeDict,
              alpha2AreaDict
            })

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
        'https://data.dev.opennem.org.au/temp-emissions-data/world/country-codes-all.csv'

      return this.$axios
        .get(url, { headers: { 'Content-Type': 'text/csv' } })
        .then(res => {
          const csvData = Papa.parse(res.data, { header: true })
          const codeDict = {}
          const alpha2AreaDict = {}
          const areaDict = {}

          csvData.data.forEach(d => {
            codeDict[d['alpha-3-code'].trim()] = d.country.trim()
            areaDict[d.country.trim()] = d['alpha-3-code'].trim()
            alpha2AreaDict[d.country.trim()] = d['alpha-2-code'].trim()
          })

          extraAreaCodes.forEach(a => {
            codeDict[a.code] = a.area
            areaDict[a.area] = a.code
            alpha2AreaDict[a.area] = a.alpha2code
          })

          return {
            codeDict,
            areaDict,
            alpha2AreaDict
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
      let years = 1
      if (this.zoomExtent.length === 2) {
        years = 1
      } else if (this.widthBreak) {
        years = 4
      } else if (this.widthBreak) {
        years = 2
      } else if (this.wideScreenBreak) {
        years = 1
      }

      const y = timeYear.every(years)
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

      this.setCompareData(filteredDates)
      this.updateQueries()
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
    },

    handleTypeShiftClick(id) {
      const toBeHidden = this.domains.filter(d => d.id !== id)
      this.hidden = toBeHidden.map(d => d.id)
    },

    handleCodeAdd(code) {
      this.showAreas.push(code)
      this.updateQueries()
    },

    handleCodeRemove(code) {
      if (this.showAreas.length !== 1) {
        this.showAreas = this.showAreas.filter(a => a !== code)
        this.updateQueries()
      }
    },

    updateQueries() {
      const getYear = date => {
        return date.getFullYear()
      }

      const getRangeQuery = () => {
        const firstYear = getYear(this.zoomExtent[0])
        const secondYear = getYear(subYears(this.zoomExtent[1], 1))
        return `${firstYear},${secondYear}`
      }

      this.$router.push({
        query: {
          areas: this.showAreas.join(','),
          range: this.zoomExtent.length === 2 ? getRangeQuery() : undefined
        }
      })
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
    margin: 1.5rem auto;
  }

  @include tablet {
    display: flex;
    align-items: stretch;
    gap: 0.2rem;

    .chart-wrapper {
      width: calc(100% - 300px);
    }
    .legend {
      width: 300px;
    }
  }
}

::v-deep .compare-chart-legend {
  background-color: transparent !important;
  padding: 0 0 0 10px !important;
}

.compare-chart {
  position: relative;
  margin-top: 10px;
  // margin-left: 1rem;

  // .close-button {
  //   position: absolute;
  //   right: 1rem;
  //   top: 1.3em;
  //   font-size: 1.3em;
  // }
}
</style>
