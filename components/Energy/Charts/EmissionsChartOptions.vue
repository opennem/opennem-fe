<template>
  <chart-header>
    <template 
      v-slot:options 
      v-if="!readOnly">
      <chart-options 
        :options="options"
        :chart-type="chartType"
        :chart-curve="chartCurve"
        :chart-shown="chartShown"
        :chart-unit="chartUnit"
        :chart-display-prefix="chartDisplayPrefix"
        :show="chartOptions" 
        @show-change="s => chartOptions = s"
        @type-click="handleTypeClick"
        @curve-click="handleCurveClick"
        @prefix-click="handlePrefixClick"/>
    </template>

    <template v-slot:label-unit>
      <strong>Emissions Volume</strong>
      <small 
        class="display-unit" 
        @click.stop="handleUnitClick">{{ displayUnit }}/{{ interval | intervalLabel }}</small>
    </template>
    <template 
      v-slot:average-value 
      v-if="!readOnly">
      Av.
      <strong>
        {{ averageEmissionsVolume | formatValue }}
        {{ displayUnit }}/{{ interval | intervalLabel }}
      </strong>
    </template>
    <template v-slot:hover-date>
      {{ hoverDisplayDate }}
    </template>
    <template v-slot:hover-values>
      <span
        v-if="hoverValue"
        class="ft-value">
        <em
          :style="{ 'background-color': hoverDomainColour }"
          class="colour-square" />
        {{ hoverDomainLabel }}
        <strong>{{ hoverValue | formatValue2 }} {{ displayUnit }}</strong>
      </span>
      <span>
        Total
        <strong>{{ hoverTotal | formatValue2 }} {{ displayUnit }}</strong>
      </span>
    </template>
  </chart-header>
</template>

<script>
import { mapGetters } from 'vuex'
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
  si: [SI.BASE, SI.KILO]
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
    chartUnit: {
      type: String,
      default: ''
    },
    chartDisplayPrefix: {
      type: String,
      default: ''
    },
    interval: {
      type: String,
      default: ''
    },
    averageEmissionsVolume: {
      type: Number,
      default: 0
    },
    displayUnit: {
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
    hoverDomainColour: {
      type: String,
      default: ''
    },
    hoverDomainLabel: {
      type: String,
      default: ''
    },
    hoverTotal: {
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
      chartOptions: false,
      options
    }
  },
  methods: {
    handleTypeClick(type) {
      this.$store.commit('chartOptionsEmissionsVolume/chartType', type)
    },
    handleCurveClick(curve) {
      this.$store.commit('chartOptionsEmissionsVolume/chartCurve', curve)
    },
    handlePrefixClick(prefix) {
      this.$store.commit(
        'chartOptionsEmissionsVolume/chartDisplayPrefix',
        prefix
      )
    },

    togglePrefix(prefix) {
      return options.si.find(p => p !== prefix)
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
