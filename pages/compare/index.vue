<template>
  <div class="container-fluid">
    <h3>{{ dateRange }}</h3>

    <OptionsLegend 
      :legend-width="tabletBreak ? 200 : 310" 
      :legend-font-size="tabletBreak ? 9 : 10"
      :show-legend="regionData.length > 0" 
      :hover-display="hoverDisplay" 
      :use-hover="!useAllPeriods"
      :show-hover="hoverDate ? true : false" />

    <div class="vis-container">
      <DataOptionsBar
        :ranges="ranges"
        :intervals="intervals"
        :range="range"
        :interval="interval"
        :filter-period="filterPeriod"
        @rangeChange="handleRangeChange"
        @intervalChange="handleIntervalChange"
        @queryChange="handleQueryChange"
        @filterPeriodChange="handleFilterPeriodChange"
      />

      <OpenChart
        v-if="!fetching && lineChartDataset.length > 0"
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
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering"
        @zoomExtent="handleZoomExtent"
      />

      <section 
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
      </section>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import debounce from 'lodash.debounce'
import cloneDeep from 'lodash.clonedeep'

import { getEnergyRegionLabel, getNemRegions } from '@/constants/energy-regions.js'
import { periods, metrics } from '@/constants/stripes/'
import { RANGE_ALL, COMPARE_RANGES, COMPARE_RANGE_INTERVALS } from '@/constants/ranges.js'
import { INTERVAL_MONTH, FILTER_NONE } from '@/constants/interval-filters.js'
import DateDisplay from '@/services/DateDisplay.js'

import {
  allBucket,
  getRegionStripesData,
  getStripesDateRange,
  getStripesStartEndDates,
  getStripesRegion
} from '@/data/pages/page-stripes.js'

import Heatmap from '@/components/Vis/Heatmap'
import ColourLegend from '@/components/Vis/ColourLegend'
import OptionsLegend from '@/components/Stripes/OptionsLegend'
import HoverMetric from '@/components/Stripes/HoverMetric'

import DataOptionsBar from '@/components/Energy/DataOptionsBar.vue'
import OpenChart from '@/components/Charts/OpenChart'

export default {
  layout: 'main',

  components: {
    Heatmap,
    ColourLegend,
    OptionsLegend,
    HoverMetric,
    OpenChart,
    DataOptionsBar
  },

  head() {
    return {
      title: `: ${getEnergyRegionLabel(this.regionId)} Stripes`,
      meta: [
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: `OpenNEM: ${getEnergyRegionLabel(this.regionId)} Stripes`
        },
        {
          hid: 'twitter:image:src',
          name: 'twitter:image:src',
          content: this.cardFilename
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: `OpenNEM: ${getEnergyRegionLabel(this.regionId)} Stripes`
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
      regionData: [],
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
      domains: getNemRegions(),
      hiddenDomains: [],
      zoomExtent: [],
      isHovering: false
    }
  },

  computed: {
    ...mapGetters({
      fuelTechGroupName: 'fuelTechGroupName',
      tabletBreak: 'app/tabletBreak',
      xGuides: 'visInteract/xGuides'
    }),

    selectedPeriod: {
      get() {
        return this.$store.getters['stripes/selectedPeriod']
      },

      set(val) {
        this.$store.commit('stripes/selectedPeriod', val)
      }
    },

    selectedMetric: {
      get() {
        return this.$store.getters['stripes/selectedMetric']
      },

      set(val) {
        const query = { metric: val }
        this.$router.push({
          path: `?metric=${val}`
        })
        this.$store.commit('stripes/selectedMetric', val)
        this.setQuery(query)
        this.hoverDisplay = null
      }
    },

    selectedMetricObject() {
      return this.metrics.find((m) => m.value === this.selectedMetric)
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

    lineChartDataset() {
      console.log(this.domains, this.regionData, this.selectedMetric)
      const arr = cloneDeep(allBucket)

      this.regionData.forEach(region => {
        console.log(region.regionId)
        const id =  region.regionId

        region.data.forEach((d, i) => {
          arr[i][id] = d[this.selectedMetric]
        })
      })

      console.log('arr', arr)

      return arr
    }

    
  },

  watch: {
    regionId(id) {
      this.getData(id, this.selectedPeriod)
    },
    queryMetric(metric) {
      if (metric) {
        this.selectedMetric = metric
      }
    },
    async lineChartDataset(val) {
      console.log('line', val)
      if (val.length > 0) {
        await this.doUpdateXGuides({
          interval: this.interval,
          start: val[0].time,
          end: val[val.length - 1].time
        })
      }
    },
    xGuides(val) {
      console.log('xGuides', val)
    }
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
    this.getData(this.regionId, this.selectedPeriod)

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
      doUpdateXGuides: 'visInteract/doUpdateXGuides'
    }),
    ...mapMutations({
      setQuery: 'app/query'
    }),

    getData(id, period) {
      // reset
      this.fetching = true
      this.regionData = []
      const regions = getStripesRegion(id)

      this.selectedPeriod = 'all/month'

      getRegionStripesData(this.doGetAllData, regions).then((d) => {
        this.regionData = d
        this.fetching = false
        console.log('this.regionData', d)
        console.log('startEndDates', this.startEndDates)
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
    },
    handleIntervalChange(interval) {
      this.interval = interval
    },
    handleFilterPeriodChange(period) {
      this.filterPeriod = period
    },
    handleQueryChange(query) {
      console.log(query)
      // this.$router.push({
      //   query
      // })

      // this.setQuery(query)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.container-fluid {
  padding: 1rem 16px;
  height: 100%;

  @include mobile {
    padding-top: 0;
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

.vis-container {
  margin-top: 1.8rem;
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
