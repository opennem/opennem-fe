<template>
  <div class="">    
    <div class="vis-container">
      <div 
        class="vis-options" 
        style="margin-top: 1rem">
        <div 
          class="metric-selection select is-rounded">
          <select v-model="selectedMetric">
            <option 
              v-if="featureEmissions" 
              value="carbonIntensity">
              Carbon intensity
            </option>
            
            <optgroup label="Proportion of demand">
              <option value="netInterconnectorFlow">
                Net imports proportion
              </option>
              <option value="renewablesProportion">
                Renewables proportion
              </option>
              <option value="solarProportion">
                Solar proportion
              </option>
              <option value="windProportion">Wind proportion</option>
              <option value="gasProportion">Gas proportion</option>
              <option value="coalProportion">Coal proportion</option>
            </optgroup>

            <optgroup label="Average spot market value">
              <option value="solarValue">Solar value</option>
              <option value="windValue">Wind value</option>
              <option value="hydroValue">Hydro value</option>
              <option value="gasValue">Gas value</option>
              <option value="coalValue">Coal value</option>
              <option value="price">Volume-weighted price</option>
              <option value="inflatedPrice">
                Volume-weighted price (inflation adjusted)
              </option>
            </optgroup>

            <optgroup label="Temperature">
              <option value="temperature">Average temperature</option>
              <option value="minTemperature">Min temperature</option>
              <option value="maxTemperature">Max temperature</option>
            </optgroup>
          </select>
        </div>

        <DataOptionsBar
          class="options-bar"
          :ranges="ranges"
          :intervals="intervals"
          :range="range"
          :interval="interval"
          :filter-period="filterPeriod"
          :use12-mth-rolling-toggle="true"
          @rangeIntervalChange="handleRangeIntervalChange"
        />
      </div>
      <div 
        v-if="!fetching && lineChartDataset.length > 0"
        class="chart-table-container">
        <OpenChart
          class="open-chart"
          :chart-title="chartTitle"
          :chart-dataset="lineChartDataset"
          :chart-domains="domains"
          :range="range"
          :interval="interval"
          :show-x-axis="true"
          :vis-height="500"
          :hover-on="isHovering"
          :hover-date="hoverDate"
          :zoom-extent="zoomExtent"
          :filter-period="filterPeriod"
          :hidden-domains="hiddenDomains"
          :show-average-value="false"
          :value-formatter="valueFormatter"
          :pad-y-axis="false"
          :unit="chartUnit"
          :annotations="annotations"
          @dateHover="handleDateHover"
          @isHovering="handleIsHovering"
          @zoomExtent="handleZoomExtent"
        />

        <aside class="compare-table">
          <dates-display
            :is-hovering="isHovering"
            :hovered-date="hoverDate?.getTime()"
            :start-date="startEndDates.start.getTime()"
            :end-date="startEndDates.end.getTime()"
            :range="range"
            :interval="interval"
          />

          <CompareTable 
            style="width: 100%"
            :domains="domains" 
            :hidden="hiddenDomains"
            :dataset="tableDataset"
            @highlight-domain="handleHighlightDomain"
            @domain-hide="handleDomainHide"
            @domains-hide="handleDomainsHide"/>
        </aside>
        
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import debounce from 'lodash.debounce'
import cloneDeep from 'lodash.clonedeep'
import isSameDay from 'date-fns/isSameDay'
import { format as numFormat } from 'd3-format'

import { getEnergyRegionLabel, getAuRegions } from '@/constants/energy-regions.js'
import { periods, metrics } from '@/constants/stripes/'
import { RANGE_ALL, RANGE_ALL_12MTH_ROLLING, COMPARE_RANGES, COMPARE_RANGE_INTERVALS } from '@/constants/ranges.js'
import { getRangeByRangeQuery } from '@/constants/range-queries'
import { getIntervalByIntervalQuery } from '@/constants/interval-queries.js'
import { getFilterByFilterQuery } from '@/constants/filter-queries.js'
import { INTERVAL_MONTH, FILTER_NONE } from '@/constants/interval-filters.js'
import DateDisplay from '@/services/DateDisplay.js'
import { dataFilterByPeriod } from '@/data/parse/region-energy'

import {
  allBucket,
  getRegionCompareData,
  getStripesDateRange,
  getStripesStartEndDates,
} from '@/data/pages/page-stripes.js'

import Heatmap from '@/components/Vis/Heatmap'
import ColourLegend from '@/components/Vis/ColourLegend'
import OptionsLegend from '@/components/Stripes/OptionsLegend'
import HoverMetric from '@/components/Stripes/HoverMetric'

import DatesDisplay from '@/components/SummaryTable/DatesDisplay'

import DataOptionsBar from '@/components/Energy/DataOptionsBar.vue'
import OpenChart from '@/components/Charts/OpenChart'
import CompareTable from '@/components/Compare/Table.vue'

import Draggable from '@/components/ui/DraggableContainer'

export default {
  layout: 'main',

  components: {
    Heatmap,
    ColourLegend,
    OptionsLegend,
    HoverMetric,
    OpenChart,
    DataOptionsBar,
    CompareTable,
    Draggable,
    DatesDisplay
  },

  head() {
    return {
      title: `: Compare Regions`,
      meta: [
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: `OpenNEM: Compare Regions`
        },
        {
          hid: 'twitter:image:src',
          name: 'twitter:image:src',
          content: this.cardFilename
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: `OpenNEM: Compare Regions`
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
      baseUrl: `${this.$config.url}/images/screens/`,
      width: 0,
      periods,
      metrics,
      dateRange: getStripesDateRange(),
      startEndDates: getStripesStartEndDates(),
      responseDataset: null,
      regionData: [],
      dataDomains: {},
      ranges: COMPARE_RANGES,
      intervals: COMPARE_RANGE_INTERVALS,
      range: RANGE_ALL_12MTH_ROLLING,
      interval: INTERVAL_MONTH,
      filterPeriod: FILTER_NONE,
      hoverDate: null,
      hoverValue: null,
      hoverRegion: '',
      hoverDisplay: null,
      regionId: 'nem',
      allBucket,
      domains: getAuRegions(),
      hiddenDomains: [],
      zoomExtent: [],
      isHovering: false,
      bucket: [],
      tableDataset: {},
      rangeIntervalsQuery: null
    }
  },

  computed: {
    ...mapGetters({
      fuelTechGroupName: 'fuelTechGroupName',
      tabletBreak: 'app/tabletBreak',
      xGuides: 'visInteract/xGuides',
      featureEmissions: 'feature/emissions'
    }),

    chartTitle() {
      return this.selectedMetricObject.label
    },

    chartUnit() {
      const type= this.selectedMetricObject.value

      if (type.toLowerCase().includes('value')) return '$/MWh'
      return this.selectedMetricObject.unit
    },

    selectedMetric: {
      get() {
        return this.$store.getters['stripes/selectedMetric']
      },

      set(val) {
        
        this.$store.commit('stripes/selectedMetric', val)
      }
    },

    selectedMetricObject() {
      return this.metrics.find((m) => m.value === this.selectedMetric)
    },
    selectedPeriod: {
      get() {
        return this.$store.getters['stripes/selectedPeriod']
      },

      set(val) {
        this.$store.commit('stripes/selectedPeriod', val)
      }
    },

    selectedPeriodObject() {
      return this.periods.find((p) => p.value === this.selectedPeriod)
    },

    queryMetric() {
      return this.$route.query.metric
    },

    queryRange() {
      return this.$route.query.range
    },

    queryInterval() {
      return this.$route.query.interval
    },

    queryFilterPeriod() {
      return this.$route.query.filter
    },

    // update card image
    cardFilename() {
      return `${this.baseUrl}opennem-stripes-${this.regionId}.png`
    },

    lineChartDataset() {
      const arr = cloneDeep(this.bucket)

      if (arr && arr.length) {
        this.regionData.forEach(region => {
          const id =  region.regionId

          region.data.forEach((d, i) => {
            arr[i][id] = d[this.selectedMetric]
          })
        })

        // add display time to show dot in middle of interval
        arr.forEach((d, i) => {
          const start = d.time
          const next = arr[i+1] ? arr[i+1].time : null
          if (next) {
            const mid = (next - start) / 2
            d.displayTime = d.time + mid
          }
        })

        const lastSecondItem = arr[arr.length - 2]
        const lastItem = arr[arr.length - 1]
        const mid = (lastItem.time - lastSecondItem.time) / 2
        lastItem.displayTime = lastItem.time + mid

        return arr
      }

      return []
    },

    annotations() {
      if (this.selectedMetric === 'netInterconnectorFlow') {
        return [{
          label: '＋ Imports',
          valueLocation: 'yTop',
          offset: 10,
          'dominant-baseline': 'hanging',
          'text-anchor': 'end',
          'font-family': 'Playfair Display',
          fill: '#666'
        }, {
          label: '－ Exports',
          valueLocation: 'yBottom',
          offset: -10,
          'dominant-baseline': 'auto',
          'text-anchor': 'end',
          'font-family': 'Playfair Display',
          fill: '#666'
        }]
      }

      return []
    }
    
  },

  watch: {
    regionId(id) {
      this.getData(id)
    },

    queryMetric(metric) {
      if (metric) {
        this.selectedMetric = metric
      }
    },

    selectedMetric(val) {
      this.$router.push({
        query: {
          ...this.rangeIntervalsQuery,
          metric: val
        }
      })
    },
    
    rangeIntervalsQuery(val) {
      this.$router.push({
        query: {
          ...val,
          metric: this.selectedMetric
        }
      })
    },

    async lineChartDataset(val) {
      if (val.length > 0) {
        await this.doUpdateXGuides({
          interval: this.interval,
          start: val[0].time,
          end: val[val.length - 1].time
        })
      }
    },

    hoverDate(val) {
      if (val) {
        const find = this.lineChartDataset.find(d => isSameDay(d.date, this.hoverDate))
        this.tableDataset = find || {}
      } else {
        this.tableDataset = {}
      }
    }
  },

  created() {
    this.$store.dispatch('currentView', 'compare')

    this.selectedMetric = this.queryMetric || 'renewablesProportion'
    this.range = this.queryRange ? getRangeByRangeQuery(this.queryRange) : RANGE_ALL_12MTH_ROLLING
    this.interval = this.queryInterval? getIntervalByIntervalQuery(this.queryInterval) : INTERVAL_MONTH
    this.filterPeriod = this.queryFilterPeriod ? getFilterByFilterQuery(this.queryFilterPeriod) : FILTER_NONE
  },

  mounted() {
    this.getData(this.regionId)

    this.width = this.$el.offsetWidth - 32

    window.addEventListener(
      'resize',
      debounce(() => {
        this.width =
          this.$el.offsetWidth === 0 ? this.width : this.$el.offsetWidth - 32
      }),
      50
    )
  },

  methods: {
    ...mapActions({
      doGetRegionData: 'regionEnergy/doGetRegionData',
      doGetAllData: 'regionEnergy/doGetAllData',
      doGetAllMonthlyData: 'regionEnergy/doGetAllMonthlyData',
      doUpdateAllRegionDatasetByInterval: 'regionEnergy/doUpdateAllRegionDatasetByInterval',
      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats'
    }),
    ...mapMutations({
      setHighlightDomain: 'visInteract/highlightDomain',
      setQuery: 'app/query'
    }),

    valueFormatter(value) {
      if (value !== 0 && !value) return '—'
      const metricFormat = this.selectedMetricObject?.numberFormatString
      const metricLabel = this.selectedMetricObject?.label
      const metricUnit = this.selectedMetricObject?.unit
      const formattedValue = numFormat(metricFormat || ',.0f')(value)
      return formattedValue + metricUnit
    },

    getData() {
      this.fetching = true
      this.regionData = []

      this.doGetAllMonthlyData({
        regions: this.domains,
        range: this.range,
        interval: this.interval,
        filterPeriod: this.filterPeriod
      }).then(d => {
        this.responseDataset = cloneDeep(d)
        this.setRegionDataAndBucket(this.responseDataset)
      })
    },

    updateDataWithInterval() {
      if (this.responseDataset) {
        this.doUpdateAllRegionDatasetByInterval({
          regions: this.domains,
          range: this.range,
          interval: this.interval,
          filterPeriod: this.filterPeriod
        }).then(d => {
          this.setRegionDataAndBucket(d)
        })
      } 
    },

    setRegionDataAndBucket(data) {
      const d = cloneDeep(data)
      const dataset = {}
      const regions = this.domains

      this.doUpdateTickFormats({
        range: this.range,
        interval: this.interval,
        filterPeriod: this.filterPeriod
      })

      regions.forEach(r => {
        const id = r.id

        const { filteredDatasetFlat } = dataFilterByPeriod({
          currentDataset: d[id].dataset,
          interval: this.interval,
          period: this.filterPeriod
        })

        dataset[id] = {
          originalDataset: filteredDatasetFlat,
          domainPowerEnergy: d[id].domainPowerEnergy,
          domainEmissions: d[id].domainEmissions,
          domainMarketValue: d[id].domainMarketValue,
          domainPrice: d[id].domainPrice,
          domainTemperature: d[id].domainTemperature,
          domainDemandPrice: d[id].domainDemandPrice,
          domainDemandEnergy: d[id].domainDemandEnergy,
          domainDemandPower: [],
          domainDemandMarketValue: d[id].domainDemandMarketValue,
          inflation: d[id].inflation
        }
      })

      getRegionCompareData(dataset, regions, this.interval, this.filterPeriod).then(r => {
        this.regionData = r.regionData
        this.bucket = r.bucket
        this.fetching = false
      })
    },

    handleMousemove({ id, date, value }, regionId) {
      this.hoverRegion = regionId
      this.hoverDate = date
      this.hoverValue = value
      this.isHovering = true
    },
    handleMouseout() {
      this.hoverDate = null
      this.hoverValue = null
      this.isHovering = false
    },

    handleDateHover(date) {
      this.hoverDate = date ? DateDisplay.getClosestDateByInterval(
        date,
        this.interval,
        this.filterPeriod
      ) : null
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

        filteredDates = [startTime, endTime]
      } else {
        filteredDates = []
      }

      this.zoomExtent = filteredDates
    },

    handleRangeIntervalChange({ query, range, interval, filterPeriod }) {
      this.range = range !== RANGE_ALL_12MTH_ROLLING && range !== RANGE_ALL ? RANGE_ALL_12MTH_ROLLING : range
      this.interval = interval
      this.filterPeriod = filterPeriod
      this.rangeIntervalsQuery = query

      this.updateDataWithInterval()
    },

    handleDomainHide(domainId) {
      if (this.hiddenDomains.includes(domainId)) {
        this.hiddenDomains = this.hiddenDomains.filter(d => d !== domainId)
      } else {
        const hidden = [...this.hiddenDomains, domainId]

        if (hidden.length === this.domains.length) {
          this.hiddenDomains = []
        } else {
          this.hiddenDomains = hidden
        }
      }
    },

    handleDomainsHide(domainIds) {
      this.hiddenDomains = [...domainIds]
    },

    handleHighlightDomain(id) {
      this.setHighlightDomain(id)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

$breakpoint: 900px;

.container-fluid {
  padding: 0.8rem 0.2rem;
  height: 100%;

  @include mobile {
    padding-top: 0;
  }
}

.floating-palette {
  width: 300px;
  background-color: #fff;
  z-index: 9999;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  top: 15vh;
  right: 50px;
  bottom: 100px;
  overflow-y: auto;
  font-size: 10px;

  table {
    font-weight: bold;

  }

  header {
    background-color: #eee;
    cursor: move;
    padding: 10px;
    border-radius: 6px 6px 0 0;
    font-weight: 700;
    font-family: 'Playfair Display', Georgia, 'Times New Roman', Times, serif;
    font-size: 16px;

    i.fal {
      position: relative;
      top: 1px;
    }
  }
}

h3 {
  font-family: $header-font-family;
  font-size: 1.4em;
  font-weight: 300;
  margin-left: 2px;
  padding-bottom: 0.5rem;
  text-align: right;
  border-bottom: 1px solid #ddd;
}

.chart-table-container {
  display: block;
  padding: 0 0.5rem 0 0;
  
  & > * {
    margin-bottom: 1rem;
    width: 100%;
  }

  @media screen and (min-width: $breakpoint) {
    display: flex;
    gap: 0.5rem;  
    padding: 0 0.5rem;

    .open-chart {
      width: 70%;
    }
    .compare-table {
      width: 30%;
    }
  }
}

.vis-options {
  display: block;
  padding: 0;
  
  & > * {
    margin-bottom: 1rem;
  }

  .metric-selection {
    margin-left: 0.5rem;
  }

  @media screen and (min-width: $breakpoint) {
    display: flex;
    padding: 0 0.5rem;
    margin-bottom: 1rem;
  }
}

.options-bar {
  @media screen and (min-width: $breakpoint) {
    padding: 0; 
    margin-left: 1rem;
    display: flex;
    align-items: center;
  }

  ::v-deep .buttons {
    @media screen and (min-width: $breakpoint) {
      background-color: transparent;
    }
  }

  ::v-deep .button {
    @media screen and (min-width: $breakpoint) {
      border-radius: 290486px;
    }
  }

  ::v-deep .range-buttons {
    @media screen and (min-width: $breakpoint) {
      margin-bottom: 0;
      margin-right: 0.4rem;
    }
  }
}

.vis-section {
  position: relative;

  h4 {
    font-family: $header-font-family;
    font-size: 1.2em;
    font-weight: 700;
  }

  .heatmap-label {
    font-family: $header-font-family;
    font-weight: 700;
    font-size: 1em;
    position: absolute;
    z-index: 9;
    color: #fff;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
    background-color: rgba(0, 0, 0, 0.2);
    padding: 0 3px 1px;
    border-radius: 0 0 1px 0;
    left: 1px;
    margin-top: 1px;
  }

  .region-label {
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.6);
    }
  }

  header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;

    small {
      font-family: $family-primary;
      font-size: 0.7em;
      font-weight: 300;
    }
  }
}

:deep(.heatmap) {
  border: 1px solid #ddd;
}
</style>
