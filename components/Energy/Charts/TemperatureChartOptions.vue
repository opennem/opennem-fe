<template>
  <chart-header>
    <template v-slot:options>
      <chart-options 
        :options="options"
        :chart-type="chartType"
        :chart-curve="chartCurve"
        :chart-shown="chartShown"
        :show="showChartOptions" 
        @show-change="s => showChartOptions = s"
        @type-click="handleTypeClick"
        @curve-click="handleCurveClick"/>
    </template>

    <template v-slot:label-unit>
      <strong>Temperature</strong>
      <small>°C</small>
    </template>
    <template v-slot:average-value>
      Av.
      <strong>
        {{ averageTemperature | formatValue }}°C
      </strong>
    </template>
    <template v-slot:hover-date>
      {{ hoverDisplayDate }}
    </template>
    <template v-slot:hover-values>
      <span
        v-if="hoverMinTemperature">
        Min
        <strong>{{ hoverMinTemperature | formatValue }}°C</strong>
      </span>
      <span class="mean-temp-value">
        Av
        <strong>{{ hoverMeanTemperature | formatValue }}°C</strong>
      </span>
      <span
        v-if="hoverMaxTemperature">
        Max
        <strong>{{ hoverMaxTemperature | formatValue }}°C</strong>
      </span>
    </template>
  </chart-header>
</template>

<script>
import { mapGetters } from 'vuex'
import ChartHeader from '@/components/Vis/ChartHeader'
import ChartOptions from '@/components/Vis/ChartOptions'

export default {
  components: {
    ChartHeader,
    ChartOptions
  },
  props: {
    options: {
      type: Object,
      default: () => {
        return {
          type: [],
          curve: [],
          yAxis: []
        }
      }
    },
    chartShown: {
      type: Boolean,
      default: false
    },
    chartType: {
      type: String,
      default: ''
    },
    chartCurve: {
      type: String,
      default: ''
    },
    interval: {
      type: String,
      default: ''
    },
    averageTemperature: {
      type: Number,
      default: 0
    },
    hoverDisplayDate: {
      type: String,
      default: ''
    },
    hoverMinTemperature: {
      type: Number,
      default: 0
    },
    hoverMeanTemperature: {
      type: Number,
      default: 0
    },
    hoverMaxTemperature: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      showChartOptions: false
    }
  },
  methods: {
    handleTypeClick(type) {
      this.$store.commit('chartOptionsTemperature/chartType', type)
    },
    handleCurveClick(curve) {
      this.$store.commit('chartOptionsTemperature/chartCurve', curve)
    }
  }
}
</script>
