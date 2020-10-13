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
        :chart-y-axis="chartYAxis"
        :show="chartOptions" 
        @show-change="s => chartOptions = s"
        @type-click="handleTypeClick"
        @curve-click="handleCurveClick"
        @y-axis-click="handleYAxisClick"/>
    </template>

    <template v-slot:label-unit>
      <strong class="is-capitalized">{{ chartTitle }}</strong>
      <small>{{ displayUnit }}</small>
    </template>
    <template v-slot:average-value>
      Av.
      <strong>
        {{ averageValue | formatValue }}
        <span>{{ displayUnit }}</span>
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
        <strong>{{ hoverValue | formatValue2 }} {{ displayUnit }}</strong>
      </span>
      <span>
        <span v-if="showHover">Total</span>
        <strong>{{ hoverTotal | formatValue }} {{ displayUnit }}</strong>
      </span>
    </template>
  </chart-header>
</template>

<script>
import ChartHeader from '@/components/Vis/ChartHeader'
import ChartOptions from '@/components/Vis/ChartOptions'

export default {
  components: {
    ChartHeader,
    ChartOptions
  },
  props: {
    chartTitle: {
      type: String,
      default: ''
    },
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
    chartYAxis: {
      type: String,
      default: ''
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
    },
    showHover: {
      type: Boolean,
      default: true
    },
    isEnergyType: {
      type: Boolean,
      default: false
    },
    averageValue: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      chartOptions: false
    }
  },
  methods: {
    handleTypeClick(type) {
      this.$store.commit('chartOptionsPowerEnergy/chartType', type)
    },
    handleCurveClick(curve) {
      if (this.isEnergyType) {
        this.$store.commit('chartOptionsPowerEnergy/chartEnergyCurve', curve)
      } else {
        this.$store.commit('chartOptionsPowerEnergy/chartPowerCurve', curve)
      }
    },
    handleYAxisClick(yAxis) {
      this.$store.commit('chartOptionsPowerEnergy/chartEnergyYAxis', yAxis)
    }
  }
}
</script>
