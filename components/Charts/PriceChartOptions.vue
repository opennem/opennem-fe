<template>
  <chart-header :chart-shown="chartShown">
    <template
      v-slot:options
      v-if="!readOnly">
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
      <strong>Price</strong>
      <small>$/MWh</small>
    </template>

    <template
      v-slot:average-value
      v-if="!readOnly">
      Av.
      <strong>
        {{ totalAverageValue | formatCurrency }}
      </strong>
    </template>

    <template v-slot:hover-date>
      {{ hoverDisplayDate }}
    </template>

    <template v-slot:hover-values>
      <span class="ft-value">
        <strong>{{ hoverValue | formatCurrency }}</strong>
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
    totalAverageValue: {
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
    }
  },
  data() {
    return {
      showChartOptions: false
    }
  },
  methods: {
    handleTypeClick(type) {
      this.$store.commit('chartOptionsPrice/chartType', type)
    },
    handleCurveClick(curve) {
      this.$store.commit('chartOptionsPrice/chartCurve', curve)
    }
  }
}
</script>
