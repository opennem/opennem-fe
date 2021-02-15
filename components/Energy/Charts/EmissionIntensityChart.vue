<template>
  <div
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartShown
    }"
    class="emission-intensity-chart chart">

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
    />

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
      :vis-height="100"
      :show-zoom-out="false"
      :x-guides="xGuides"
      :y-axis-ticks="3"
      class="emission-intensity-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as OPTIONS from '@/constants/chart-options.js'
import DateDisplay from '@/services/DateDisplay.js'
import EmissionIntensityChartOptions from '@/components/Energy/Charts/EmissionIntensityChartOptions'
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
    EmissionIntensityChartOptions,
    LineVis
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
    averageEmissionIntensity: {
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
      chartShown: 'chartOptionsEmissionIntensity/chartShown',
      chartType: 'chartOptionsEmissionIntensity/chartType',
      chartCurve: 'chartOptionsEmissionIntensity/chartCurve'
    }),

    yMax() {
      console.log(this.emissionIntensityDataset)
      let max = 1000
      this.emissionIntensityDataset.forEach(d => {
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
      return this.emissionIntensityDataset.find(d => d.time === time)
    },

    hoverValue() {
      if (this.hoverData) {
        console.log(
          `emissions: ${
            this.hoverData._totalEmissions
          }, power/energy (w/o battery_discharging): ${
            this.hoverData._totalPowerEnergyMinusBatteryDischarging
          }, intensity: ${this.hoverData._emissionIntensity}`
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
