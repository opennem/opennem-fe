<template>
  <div
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartShown
    }"
    class="chart"
    @mouseenter="() => showDivider = true"
    @mouseleave="() => showDivider = false"
  >
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
      :show-date-axis="showDateAxis"
      @date-axis="(visible) => showDateAxis = visible"
    />

    <button
      v-if="
        showDateAxis && chartShown &&
          zoomExtent.length > 0 &&
          !readOnly
      "
      class="button is-rounded is-small reset-btn"
      @click.stop="handleZoomReset"
    >
      Zoom Out
    </button>

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
      :class="{ dragging: dragging }"
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
      :vis-height="chartHeight"
      :show-zoom-out="false"
      :connect-zero="false"
      :x-guides="xGuides"
      :y-guides="[0, 100, 200, 300]"
      :filter-period="filterPeriod"
      :class="{ dragging: dragging }"
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
      :class="{ dragging: dragging }"
      class="price-neg-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
    <date-brush
      v-if="showDateAxis && chartShown"
      :dataset="priceDataset"
      :zoom-range="zoomExtent"
      :read-only="readOnly"
      :interval="interval"
      :filter-period="filterPeriod"
      :x-ticks="xTicks"
      :tick-format="tickFormat"
      :second-tick-format="secondTickFormat"
      :append-datapoint="isEnergyType ? true : false"
      class="date-brush vis-chart"
      @date-hover="handleDateHover"
      @date-filter="handleZoomExtent"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
    <Divider       
      style="transform: translateY(-14px); margin-left: 0.5rem;"
      :allow-x="false" 
      :show="showDivider"
      @dragging="(d) => dragging = d" 
      @dragged="onDragged"
      @last-drag="() => draggedHeight = chartHeight" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import * as OPTIONS from '@/constants/chart-options.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'
import DateDisplay from '@/services/DateDisplay.js'
import PriceChartOptions from './PriceChartOptions'
import LineVis from '@/components/Vis/Line.vue'
import DateBrush from '@/components/Vis/DateBrush'
import Divider from '@/components/Divider.vue'

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
    LineVis,
    DateBrush,
    Divider
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
    },
    useDemand: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      options,
      lineColour: '#e34a33',
      chartHeight: 80,
      draggedHeight: 80,
      dragging: false,
      showDivider: false
    }
  },

  computed: {
    ...mapGetters({
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      xGuides: 'visInteract/xGuides',
      xTicks: 'visInteract/xTicks',
      visTickFormat: 'visInteract/tickFormat',
      visSecondTickFormat: 'visInteract/secondTickFormat',

      chartShown: 'chartOptionsPrice/chartShown',
      chartType: 'chartOptionsPrice/chartType',
      chartCurve: 'chartOptionsPrice/chartCurve',

      summary: 'regionEnergy/summary',
      isEnergyType: 'regionEnergy/isEnergyType'
    }),

    showDateAxis: {
      get() {
        return this.$store.getters['chartOptionsPrice/chartDateAxis']
      },
      set(value) {
        this.$store.commit('chartOptionsPrice/chartDateAxis', value)
      }
    },

    tickFormat() {
      if (typeof this.visTickFormat === 'string') {
        return AxisTimeFormats[this.visTickFormat]
      }
      return this.visTickFormat
    },

    secondTickFormat() {
      return AxisTimeFormats[this.visSecondTickFormat]
    },

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
      return this.summary
        ? this.useDemand
          ? this.summary._totalDemandAverageValue
          : this.summary._totalAverageValue
        : this.averageValue
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
      return this.priceDataset.find((d) => d.time === time)
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

  watch: {
    showDateAxis() {
      this.doUpdateXTicks({
        range: this.range,
        interval: this.interval,
        isZoomed: this.zoomExtent.length > 0,
        filterPeriod: this.filterPeriod
      })
      this.doUpdateTickFormats({
        range: this.range,
        interval: this.interval,
        filterPeriod: this.filterPeriod
      })
    }
  },

  methods: {
    ...mapActions({
      doUpdateXTicks: 'visInteract/doUpdateXTicks',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats'
    }),
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
    },
    handleZoomReset() {
      this.$emit('zoomExtent', [])
    },
    onDragged({ offsetY }) {
      if (this.draggedHeight + offsetY > 35) {
        this.chartHeight = this.draggedHeight + offsetY
      } else {
        this.chartHeight = 35
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.reset-btn {
  position: absolute;
  top: 39px;
  right: 14px;
  z-index: 999;
}
.price-vis {
  position: relative;
  top: -7px;
}
.price-neg-vis {
  position: relative;
  top: -14px;
}

.brush-vis {
  position: relative;
  top: -14px;
}
:deep(.price-vis .y-axis-guide-group .domain) {
  fill: rgba(255, 255, 255, 0.1);
}
:deep(.price-pos-vis .y-axis-guide-group .tick:not(:first-of-type) text),
:deep(.price-neg-vis .y-axis-guide-group .tick text) {
  display: none;
}
:deep(.price-neg-vis .line-group path),
:deep(.price-pos-vis .line-group path) {
  stroke-dasharray: 1;
}
:deep(.price-vis .focus-top-rect),
:deep(.price-vis .focus-bottom-rect),
:deep(.price-pos-vis .focus-bottom-rect),
:deep(.price-neg-vis .focus-top-rect) {
  opacity: 0 !important;
}

.dragging {
  opacity: 0.75;
  pointer-events: none;
}
</style>
