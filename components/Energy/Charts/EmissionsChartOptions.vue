<template>
  <chart-header>
    <template v-slot:options>
      <chart-options 
        :show="chartEnergyOptions" 
        @show-change="s => chartEnergyOptions = s" />
    </template>

    <template v-slot:label-unit>
      <strong>Emissions Volume</strong>
      <small>{{ emissionsVolumeUnit }}/{{ interval | intervalLabel }}</small>
    </template>
    <template v-slot:average-value>
      Av.
      <strong>
        {{ averageEmissionsVolume | formatValue }}
        {{ emissionsVolumeUnit }}/{{ interval | intervalLabel }}
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
        <strong>{{ hoverValue | formatValue2 }} {{ emissionsVolumeUnit }}</strong>
      </span>
      <span>
        Total
        <strong>{{ hoverTotal | formatValue2 }} {{ emissionsVolumeUnit }}</strong>
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
    averageEmissionsVolume: {
      type: Number,
      default: 0
    },
    emissionsVolumeUnit: {
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
