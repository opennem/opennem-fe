<template>
  <div
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartShown
    }"
    class="chart">
    <price-chart-options
      :read-only="readOnly"
      :options="options"
      :chart-shown="chartShown"
      :chart-type="chartType"
      :chart-curve="chartCurve"
      :interval="interval"
      :total-average-value="totalAverageValue"
      :hover-display-date="hoverDisplayDate"
      :hover-value="hoverValue"
    />

    <line-vis
      v-if="chartShown"
      :read-only="readOnly"
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
      :curve="chartCurve"
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
      :filter-period="filterPeriod"
      class="price-pos-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
    <line-vis
      v-if="chartShown"
      :read-only="readOnly"
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
      :curve="chartCurve"
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
      :filter-period="filterPeriod"
      class="price-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
    <line-vis
      v-if="chartShown"
      :read-only="readOnly"
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
      :curve="chartCurve"
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
      :filter-period="filterPeriod"
      class="price-neg-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import * as OPTIONS from '@/constants/chart-options.js'
import DateDisplay from '@/services/DateDisplay.js'
import PriceChartOptions from './PriceChartOptions'
import LineVis from '@/components/Vis/Line.vue'

const options = {
  type: [OPTIONS.CHART_HIDDEN, OPTIONS.CHART_LINE],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: []
}

export default {
  components: {
    PriceChartOptions,
    LineVis
  },

  props: {
    priceDataset: {
      type: Array,
      default: () => []
    },
    domainPrice: {
      type: Array,
      default: () => []
    },
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
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    range: {
      type: String,
      default: ''
    },
    interval: {
      type: String,
      default: ''
    },
    filterPeriod: {
      type: String,
      default: ''
    },
    averageValue: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      options,
      lineColour: '#e34a33'
    }
  },

  computed: {
    ...mapGetters({
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      xGuides: 'visInteract/xGuides',
      chartShown: 'chartOptionsPrice/chartShown',
      chartType: 'chartOptionsPrice/chartType',
      chartCurve: 'chartOptionsPrice/chartCurve',

      summary: 'regionEnergy/summary'
    }),
    priceAbove300Domain() {
      return this.domainPrice.length > 0 ? this.domainPrice[1].domain : ''
    },
    priceDomain() {
      return this.domainPrice.length > 0 ? this.domainPrice[0].domain : ''
    },
    priceBelow0Domain() {
      return this.domainPrice.length > 0 ? this.domainPrice[2].domain : ''
    },
    totalAverageValue() {
      return this.summary ? this.summary._totalAverageValue : this.averageValue
    },
    hoverData() {
      let date = this.focusDate
      if (this.hoverOn) {
        date = this.hoverDate
      }
      if (!date) {
        return null
      }
      const time = date.getTime()
      return this.priceDataset.find(d => d.time === time)
    },
    hoverValue() {
      return this.hoverData ? this.hoverData[this.priceDomain] : null
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
