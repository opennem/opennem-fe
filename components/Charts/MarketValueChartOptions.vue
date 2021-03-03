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
        :chart-display-prefix="chartDisplayPrefix"
        :unit-prefix="'$'"
        @show-change="s => chartOptions = s"
        @type-click="handleTypeClick"
        @prefix-click="handlePrefixClick"
        @curve-click="handleCurveClick"/>
    </template>

    <template v-slot:label-unit>
      <strong>Market Turnover</strong>
      <small
        class="display-unit"
        @click.stop="handleUnitClick">${{ displayUnit }}</small>
    </template>

    <template
      v-slot:average-value
      v-if="!readOnly || !hoverValue">
      Total
      <strong>
        {{ total | formatCurrency(',.0f') }}{{ displayUnit }}
      </strong>
    </template>

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
        <strong>{{ hoverValue | formatCurrency(',.0f') }}{{ displayUnit }}</strong>
      </span>

      <span>
        <span v-if="showHover">Total</span>
        <strong>{{ hoverTotal | formatCurrency(',.0f') }}{{ displayUnit }}</strong>
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
import * as SI from '@/constants/si'

const options = {
  type: [OPTIONS.CHART_HIDDEN, OPTIONS.CHART_STACKED],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: [],
  si: [SI.BASE, SI.THOUSAND, SI.MILLION]
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
    chartDisplayPrefix: {
      type: String,
      default: ''
    },
    displayUnit: {
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
    },
    total: {
      type: Number,
      default: 0
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
    },
    handlePrefixClick(prefix) {
      this.$store.commit('chartOptionsMarketValue/chartDisplayPrefix', prefix)
    },

    togglePrefix(prefix) {
      const length = this.options.si.length
      const index = this.options.si.findIndex(p => p === prefix)
      let nextIndex = index + 1

      if (nextIndex === length) {
        nextIndex = 0
      }

      return this.options.si[nextIndex]
    },
    handleUnitClick() {
      const updatedPrefix = this.togglePrefix(this.chartDisplayPrefix)
      this.handlePrefixClick(updatedPrefix)
    }
  }
}
</script>

<style lang="scss" scoped>
.display-unit {
  cursor: pointer;
  padding: 2px 4px 1px;
  border-radius: 4px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }
}
</style>
