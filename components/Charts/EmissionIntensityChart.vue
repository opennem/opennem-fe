<template>
  <div
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartShown
    }"
    class="emission-intensity-chart chart"
    @mouseenter="() => showDivider = true"
    @mouseleave="() => showDivider = false"
  >
    <emission-intensity-chart-options
      :read-only="readOnly"
      :options="options"
      :chart-shown="chartShown"
      :chart-type="chartType"
      :chart-curve="chartCurve"
      :interval="interval"
      :average-emission-intensity="averageEmissionIntensity"
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
      :domain-id="'_emissionIntensity'"
      :domain-colour="lineColour"
      :dataset="emissionIntensityDataset"
      :dynamic-extent="zoomExtent"
      :hover-date="hoverDate"
      :hover-on="hoverOn"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :range="range"
      :interval="interval"
      :curve="chartCurve"
      :y-axis-log="false"
      :y-min="-50"
      :y-max="yMax"
      :show-x-axis="false"
      :show-tooltip="false"
      :show-point-on-hover="true"
      :vis-height="chartHeight"
      :show-zoom-out="showDateAxis"
      :x-guides="xGuides"
      :y-axis-ticks="3"
      :filter-period="filterPeriod"
      :class="{ dragging: dragging }"
      class="emission-intensity-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />

    <date-brush
      v-if="showDateAxis && chartShown"
      :dataset="emissionIntensityDataset"
      :zoom-range="zoomExtent"
      :read-only="readOnly"
      :interval="interval"
      :filter-period="filterPeriod"
      :x-ticks="xTicks"
      :tick-format="tickFormat"
      :second-tick-format="secondTickFormat"
      class="date-brush vis-chart"
      @date-hover="handleDateHover"
      @date-filter="handleZoomExtent"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />

    <Divider 
      v-if="allowResize"
      style="margin-left: 0.5rem;"
      :allow-x="false" 
      :show="showDivider"
      @dragging="(d) => dragging = d" 
      @dragged="onDragged"
      @last-drag="() => draggedHeight = chartHeight" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as OPTIONS from '@/constants/chart-options.js'
import DateDisplay from '@/services/DateDisplay.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'
import EmissionIntensityChartOptions from '@/components/Charts/EmissionIntensityChartOptions'
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
    EmissionIntensityChartOptions,
    LineVis,
    DateBrush,
    Divider
  },

  props: {
    emissionIntensityDataset: {
      type: Array,
      default: () => []
    },
    domainEmissionIntensity: {
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
    averageEmissionIntensity: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      options,
      lineColour: '#e34a33',
      chartHeight: 150,
      draggedHeight: 150,
      dragging: false,
      showDivider: false
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      xGuides: 'visInteract/xGuides',
      chartShown: 'chartOptionsEmissionIntensity/chartShown',
      chartType: 'chartOptionsEmissionIntensity/chartType',
      chartCurve: 'chartOptionsEmissionIntensity/chartCurve',
      xTicks: 'visInteract/xTicks',
      visTickFormat: 'visInteract/tickFormat',
      visSecondTickFormat: 'visInteract/secondTickFormat',

      allowResize: 'regionEnergy/allowResize'
    }),

    showDateAxis: {
      get() {
        return this.$store.getters['chartOptionsEmissionIntensity/chartDateAxis']
      },
      set(value) {
        this.$store.commit('chartOptionsEmissionIntensity/chartDateAxis', value)
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

    yMax() {
      let max = 1000
      this.emissionIntensityDataset.forEach((d) => {
        if (d._emissionIntensity > max) {
          max = d._emissionIntensity
        }
      })
      return max + 200 // pad upper limit
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
      return this.emissionIntensityDataset.find((d) => d.time === time)
    },

    hoverValue() {
      if (this.hoverData) {
        console.log(
          `emissions: ${this.hoverData._totalEmissions}, power/energy: ${this.hoverData._totalPowerEnergy}, intensity: ${this.hoverData._emissionIntensity}`
        )
      }
      return this.hoverData ? this.hoverData._emissionIntensity : null
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

  mounted() {
    if (this.tabletBreak) {
      this.chartHeight = 200
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
      if (this.draggedHeight + offsetY > 50) {
        this.chartHeight = this.draggedHeight + offsetY
      } else {
        this.chartHeight = 50
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
.dragging {
  pointer-events: none;
  user-select: none;
}
</style>