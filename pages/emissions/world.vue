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
          :vis-height="600"
          :show-average-value="false"
          :hover-on="isHovering"
          :hover-date="hoverDate"
          :zoom-extent="zoomExtent"
          :filter-period="filterPeriod"
          :hidden-domains="hidden"
          @dateHover="handleDateHover"
          @isHovering="handleIsHovering"
          @zoomExtent="handleZoomExtent"
        />
      </div>

      <CountryLegend
        :domains="domains"
        :hidden="hidden"
        class="legend"
        @rowClick="handleTypeClick"
        @rowShiftClick="handleTypeShiftClick"
      />
    </div>
    
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import Papa from 'papaparse'
import _uniq from 'lodash.uniq'
import _includes from 'lodash.includes'
import { timeYear } from 'd3-time'
import { timeFormat } from 'd3-time-format'
import { RANGE_ALL } from '@/constants/ranges.js'
import { INTERVAL_YEAR, FILTER_NONE } from '@/constants/interval-filters.js'
import DateDisplay from '@/services/DateDisplay.js'
import EmissionsChart from '@/components/Charts/EmissionsChart'
import CountryLegend from '@/components/Emissions/CountryLegend'

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

export default {
  layout: 'main',

  // TODO: head

  components: {
    EmissionsChart,
    CountryLegend
  },

  data() {
    return {
      ready: false,
      showAreas: ['AUS', 'GBR', 'EU27BX', 'USA', 'CHN', 'IND'],
      dataset: [],
      domains: [],
      hidden: [],
      displayDomains: [],
      range: RANGE_ALL,
      interval: INTERVAL_YEAR,
      filterPeriod: FILTER_NONE,
      zoomExtent: [],
      isHovering: false,
      hoverDate: null
    }
  },

  computed: {
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
      }
    }
  },

  created() {
    this.years = []
    this.categories = []
    this.areaCodes = []
    this.emissionsData = []
    this.$store.dispatch('currentView', 'emissions-world')

    this.updateAxisGuides()
  },

  mounted() {
    this.getData()
  },

  methods: {
    ...mapMutations({
      setXTicks: 'visInteract/xTicks',
      setXGuides: 'visInteract/xGuides',
      setTickFormat: 'visInteract/tickFormat'
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

      if (this.hidden.length === this.domains.length) {
        this.hidden = []
      }

      console.log(this.hidden)
    },

    handleTypeShiftClick(id) {
      const toBeHidden = this.domains.filter(d => d.id !== id)
      this.hidden = toBeHidden.map(d => d.id)
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

.chart-table {
  display: block;
  padding-right: 0.5rem;

  .chart-wrapper {
    width: 100%;
  }
  .legend {
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
    .legend {
      width: 400px;
    }
  }
}
</style>
