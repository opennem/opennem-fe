<template>
  <section>
    <table class="table is-fullwidth">
      <caption>Records</caption>
      <thead>
        <tr>
          <th />
          <th class="has-text-right">Min.</th>
          <th class="has-text-right">Max.</th>
        </tr>
      </thead>
      <tbody>

        <energy-record
          :row-label="'Demand'"
          :row-unit="` ${chartCurrentUnit}`"
          :min-date="minDemandDate"
          :min-value="convertValue(minDemand)"
          :max-date="maxDemandDate"
          :max-value="convertValue(maxDemand)"
          :range="range"
          :interval="interval"
          :record-select-date="recordSelectDate"
          @recordSelect="handleRecordSelect"
          @recordDeselect="handleRecordDeselect"
          @recordMouseEnter="handleRecordEnter"
          @recordMouseLeave="handleRecordLeave" />

        <energy-record
          :row-label="'Renewables'"
          :row-unit="'%'"
          :min-date="minDemandRenewablesDate"
          :min-value="minDemandRenewables"
          :max-date="maxDemandRenewablesDate"
          :max-value="maxDemandRenewables"
          :range="range"
          :interval="interval"
          :divider="true"
          :record-select-date="recordSelectDate"
          @recordSelect="handleRecordSelect"
          @recordDeselect="handleRecordDeselect"
          @recordMouseEnter="handleRecordEnter"
          @recordMouseLeave="handleRecordLeave" />
        
        <energy-record
          :row-label="'Generation'"
          :row-unit="` ${chartCurrentUnit}`"
          :min-date="minGenerationDate"
          :min-value="convertValue(minGeneration)"
          :max-date="maxGenerationDate"
          :max-value="convertValue(maxGeneration)"
          :range="range"
          :interval="interval"
          :record-select-date="recordSelectDate"
          @recordSelect="handleRecordSelect"
          @recordDeselect="handleRecordDeselect"
          @recordMouseEnter="handleRecordEnter"
          @recordMouseLeave="handleRecordLeave" />
        
        <energy-record
          :row-label="'Renewables'"
          :row-unit="'%'"
          :min-date="minGenerationRenewablesDate"
          :min-value="minGenerationRenewables"
          :max-date="maxGenerationRenewablesDate"
          :max-value="maxGenerationRenewables"
          :range="range"
          :interval="interval"
          :divider="true"
          :record-select-date="recordSelectDate"
          @recordSelect="handleRecordSelect"
          @recordDeselect="handleRecordDeselect"
          @recordMouseEnter="handleRecordEnter"
          @recordMouseLeave="handleRecordLeave" />

        <energy-record
          v-if="priceId"
          :row-label="'Price'"
          :row-unit="'$/MWh'"
          :min-date="minPriceDate"
          :min-value="minPrice"
          :max-date="maxPriceDate"
          :max-value="maxPrice"
          :range="range"
          :interval="interval"
          :is-currency="true"
          :record-select-date="recordSelectDate"
          @recordSelect="handleRecordSelect"
          @recordDeselect="handleRecordDeselect"
          @recordMouseEnter="handleRecordEnter"
          @recordMouseLeave="handleRecordLeave" />

        <energy-record
          v-if="temperatureId"
          :row-label="'Temperature'"
          :row-unit="'°C'"
          :min-date="minTemperatureDate"
          :min-value="minTemperature"
          :max-date="maxTemperatureDate"
          :max-value="maxTemperature"
          :range="range"
          :interval="interval"
          :record-select-date="recordSelectDate"
          @recordSelect="handleRecordSelect"
          @recordDeselect="handleRecordDeselect"
          @recordMouseEnter="handleRecordEnter"
          @recordMouseLeave="handleRecordLeave" />

      </tbody>
    </table>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import * as SI from '@/constants/v2/si.js'
import EnergyRecord from '~/components/Energy/Record.vue'
export default {
  components: {
    EnergyRecord
  },

  props: {
    domains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    priceId: {
      type: String,
      default: () => null
    },
    temperatureId: {
      type: String,
      default: () => null
    },
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    },
    focusOn: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      recordSelectDate: null,

      minDemand: null,
      minDemandDate: null,
      maxDemand: null,
      maxDemandDate: null,
      minDemandRenewables: null,
      minDemandRenewablesDate: null,
      maxDemandRenewables: null,
      maxDemandRenewablesDate: null,

      minGeneration: null,
      minGenerationDate: null,
      maxGeneration: null,
      maxGenerationDate: null,
      minGenerationRenewables: null,
      minGenerationRenewablesDate: null,
      maxGenerationRenewables: null,
      maxGenerationRenewablesDate: null,

      minPrice: null,
      minPriceDate: null,
      maxPrice: null,
      maxPriceDate: null,

      minTemperature: null,
      minTemperatureDate: null,
      maxTemperature: null,
      maxTemperatureDate: null
    }
  },

  computed: {
    ...mapGetters({
      isEnergyType: 'regionEnergy/isEnergyType',

      chartEnergyUnitPrefix: 'chartOptionsPowerEnergy/chartEnergyUnitPrefix',
      chartEnergyDisplayPrefix:
        'chartOptionsPowerEnergy/chartEnergyDisplayPrefix',
      chartEnergyCurrentUnit: 'chartOptionsPowerEnergy/chartEnergyCurrentUnit',

      chartPowerUnitPrefix: 'chartOptionsPowerEnergy/chartPowerUnitPrefix',
      chartPowerDisplayPrefix:
        'chartOptionsPowerEnergy/chartPowerDisplayPrefix',
      chartPowerCurrentUnit: 'chartOptionsPowerEnergy/chartPowerCurrentUnit'
    }),
    chartCurrentUnit() {
      return this.isEnergyType
        ? this.chartEnergyCurrentUnit
        : this.chartPowerCurrentUnit
    },
    chartUnitPrefix() {
      return this.isEnergyType
        ? this.chartEnergyUnitPrefix
        : this.chartPowerUnitPrefix
    },
    chartDisplayPrefix() {
      return this.isEnergyType
        ? this.chartEnergyDisplayPrefix
        : this.chartPowerDisplayPrefix
    },

    energyUnit() {
      return this.$store.getters.chartUnit
    },
    isColumnVis() {
      return this.interval !== '5m' && this.interval !== '30m'
    }
  },

  watch: {
    dataset(d) {
      this.updateMinMax(d)
    },
    focusOn(d) {
      if (!d) {
        this.recordSelectDate = null
      }
    }
  },

  mounted() {
    this.updateMinMax(this.dataset)
  },

  methods: {
    convertValue(value) {
      return SI.convertValue(
        this.chartUnitPrefix,
        this.chartDisplayPrefix,
        value
      )
    },
    updateMinMax(dataset) {
      const updatedDataset = this.isColumnVis
        ? dataset.slice(0, dataset.length - 1)
        : dataset
      let minDemand = 0,
        minDemandDate = null,
        maxDemand = 0,
        maxDemandDate = null,
        minDemandRenewables = 0,
        minDemandRenewablesDate = null,
        maxDemandRenewables = 0,
        maxDemandRenewablesDate = null,
        minGeneration = 0,
        minGenerationDate = null,
        maxGeneration = 0,
        maxGenerationDate = null,
        minGenerationRenewables = 0,
        minGenerationRenewablesDate = null,
        maxGenerationRenewables = 0,
        maxGenerationRenewablesDate = null,
        minPrice = 0,
        minPriceDate = null,
        maxPrice = 0,
        maxPriceDate = null,
        minTemperature = 0,
        minTemperatureDate = null,
        maxTemperature = 0,
        maxTemperatureDate = null

      updatedDataset.every(d => {
        if (d._total) {
          maxDemand = d._total
          maxDemandDate = d.time
          minDemandRenewables = d._totalDemandRenewablesPercentage
          minDemandRenewablesDate = d.time
          maxDemandRenewables = d._totalDemandRenewablesPercentage
          maxDemandRenewablesDate = d.time

          maxGeneration = d._totalGeneration
          maxGenerationDate = d.time
          minGenerationRenewables = d._totalGenerationRenewables
          minGenerationRenewablesDate = d.time
          maxGenerationRenewables = d._totalGenerationRenewables
          maxGenerationRenewablesDate = d.time

          if (this.priceId) {
            minPrice = d[this.priceId]
            minPriceDate = d.time
            maxPrice = d[this.priceId]
            maxPriceDate = d.time
          }
          if (this.temperatureId) {
            maxTemperature = d[this.temperatureId]
            maxTemperatureDate = d.time
          }
          return false
        }
        return true
      })

      updatedDataset.forEach(d => {
        if (!minDemandDate && d._total !== null && d._total !== 0) {
          minDemand = d._total
          minDemandDate = d.time
        }
        if (d._total !== null && d._total < minDemand) {
          minDemand = d._total
          minDemandDate = d.time
        }
        if (d._total !== null && d._total > maxDemand) {
          maxDemand = d._total
          maxDemandDate = d.time
        }
        if (
          d._totalDemandRenewablesPercentage !== null &&
          d._totalDemandRenewablesPercentage < minDemandRenewables
        ) {
          minDemandRenewables = d._totalDemandRenewablesPercentage
          minDemandRenewablesDate = d.time
        }
        if (
          d._totalDemandRenewablesPercentage !== null &&
          d._totalDemandRenewablesPercentage > maxDemandRenewables
        ) {
          maxDemandRenewables = d._totalDemandRenewablesPercentage
          maxDemandRenewablesDate = d.time
        }

        if (
          !minGenerationDate &&
          d._totalGeneration !== null &&
          d._totalGeneration !== 0
        ) {
          minGeneration = d._totalGeneration
          minGenerationDate = d.time
        }
        if (
          d._totalGeneration !== null &&
          d._totalGeneration !== 0 &&
          d._totalGeneration < minGeneration
        ) {
          minGeneration = d._totalGeneration
          minGenerationDate = d.time
        }
        if (d._totalGeneration !== null && d._totalGeneration > maxGeneration) {
          maxGeneration = d._totalGeneration
          maxGenerationDate = d.time
        }

        if (
          d._totalGenerationRenewables !== null &&
          d._totalGenerationRenewables < minGenerationRenewables
        ) {
          minGenerationRenewables = d._totalGenerationRenewables
          minGenerationRenewablesDate = d.time
        }
        if (
          d._totalGenerationRenewables !== null &&
          d._totalGenerationRenewables > maxGenerationRenewables
        ) {
          maxGenerationRenewables = d._totalGenerationRenewables
          maxGenerationRenewablesDate = d.time
        }

        if (
          this.priceId &&
          d[this.priceId] !== null &&
          d[this.priceId] < minPrice
        ) {
          minPrice = d[this.priceId]
          minPriceDate = d.time
        }
        if (
          this.priceId &&
          d[this.priceId] !== null &&
          d[this.priceId] > maxPrice
        ) {
          maxPrice = d[this.priceId]
          maxPriceDate = d.time
        }

        if (
          this.temperatureId &&
          !minTemperatureDate &&
          d[this.temperatureId] !== null
        ) {
          minTemperature = d[this.temperatureId]
          minTemperatureDate = d.time
        }

        if (
          this.temperatureId &&
          d[this.temperatureId] !== null &&
          d[this.temperatureId] < minTemperature
        ) {
          minTemperature = d[this.temperatureId]
          minTemperatureDate = d.time
        }
        if (
          this.temperatureId &&
          d[this.temperatureId] !== null &&
          d[this.temperatureId] > maxTemperature
        ) {
          maxTemperature = d[this.temperatureId]
          maxTemperatureDate = d.time
        }
      })

      this.minDemand = minDemand
      this.minDemandDate = minDemandDate
      this.maxDemand = maxDemand
      this.maxDemandDate = maxDemandDate
      this.minDemandRenewables = minDemandRenewables
      this.minDemandRenewablesDate = minDemandRenewablesDate
      this.maxDemandRenewables = maxDemandRenewables
      this.maxDemandRenewablesDate = maxDemandRenewablesDate

      this.minGeneration = minGeneration
      this.minGenerationDate = minGenerationDate
      this.maxGeneration = maxGeneration
      this.maxGenerationDate = maxGenerationDate
      this.minGenerationRenewables = minGenerationRenewables
      this.minGenerationRenewablesDate = minGenerationRenewablesDate
      this.maxGenerationRenewables = maxGenerationRenewables
      this.maxGenerationRenewablesDate = maxGenerationRenewablesDate

      this.minPrice = minPrice
      this.minPriceDate = minPriceDate
      this.maxPrice = maxPrice
      this.maxPriceDate = maxPriceDate

      this.minTemperature = minTemperature
      this.minTemperatureDate = minTemperatureDate
      this.maxTemperature = maxTemperature
      this.maxTemperatureDate = maxTemperatureDate
    },

    handleRecordEnter(date) {
      if (!this.focusOn) {
        this.$emit('recordMouseEnter', date)
      }
    },

    handleRecordLeave() {
      if (!this.focusOn) {
        this.$emit('recordMouseLeave')
      }
    },

    handleRecordSelect(date) {
      this.recordSelectDate = date
      this.$emit('recordSelect', date)
    },

    handleRecordDeselect() {
      this.recordSelectDate = null
      this.$emit('recordDeselect')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.table {
  background-color: transparent;
  font-size: 0.8em;

  caption {
    border-bottom: 1px solid #333;
    text-align: left;
    font-family: $header-font-family;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 1.2em;
  }
}
</style>
