<template>
  <div class="container-fluid">

    <!-- <OptionsLegend 
      :legend-width="tabletBreak ? 200 : 310" 
      :legend-font-size="tabletBreak ? 9 : 10"
      :show-legend="false" 
      :hover-display="hoverDisplay" 
      :use-hover="!useAllPeriods"
      :show-hover="hoverDate ? true : false" /> -->

    <!-- <Draggable class="floating-palette">
      <template slot="header">
        <header>Vic</header>
      </template>
      <template slot="main">
        <table class="table is-fullwidth is-striped is-narrow">
          <tbody>
            <tr 
              v-for="(d) in regionTableData?.data" 
              :key="d.time">
              <td>{{ d.time | formatLocalDate }}</td>
              <td style="text-align: right;">{{ valueFormatter(d[selectedMetric]) }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </Draggable> -->
    
    <div class="vis-container">
      <div class="vis-options">
        <div 
          class="metric-selection select is-rounded">
          <select v-model="selectedMetric">
            <option 
              v-if="featureEmissions" 
              value="carbonIntensity">
              Carbon intensity
            </option>
            <option value="netInterconnectorFlow">
              Net interconnector flow (of demand)
            </option>

            <optgroup label="Proportion">
              <option value="renewablesProportion">
                Renewables proportion (of demand)
              </option>
              <option value="solarProportion">
                Solar proportion (of demand)
              </option>
              <option value="windProportion">Wind proportion (of demand)</option>
              <option value="gasProportion">Gas proportion (of demand)</option>
              <option value="coalProportion">Coal proportion (of demand)</option>
            </optgroup>

            <optgroup label="Average value">
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
          @rangeOptionChange="handleRangeChange"
          @intervalChange="handleIntervalChange"
          @queryChange="handleQueryChange"
          @filterPeriodChange="handleFilterPeriodChange"
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

      <!-- <section 
        v-for="(d, i) in regionData" 
        :key="`region-${i}`" 
        class="vis-section">

        <HoverMetric
          v-if="hoverDate"
          :is-yearly="d.yearlyData && d.yearlyData.length > 0 ? true : false"
          :hover-date="hoverDate"
          :data="d.data"
          :hover-value="hoverValue"
          :selected-metric="selectedMetric"
          :selected-metric-object="selectedMetricObject"
          :selected-period="selectedPeriodObject"
          :style="{ display: useAllPeriods ? 'block' : 'none' }"
          @hover-obj="(d) => (hoverDisplay = d)"
        />
        
        <div style="width: 100%">
          <nuxt-link 
            :to="`/stripes/${d.regionId}/?metric=${selectedMetric}`" 
            class="heatmap-label region-label">{{
            d.region }}</nuxt-link>
          <Heatmap 
            :cell-height="75" 
            :svg-width="width" 
            :svg-height="75" 
            :radius="0" 
            :dataset="d.data"
            :value-prop="selectedMetric" 
            :tooltip-value-prop="
              selectedMetricObject.valueProp  
                ? selectedMetricObject.valueProp
                : selectedMetric
            " 
            :divisor="selectedMetricObject.divisor" 
            :offset="selectedMetricObject.offset"
            :colour-range="selectedMetricObject.range" 
            :colour-domain="selectedMetricObject.domain"
            :hover-date="hoverDate" 
            @rect-mousemove="
              (obj) => {
                handleMousemove(obj, d.regionId)
              }
            " 
            @rect-mouseout="handleMouseout" />
        </div>
      </section> -->
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
import { RANGE_ALL, RANGE_ALL_12MTH_ROLLING, RANGE_INTERVALS, COMPARE_RANGES, COMPARE_RANGE_INTERVALS } from '@/constants/ranges.js'
import { INTERVAL_MONTH, FILTER_NONE } from '@/constants/interval-filters.js'
import DateDisplay from '@/services/DateDisplay.js'
import {
  simpleDataProcess,
  dataProcess,
  simpleDataRollUp,
  dataFilterByPeriod
} from '@/data/parse/region-energy'
import getStripesDataset from '@/data/transform/energy-to-stripe-metrics.js'

import {
  allBucket,
  getRegionStripesData,
  getRegionCompareData,
  getStripesDateRange,
  getStripesStartEndDates,
  getStripesRegion
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
      title: `: ${getEnergyRegionLabel(this.regionId)} Compare`,
      meta: [
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: `OpenNEM: ${getEnergyRegionLabel(this.regionId)} Compare`
        },
        {
          hid: 'twitter:image:src',
          name: 'twitter:image:src',
          content: this.cardFilename
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: `OpenNEM: ${getEnergyRegionLabel(this.regionId)} Compare`
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
      range: RANGE_ALL,
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
      tableDataset: {}
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
        this.$router.push({
          query: {
            metric: val
          }
        })
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

    useAllPeriods() {
      return this.regionId === 'au' || this.regionId === 'nem'
    },

    cardFilename() {
      return `${this.baseUrl}opennem-stripes-${this.regionId}.png`
    },

    regionTableData() {
      const vicData = this.regionData.filter((d) => d.regionId === 'vic1')[0]
      return vicData
    },

    lineChartDataset() {
      const arr = cloneDeep(this.bucket)

      if (arr && arr.length) {
        console.log('lineChartDataset', this.regionData)
        this.regionData.forEach(region => {
          const id =  region.regionId

          region.data.forEach((d, i) => {
            arr[i][id] = d[this.selectedMetric]
          })
        })

        return arr
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
      }
    }
  },

  created() {
    this.$store.commit('stripes/selectedMetric', 'windValue')
  },

  mounted() {
    if (this.queryMetric) {
      this.selectedMetric = this.queryMetric
    } else {
      this.$router.push({
        query: {
          metric: this.selectedMetric
        }
      })
    }

    this.$store.dispatch('currentView', 'compare')
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
      if (metricLabel === "Carbon intensity") return formattedValue
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
        console.log('doGetAllMonthlyData', d)
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

        filteredDates = [startTime, endTime]
      } else {
        filteredDates = []
      }

      this.zoomExtent = filteredDates
    },

    handleRangeChange(range) {
      this.range = range
      this.interval = COMPARE_RANGE_INTERVALS[range][0]

      this.updateDataWithInterval()
    },
    handleIntervalChange(interval) {
      this.interval = interval

      this.updateDataWithInterval()
    },
    handleFilterPeriodChange(period) {
      this.filterPeriod = period

      this.updateDataWithInterval()
    },
    handleQueryChange(query) {
      console.log(query)
      // this.$router.push({
      //   query
      // })

      // this.setQuery(query)
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
  padding: 0 0.5rem;
  
  & > * {
    margin-bottom: 1rem;
    width: 100%;
  }

  @media screen and (min-width: 1083px) {
    display: flex;
    gap: 0.5rem;  

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
  padding: 0 0.5rem;
  
  & > * {
    margin-bottom: 1rem;
  }

  @media screen and (min-width: 1083px) {
    display: flex;
    margin-bottom: 1rem;
  }
}

.options-bar {
  @media screen and (min-width: 1083px) {
    padding: 0; 
    margin-left: 1rem;
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
