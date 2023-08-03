<template>
  <div
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartShown,
      adjustment: chartPrice
    }"
    class="temperature-chart chart"
  >
    <temperature-chart-options
      :read-only="readOnly"
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
      :show-zoom-out="showDateAxis"
      :x-guides="xGuides"
      :y-axis-ticks="3"
      :filter-period="filterPeriod"
      class="temperature-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
    <date-brush
      v-if="showDateAxis && chartShown"
      :dataset="temperatureDataset"
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as OPTIONS from '@/constants/chart-options.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'
import DateDisplay from '@/services/DateDisplay.js'
import TemperatureChartOptions from '@/components/Energy/Charts/TemperatureChartOptions'
import LineVis from '@/components/Vis/Line.vue'
import DateBrush from '@/components/Vis/DateBrush'

import {
  TEMPERATURE,
  TEMPERATURE_MIN,
  TEMPERATURE_MEAN,
  TEMPERATURE_MAX
} from '@/constants/data-types.js'

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
    LineVis,
    DateBrush
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
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    filterPeriod: {
      type: String,
      default: ''
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
      xTicks: 'visInteract/xTicks',
      visTickFormat: 'visInteract/tickFormat',
      visSecondTickFormat: 'visInteract/secondTickFormat',

      chartPrice: 'chartOptionsPrice/chartShown',
      chartShown: 'chartOptionsTemperature/chartShown',
      chartType: 'chartOptionsTemperature/chartType',
      chartCurve: 'chartOptionsTemperature/chartCurve',

      range: 'range',
      interval: 'interval',
      currentDataset: 'regionEnergy/currentDataset',
      domainTemperature: 'regionEnergy/domainTemperature',
      summary: 'regionEnergy/summary',
      isEnergyType: 'regionEnergy/isEnergyType'
    }),

    showDateAxis: {
      get() {
        return this.$store.getters['chartOptionsTemperature/chartDateAxis']
      },
      set(value) {
        this.$store.commit('chartOptionsTemperature/chartDateAxis', value)
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

    temperatureDomains() {
      return this.domainTemperature
    },
    temperatureDataset() {
      return this.currentDataset
    },
    temperatureMeanDomain() {
      const find = this.temperatureDomains.find(
        (t) => t.type === TEMPERATURE || t.type === TEMPERATURE_MEAN
      )
      return find ? find.domain : ''
    },
    temperatureMinDomain() {
      const find = this.temperatureDomains.find(
        (t) => t.type === TEMPERATURE_MIN
      )
      return find ? find.domain : ''
    },
    temperatureMaxDomain() {
      const find = this.temperatureDomains.find(
        (t) => t.type === TEMPERATURE_MAX
      )
      return find ? find.domain : ''
    },
    averageTemperature() {
      return this.summary ? this.summary._averageTemperature : 0
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
      return this.currentDataset.find((d) => d.time === time)
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
</style>
