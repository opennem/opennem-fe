<template>
  <chart-header>
    <template v-slot:options>
      <chart-options 
        :show="chartEnergyOptions" 
        @show-change="s => chartEnergyOptions = s" />
    </template>

    <template v-slot:label-unit>
      <strong v-if="isEnergyType">Energy</strong>
      <strong v-else>Generation</strong>

      <small v-if="isTypeProportion || (isTypeLine && isYAxisPercentage)">%</small>
      <small v-else-if="isEnergyType">{{ isYearInterval ? 'TWh' : 'GWh' }}/{{ interval | intervalLabel }}</small>
      <small v-else>MW</small>
    </template>

    <template 
      v-slot:average-value 
      v-if="!isRenewableLineOnly && !isTypeProportion">
      Av.
      <strong>
        {{ averageEnergy | formatValue }}
        <span v-if="isEnergyType">{{ isYearInterval ? 'TWh' : 'GWh' }}/{{ interval | intervalLabel }}</span>
        <span v-else>MW</span>
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
        <strong>
          {{ hoverValue | formatValue }}<span v-if="isTypeProportion || (isTypeLine && isYAxisPercentage)">%</span>
          <span v-else-if="isEnergyType">{{ isYearInterval ? ' TWh' : ' GWh' }}</span>
          <span v-else> MW</span>
        </strong>
      </span>

      <span
        v-if="isRenewableLineOnly"
        class="renewables-value">
        <strong>{{ hoverRenewables | percentageFormatNumber }}</strong>
      </span>
      <span
        v-else-if="!isTypeProportion"
        class="total-value">
        Total
        <strong>
          {{ hoverTotal | formatValue }}
          <span v-if="isEnergyType">{{ isYearInterval ? 'TWh' : 'GWh' }}</span>
          <span v-else>MW</span>
        </strong>
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
    interval: {
      type: String,
      default: ''
    },
    isEnergyType: {
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
    isYAxisPercentage: {
      type: Boolean,
      default: false
    },
    isYearInterval: {
      type: Boolean,
      default: false
    },
    isRenewableLineOnly: {
      type: Boolean,
      default: false
    },
    averageEnergy: {
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
    hoverDomainColour: {
      type: String,
      default: ''
    },
    hoverDomainLabel: {
      type: String,
      default: ''
    },
    hoverRenewables: {
      type: Number,
      default: 0
    },
    hoverTotal: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      chartEnergyOptions: false
    }
  },
  computed: {}
}
</script>
