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
      <strong>Emission Intensity</strong>
      <small>kgCO₂e/MWh</small>
    </template>
    <template v-slot:average-value>
      Av.
      <strong>
        {{ averageEmissionIntensity | formatValue }} kgCO₂e/MWh
      </strong>
    </template>
    <template v-slot:hover-date>
      {{ hoverDisplayDate }}
    </template>
    <template v-slot:hover-values>
      <span
        v-if="hoverValue"
        class="ft-value">
        <strong>{{ hoverValue | formatValue }} kgCO₂e/MWh</strong>
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
    averageEmissionIntensity: {
      type: Number,
      default: 0
    },
    hoverDisplayDate: {
      type: String,
      default: ''
    },
    hoverValue: {
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
      this.$store.commit('chartOptionsEmissionIntensity/chartType', type)
    },
    handleCurveClick(curve) {
      this.$store.commit('chartOptionsEmissionIntensity/chartCurve', curve)
    }
  }
}
</script>
