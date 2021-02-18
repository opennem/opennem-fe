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
        :show="chartOptions"
        @show-change="s => chartOptions = s"
        @type-click="handleTypeClick"
        @curve-click="handleCurveClick"/>
    </template>

    <template v-slot:label-unit>
      <strong>Market Turnover</strong>
      <small>$</small>
    </template>

    <!-- <template
      v-slot:average-value
      v-if="!readOnly">
      Av.
      <strong>
        {{ averageMarketValue | formatCurrency }}
      </strong>
    </template> -->

    <template v-slot:hover-date>
      {{ hoverDisplayDate }}
    </template>

    <template v-slot:hover-values>
      <span
        v-if="hoverValue && showHover"
        class="ft-value">
        <em
          :style="{ 'background-color': hoverDomainColour }"
          class="colour-square" />
        {{ hoverDomainLabel }}
        <strong>{{ hoverValue | formatCurrency }}</strong>
      </span>

      <span>
        <span v-if="showHover">Total</span>
        <strong>{{ hoverTotal | formatCurrency }}</strong>
      </span>
    </template>
  </chart-header>
</template>

<script>
import { mapGetters } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import ChartHeader from '@/components/Vis/ChartHeader'
import ChartOptions from '@/components/Vis/ChartOptions'
import * as OPTIONS from '@/constants/chart-options.js'

const options = {
  type: [OPTIONS.CHART_HIDDEN, OPTIONS.CHART_STACKED],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: []
}

export default {
  components: {
    ChartHeader,
    ChartOptions
  },
  props: {
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
    hoverDisplayDate: {
      type: String,
      default: ''
    },
    hoverValue: {
      type: Number,
      default: 0
    },
    hoverTotal: {
      type: Number,
      default: 0
    },
    hoverDomainColour: {
      type: String,
      default: ''
    },
    hoverDomainLabel: {
      type: String,
      default: ''
    },
    averageMarketValue: {
      type: Number,
      default: 0
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    showHover: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      chartOptions: false,
      options: _cloneDeep(options)
    }
  },

  methods: {
    handleTypeClick(type) {
      this.$store.commit('chartOptionsMarketValue/chartType', type)
    },
    handleCurveClick(curve) {
      this.$store.commit('chartOptionsMarketValue/chartCurve', curve)
    }
  }
}
</script>
