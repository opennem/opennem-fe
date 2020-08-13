<template>
  <div
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartPrice
    }"
    class="chart">
    
    <line-vis
      v-if="chartPrice"
      :domain-id="priceAbove300Domain"
      :domain-colour="lineColour"
      :dataset="priceDataset"
      :dynamic-extent="zoomExtent"
      :hover-date="hoverDate"
      :hover-on="hoverOn"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :range="range"
      :interval="interval"
      :show-tooltip="false"
      :curve="'step'"
      :show-y-axis="false"
      :y-axis-log="true"
      :y-min="300"
      :y-max="20000"
      :show-x-axis="false"
      :vis-height="50"
      :show-zoom-out="false"
      :connect-zero="false"
      :x-guides="xGuides"
      :y-guides="[300, 2000, 6000, 10000, 14000]"
      class="price-pos-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
    />
    <line-vis
      v-if="chartPrice"
      :domain-id="priceDomain"
      :domain-colour="lineColour"
      :dataset="priceDataset"
      :dynamic-extent="zoomExtent"
      :hover-date="hoverDate"
      :hover-on="hoverOn"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :range="range"
      :interval="interval"
      :show-tooltip="false"
      :curve="'step'"
      :show-y-axis="false"
      :y-axis-log="false"
      :y-min="0"
      :y-max="300"
      :show-x-axis="false"
      :vis-height="80"
      :show-zoom-out="false"
      :connect-zero="false"
      :x-guides="xGuides"
      :y-guides="[0, 100, 200, 300]"
      class="price-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
    />
    <line-vis
      v-if="chartPrice"
      :domain-id="priceBelow0Domain"
      :domain-colour="lineColour"
      :dataset="priceDataset"
      :dynamic-extent="zoomExtent"
      :hover-date="hoverDate"
      :hover-on="hoverOn"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :range="range"
      :interval="interval"
      :curve="'step'"
      :show-y-axis="false"
      :y-axis-log="true"
      :y-axis-invert="true"
      :y-min="-0.1"
      :y-max="-1100"
      :show-x-axis="false"
      :show-tooltip="false"
      :vis-height="35"
      :show-zoom-out="false"
      :connect-zero="false"
      :x-guides="xGuides"
      :y-guides="[-60, -400]"
      class="price-neg-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { min, max } from 'd3-array'
import _cloneDeep from 'lodash.clonedeep'
import DateDisplay from '@/services/DateDisplay.js'
import ChartHeader from '@/components/Vis/ChartHeader'
import LineVis from '@/components/Vis/Line.vue'

export default {
  components: {
    ChartHeader,
    LineVis
  },

  props: {
    hoverOn: {
      type: Boolean,
      default: false
    },
    hoverDate: {
      type: Date,
      default: null
    },
    zoomExtent: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      chartEnergyOptions: false,
      lineColour: '#e34a33'
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      chartPrice: 'visInteract/chartPrice',
      range: 'range',
      interval: 'interval',
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      currentDatasetFlat: 'regionEnergy/currentDatasetFlat',
      domainPriceMarketValue: 'regionEnergy/domainPriceMarketValue',
      domainVolWeightedPriceDomains:
        'regionEnergy/domainVolWeightedPriceDomains',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      filteredSummary: 'regionEnergy/filteredSummary'
    }),
    priceDomains() {
      return this.isEnergyType
        ? this.domainVolWeightedPriceDomains
        : this.domainPriceMarketValue
    },
    priceDataset() {
      return this.currentDatasetFlat
    },
    priceAbove300Domain() {
      return this.priceDomains.length > 0 ? this.priceDomains[1].domain : ''
    },
    priceDomain() {
      return this.priceDomains.length > 0 ? this.priceDomains[0].domain : ''
    },
    priceBelow0Domain() {
      return this.priceDomains.length > 0 ? this.priceDomains[2].domain : ''
    },
    yMin() {
      return min(this.currentDatasetFlat, d => d._stackedTotalMin)
    },
    yMax() {
      return max(this.currentDatasetFlat, d => d._stackedTotalMax)
    },
    xGuides() {
      if (this.currentDatasetFlat.length <= 0) {
        return []
      }
      let dStart = this.currentDatasetFlat[0].time
      const dEnd = this.currentDatasetFlat[this.currentDatasetFlat.length - 1]
        .time

      if (this.interval === 'Day') {
        return DateDisplay.weekendGuides(dStart, dEnd)
      }
      if (this.interval === '5m' || this.interval === '30m') {
        return DateDisplay.nightGuides(dStart, dEnd)
      }
      return []
    },
    domains() {
      return _cloneDeep(this.currentDomainPowerEnergy).reverse()
    },
    isYearInterval() {
      return this.interval === 'Fin Year' || this.interval === 'Year'
    },
    isRenewableLineOnly() {
      return this.chartEnergyRenewablesLine && this.domains.length === 0
    },
    hoverData() {
      if (!this.hoverDate) {
        return null
      }
      const time = this.hoverDate.getTime()
      // let dataset = this.currentDatasetFlat
      // if (this.chartEnergyType === 'proportion') {
      //   dataset = this.energyPercentDataset
      // }
      // if (
      //   this.chartEnergyType === 'line' &&
      //   this.chartEnergyYAxis === 'percentage'
      // ) {
      //   dataset = this.energyGrossPercentDataset
      // }
      return this.currentDatasetFlat.find(d => d.time === time)
    },
    hoverValue() {
      return this.hoverData ? this.hoverData[this.hoverDomain] : null
    },
    hoverDisplayDate() {
      let date = this.focusDate
      if (this.hoverOn) {
        date = this.hoverDate
      }
      return date
        ? DateDisplay.specialDateFormats(
            date.getTime(),
            this.range,
            this.interval,
            false,
            false,
            false,
            true
          )
        : ''
    }
  },

  methods: {
    handleDateHover(evt, date) {
      this.$emit('dateHover', date)
    },
    handleVisEnter() {
      this.$emit('isHovering', true)
    },
    handleVisLeave() {
      this.$emit('isHovering', false)
    },
    handleSvgClick(metaKey) {
      this.$emit('svgClick', metaKey)
    },
    handleZoomExtent(dateRange) {
      this.$emit('zoomExtent', dateRange)
    }
  }
}
</script>

<style lang="scss" scoped>
.price-vis {
  position: relative;
  top: -7px;
}
.price-neg-vis {
  position: relative;
  top: -14px;
}
::v-deep .price-vis .y-axis-guide-group .domain {
  fill: rgba(255, 255, 255, 0.1);
}
::v-deep .price-pos-vis .y-axis-guide-group .tick:not(:first-of-type) text,
::v-deep .price-neg-vis .y-axis-guide-group .tick text {
  display: none;
}
::v-deep .price-neg-vis .line-group path,
::v-deep .price-pos-vis .line-group path {
  stroke-dasharray: 1;
}
::v-deep .price-vis .focus-top-rect,
::v-deep .price-vis .focus-bottom-rect,
::v-deep .price-pos-vis .focus-bottom-rect,
::v-deep .price-neg-vis .focus-top-rect {
  opacity: 0 !important;
}
</style>
