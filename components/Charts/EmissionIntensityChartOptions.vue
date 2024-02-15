<template>
  <chart-header 
    :chart-shown="chartShown" 
    :has-hover-date="hoverDisplayDate.length > 0">
    <template 
      v-slot:options 
      v-if="!readOnly">
      <chart-options
        :options="options"
        :si="options.si"
        :chart-type="chartType"
        :chart-curve="chartCurve"
        :chart-shown="chartShown"
        :show="showChartOptions"
        :show-date-axis="showDateAxis"
        @show-change="(s) => (showChartOptions = s)"
        @type-click="handleTypeClick"
        @curve-click="handleCurveClick"
        @date-axis="(visible) => $emit('date-axis', visible)"
      />
    </template>

    <template v-slot:label-unit>
      <strong>Emission Intensity</strong>
      <div 
        v-show="chartShown" 
        style="display: flex; gap: 5px; align-items: center;">
        <small v-if="is12MthRollingSum">(12-month rolling)</small>
        <small>kgCO₂e/MWh</small>
      </div>
    </template>
    <template 
      v-slot:average-value 
      v-if="!readOnly">
      Av.
      <strong> {{ averageEmissionIntensity | formatValue }} kgCO₂e/MWh </strong>
    </template>
    <template v-slot:hover-date>
      {{ hoverDisplayDate }}
    </template>
    <template v-slot:hover-values>
      <span v-if="hoverValue">
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
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    showDateAxis: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      showChartOptions: false
    }
  },
  computed: {
    ...mapGetters({
      is12MthRollingSum: 'is12MthRollingSum'
    })
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
