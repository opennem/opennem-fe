<template>
  <div 
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartShown,
      'adjustment': chartPrice
    }"
    class="temperature-chart chart">

    <temperature-chart-options
      :options="options"
      :chart-shown="chartShown"
      :chart-type="chartType"
      :chart-curve="chartCurve"
      :interval="interval"
      :average-temperature="averageTemperature"
      :hover-display-date="hoverDisplayDate"
      :hover-min-temperature="hoverMinTemperature"
      :hover-mean-temperature="hoverMeanTemperature"
      :hover-max-temperature="hoverMaxTemperature"
    />

    <line-vis
      v-if="chartShown"
      :domain-id="temperatureMeanDomain"
      :min-domain-id="temperatureMinDomain"
      :max-domain-id="temperatureMaxDomain"
      :domain-colour="lineColour"
      :dataset="temperatureDataset"
      :dynamic-extent="zoomExtent"
      :hover-date="hoverDate"
      :hover-on="hoverOn"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :range="range"
      :interval="interval"
      :curve="chartCurve"
      :y-axis-log="false"
      :y-min="0"
      :show-x-axis="false"
      :show-tooltip="false"
      :show-point-on-hover="true"
      :vis-height="100"
      :show-zoom-out="false"
      :x-guides="xGuides"
      class="temperature-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as OPTIONS from '@/constants/v2/chart-options.js'
import DateDisplay from '@/services/DateDisplay.js'
import TemperatureChartOptions from '@/components/Energy/Charts/TemperatureChartOptions'
import LineVis from '@/components/Vis/Line.vue'
import {
  TEMPERATURE,
  TEMPERATURE_MIN,
  TEMPERATURE_MEAN,
  TEMPERATURE_MAX
} from '@/constants/v2/data-types.js'

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
    TemperatureChartOptions,
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
      options,
      lineColour: '#e34a33'
    }
  },

  computed: {
    ...mapGetters({
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      xGuides: 'visInteract/xGuides',
      chartPrice: 'chartOptionsPrice/chartShown',
      chartShown: 'chartOptionsTemperature/chartShown',
      chartType: 'chartOptionsTemperature/chartType',
      chartCurve: 'chartOptionsTemperature/chartCurve',

      range: 'range',
      interval: 'interval',
      currentDataset: 'regionEnergy/currentDataset',
      domainTemperature: 'regionEnergy/domainTemperature',
      summary: 'regionEnergy/summary'
    }),
    temperatureDomains() {
      return this.domainTemperature
    },
    temperatureDataset() {
      return this.currentDataset
    },
    temperatureMeanDomain() {
      const find = this.temperatureDomains.find(
        t => t.type === TEMPERATURE || t.type === TEMPERATURE_MEAN
      )
      return find ? find.domain : ''
    },
    temperatureMinDomain() {
      const find = this.temperatureDomains.find(t => t.type === TEMPERATURE_MIN)
      return find ? find.domain : ''
    },
    temperatureMaxDomain() {
      const find = this.temperatureDomains.find(t => t.type === TEMPERATURE_MAX)
      return find ? find.domain : ''
    },
    averageTemperature() {
      return this.summary ? this.summary._averageTemperature : 0
    },
    hoverData() {
      if (!this.hoverDate) {
        return null
      }
      const time = this.hoverDate.getTime()
      return this.currentDataset.find(d => d.time === time)
    },
    hoverMeanTemperature() {
      return this.hoverData ? this.hoverData[this.temperatureMeanDomain] : 0
    },
    hoverMinTemperature() {
      return this.hoverData ? this.hoverData[this.temperatureMinDomain] : 0
    },
    hoverMaxTemperature() {
      return this.hoverData ? this.hoverData[this.temperatureMaxDomain] : 0
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
    }
  }
}
</script>
