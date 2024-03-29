<template>
  <chart-header 
    :chart-shown="chartShown" 
    :has-hover-date="!!hoverDisplayDate"
    :has-hover-value="!!(hoverValue === 0 || hoverValue)">
    <template 
      v-slot:options 
      v-if="!readOnly">
      <chart-options
        :options="options"
        :si="options.si"
        :chart-type="chartType"
        :chart-curve="chartCurve"
        :chart-shown="chartShown"
        :chart-unit="chartUnit"
        :chart-y-axis="chartYAxis"
        :chart-display-prefix="chartDisplayPrefix"
        :show="chartOptions"
        :show-date-axis="showDateAxis"
        @show-change="(s) => (chartOptions = s)"
        @type-click="handleTypeClick"
        @curve-click="handleCurveClick"
        @prefix-click="handlePrefixClick"
        @y-axis-click="handleYAxisClick"
        @date-axis="(visible) => $emit('date-axis', visible)"
      />
    </template>

    <template v-slot:label-unit>
      <strong>{{ chartTitle }}</strong>
      <small v-if="chartShown"> {{ displayUnit }}</small>
    </template>
    <!-- <template
      v-slot:average-value
      v-if="!readOnly && !isPercentage && showAverageValue"
    >
      Av.
      <strong>
        {{ averageValue | formatValue }}
        {{ displayUnit }}/{{ interval | intervalLabel }}
      </strong>
    </template> -->
    <template v-slot:hover-date>
      {{ hoverDisplayDate }}
    </template>
    <template v-slot:hover-values>
      <span 
        v-if="hoverValue" 
        class="ft-value">
        <em
          :style="{ 'background-color': hoverDomainColour }"
          class="colour-square"
        />
        {{ hoverDomainLabel }}
        <strong v-if="!showConvertValue">{{ hoverValue }}</strong>
        <strong v-else-if="isPercentage">{{ hoverValue | formatValue2 }}%</strong>
        <strong 
          v-else
        >{{ hoverValue | formatValue2 }} {{ displayUnit }}</strong
        >
      </span>
      <!-- <span v-if="!isPercentage">
        Total
        <strong>{{ hoverTotal | formatValue2 }} {{ displayUnit }}</strong>
      </span> -->
    </template>
  </chart-header>
</template>

<script>
import _cloneDeep from 'lodash.clonedeep'
import ChartHeader from '@/components/Vis/ChartHeader'
import ChartOptions from '@/components/Vis/ChartOptions'
import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si'

const emissionsSI = [SI.BASE, SI.KILO, SI.MEGA]
const emissionsYAxis = [
  OPTIONS.CHART_YAXIS_EMISSIONS_VOL,
  OPTIONS.CHART_YAXIS_PERCENTAGE
]

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
    chartYAxis: {
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
    averageValue: {
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
      type: Number | String,
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
    isTypeProportion: {
      type: Boolean,
      default: false
    },
    isTypeLine: {
      type: Boolean,
      default: false
    },
    isTypeArea: {
      type: Boolean,
      default: false
    },
    isTypeChangeSinceLine: {
      type: Boolean,
      default: false
    },
    showAverageValue: {
      type: Boolean,
      default: true
    },
    defaultOptionsObj: {
      type: Object,
      default: () => {}
    },
    showConvertValue: {
      type: Boolean,
      default: true
    },
    showDateAxis: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      chartOptions: false
    }
  },
  computed: {
    options() {
      let options = _cloneDeep(this.defaultOptionsObj)
      
      return options
    },

    isPercentage() {
      return (
        this.isTypeProportion ||
        ((this.isTypeLine || this.isTypeChangeSinceLine) &&
          this.chartYAxis === OPTIONS.CHART_YAXIS_PERCENTAGE)
      )
    }
  },

  methods: {
    handleTypeClick(type) {
      this.$store.commit('chartOptions/chartType', type)
      this.$emit('type-click', type)
    },
    handleCurveClick(curve) {
      this.$store.commit('chartOptions/chartCurve', curve)
    },
    handlePrefixClick(prefix) {
      if (prefix !== null) {
        this.$store.commit(
          'chartOptions/chartDisplayPrefix',
          prefix
        )
      }
    },
    handleYAxisClick(yAxis) {
      this.$store.commit('chartOptions/chartYAxis', yAxis)
    },

    togglePrefix(prefix) {
      if (this.options.si) {
        const length = this.options.si.length
        const index = this.options.si.findIndex((p) => p === prefix)
        let nextIndex = index + 1

        if (nextIndex === length) {
          nextIndex = 0
        }

        return this.options.si[nextIndex]
      }

      return null
    },

    handleUnitClick() {
      if (
        this.isTypeArea ||
        ((this.isTypeLine || this.isTypeChangeSinceLine) && !this.isPercentage)
      ) {
        const updatedPrefix = this.togglePrefix(this.chartDisplayPrefix)
        this.handlePrefixClick(updatedPrefix)
      }
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
