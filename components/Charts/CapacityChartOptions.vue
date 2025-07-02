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
      <strong v-show="!chartShown">Capacity</strong>
      <div v-show="chartShown">
        <strong>Capacity</strong>
        <small v-if="is12MthRollingSum">12-month rolling</small>
        <small v-if="isPercentage"> {{ displayUnit }}</small>
        <small
          v-if="!isPercentage"
          class="display-unit"
          @click.stop="handleUnitClick"
        >
          {{ displayUnit }} at end of {{ interval | intervalLabel }}
        </small>
        <small v-if="isTypeChangeSinceLine">change since {{ changeSinceLabel }}</small>
        <small v-if="isTypeGrowthStackedArea">growth {{ growthLabel }}</small>
      </div>
    </template>

    <template
      v-slot:average-value
      v-if="!readOnly && !isPercentage && showAverageValue"
    >
      <!-- Av.
      <strong>
        {{ averageCapacity | formatValue }}
        {{ displayUnit }}/{{ interval | intervalLabel }}
      </strong> -->
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
          class="colour-square"
        />
        {{ hoverDomainLabel }}
        <strong v-if="isPercentage">{{ hoverValue | formatValue2 }}%</strong>
        <strong 
          v-else
        >{{ hoverValue | formatCapacityValue(chartDisplayPrefix) }} {{ displayUnit }}</strong
        >
      </span>
      <span v-if="!isPercentage">
        Total
        <strong>{{ hoverTotal | formatCapacityValue(chartDisplayPrefix) }} {{ displayUnit }}</strong>
      </span>
    </template>
  </chart-header>
</template>

<script>
import {mapGetters} from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import EventBus from '@/plugins/eventBus'
import ChartHeader from '@/components/Vis/ChartHeader'
import ChartOptions from '@/components/Vis/ChartOptions'
import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si'

const capacitySI = [SI.MEGA, SI.GIGA]
const capacityYAxis = [
  OPTIONS.CHART_YAXIS_ABSOLUTE,
  OPTIONS.CHART_YAXIS_PERCENTAGE
]

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
    averageCapacity: {
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
    isTypeGrowthStackedArea: {
      type: Boolean,
      default: false
    },
    showAverageValue: {
      type: Boolean,
      default: true
    },
    capacityOptions : {
      type: Object,
      default: () => {}
    },
    showDateAxis: {
      type: Boolean,
      default: () => false
    },
    changeSinceLabel: {
      type: String,
      default: ''
    },
    growthLabel: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      chartOptions: false
    }
  },
  computed: {
    ...mapGetters({
      is12MthRollingSum: 'is12MthRollingSum'
    }),

    options() {
      let options = _cloneDeep(this.capacityOptions )
      if (this.isTypeArea) {
        options.si = capacitySI
      }
      if (this.isTypeLine || this.isTypeChangeSinceLine) {
        options.yAxis = capacityYAxis
      }
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

  created() {
    EventBus.$on('capacity.chart.unit-toggle', this.handleUnitClick)
  },
  beforeDestroy() {
    EventBus.$off('capacity.chart.unit-toggle')
  },
  methods: {
    handleTypeClick(type) {
      this.$store.commit('chartOptionsCapacity/chartType', type)
      this.$emit('type-click', type)
    },
    handleCurveClick(curve) {
      this.$store.commit('chartOptionsCapacity/chartCurve', curve)
    },
    handlePrefixClick(prefix) {
      if (prefix !== null) {
        this.$store.commit(
          'chartOptionsCapacity/chartDisplayPrefix',
          prefix
        )
      }
    },
    handleYAxisClick(yAxis) {
      this.$store.commit('chartOptionsCapacity/chartYAxis', yAxis)
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
        this.isTypeArea || this.isTypeGrowthStackedArea ||
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

  &:hover {
    text-decoration: underline;
    color: black;
  }
}
</style>
