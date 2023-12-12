<template>
  <section>
    <header>
      <h5>Stats</h5>

      <div>
        <span>
          <time>
            {{
              startDate | customFormatDate({ range, interval, isStart: true })
            }}
          </time>
          –
          <time>
            {{
              endDate
                | customFormatDate({
                  range,
                  interval,
                  showYear: true,
                  isEnd: true
                })
            }}
          </time>
        </span>
        <small>
          {{ timezoneString }}
        </small>
      </div>
    </header>
    <table class="table is-fullwidth">
      <thead>
        <tr>
          <th />
          <th class="has-text-right">Min.</th>
          <th class="has-text-right">Max.</th>
        </tr>
      </thead>
      <tbody>
        <energy-record
          v-if="showSelectedRow"
          :row-label="'Selected'"
          :row-unit="` ${chartCurrentUnit}`"
          :min-date="minSelectedDate"
          :min-value="convertValue(minSelected)"
          :max-date="maxSelectedDate"
          :max-value="convertValue(maxSelected)"
          :range="range"
          :interval="interval"
          :record-select-date="recordSelectDate"
          :divider="true"
          @recordSelect="handleRecordSelect"
          @recordDeselect="handleRecordDeselect"
          @recordMouseEnter="handleRecordEnter"
          @recordMouseLeave="handleRecordLeave"
        />

        <energy-record
          v-if="isContributionDemand"
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
          @recordMouseLeave="handleRecordLeave"
        />

        <energy-record
          v-if="isContributionDemand"
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
          @recordMouseLeave="handleRecordLeave"
        />

        <energy-record
          v-if="isContributionGeneration"
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
          @recordMouseLeave="handleRecordLeave"
        />

        <energy-record
          v-if="isContributionGeneration"
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
          @recordMouseLeave="handleRecordLeave"
        />

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
          @recordMouseLeave="handleRecordLeave"
        />

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
          @recordMouseLeave="handleRecordLeave"
        />
      </tbody>
    </table>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'

import * as SI from '@/constants/si.js'
import EnergyRecord from '@/components/Energy/Records/Record.vue'

export default {
  components: {
    EnergyRecord
  },

  props: {
    selectedPowerEnergyDomains: {
      type: Array,
      default: () => []
    },
    powerEnergyDomains: {
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
      maxTemperatureDate: null,

      minSelectedDate: null,
      minSelected: null,
      maxSelectedDate: null,
      maxSelected: null
    }
  },

  computed: {
    ...mapGetters({
      isEnergyType: 'regionEnergy/isEnergyType',
      regionTimezoneString: 'regionEnergy/regionTimezoneString',

      chartEnergyUnitPrefix: 'chartOptionsPowerEnergy/chartEnergyUnitPrefix',
      chartEnergyDisplayPrefix:
        'chartOptionsPowerEnergy/chartEnergyDisplayPrefix',
      chartEnergyCurrentUnit: 'chartOptionsPowerEnergy/chartEnergyCurrentUnit',

      chartPowerUnitPrefix: 'chartOptionsPowerEnergy/chartPowerUnitPrefix',
      chartPowerDisplayPrefix:
        'chartOptionsPowerEnergy/chartPowerDisplayPrefix',
      chartPowerCurrentUnit: 'chartOptionsPowerEnergy/chartPowerCurrentUnit',

      isContributionDemand: 'isContributionDemand',
      isContributionGeneration: 'isContributionGeneration'
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

    timezoneString() {
      return this.isEnergyType ? '' : this.regionTimezoneString
    },

    showSelectedRow() {
      return (
        this.selectedPowerEnergyDomains.length !==
        this.powerEnergyDomains.length
      )
    },

    startDate() {
      const dataLength = this.dataset.length
      return dataLength > 0 ? this.dataset[0].time : null
    },

    endDate() {
      const dataLength = this.dataset.length
      return dataLength > 0 ? this.dataset[dataLength - 1].time : null
    }
  },

  watch: {
    selectedPowerEnergyDomains() {
      this.calculateSelectedMinMax()
    },
    dataset(d) {
      this.calculateSelectedMinMax()
      this.updateMinMax(d)
    },
    focusOn(d) {
      if (!d) {
        this.recordSelectDate = null
      }
    }
  },

  mounted() {
    this.calculateSelectedMinMax()
    this.updateMinMax(this.dataset)
  },

  methods: {
    calculateSelectedMinMax() {
      if (this.dataset.length > 0) {
        const dataset = _cloneDeep(this.dataset)

        dataset.forEach((d) => {
          let selectedTotal = null

          this.selectedPowerEnergyDomains.forEach((domain) => {
            if (d[domain.id]) {
              selectedTotal += d[domain.id]
            }
          })

          d._selectedTotal = selectedTotal
        })

        let minSelected = dataset[0]._selectedTotal,
          maxSelected = dataset[0]._selectedTotal,
          minSelectedDate = dataset[0].date,
          maxSelectedDate = dataset[0].date

        dataset.forEach((d) => {
          const selectedTotal = d._selectedTotal
          if (selectedTotal <= minSelected || !minSelected) {
            minSelected = selectedTotal
            minSelectedDate = d.time
          }
          if (selectedTotal >= maxSelected || !maxSelected) {
            maxSelected = selectedTotal
            maxSelectedDate = d.time
          }
        })

        this.minSelected = minSelected
        this.minSelectedDate = minSelectedDate
        this.maxSelected = maxSelected
        this.maxSelectedDate = maxSelectedDate
      }
    },
    convertValue(value) {
      return SI.convertValue(
        this.chartUnitPrefix,
        this.chartDisplayPrefix,
        value
      )
    },
    updateMinMax(dataset) {
      const updatedDataset = dataset
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

      updatedDataset.every((d) => {
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

      updatedDataset.forEach((d) => {
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

header {
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h5 {
    font-weight: bold;
    font-size: 16px;
  }

  & > div {
    font-size: 12px;
    color: #6A6A6A;
    font-weight: 400;
  }
}

.table {
  font-size: 0.8em;
  border: 1px solid #E0DFDC;
  background-color: #fff;
}
</style>
