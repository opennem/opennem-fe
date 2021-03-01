<template>
  <section>
    <power-energy-chart
      v-if="ready && showChartPowerEnergy"
      :power-energy-dataset="currentDataset"
      :domain-power-energy="currentDomainPowerEnergy"
      :hidden-domains="hiddenFuelTechs"
      :range="range"
      :interval="interval"
      :renewables-line-colour="renewablesLineColour"
      :by-generation="byGeneration"
      :is-energy-type="isEnergyType"
      :prop-name="propName"
      :filter-period="filterPeriod"
      :incomplete-intervals="incompleteIntervals"
      :read-only="true"
      :zoom-extent="filteredDates"
    />

    <emissions-chart
      v-if="ready && domainEmissions.length > 0 && showChartEmissionsVolume && featureEmissions"
      :read-only="true"
      :zoom-extent="filteredDates"
      :emissions-dataset="currentDataset"
      :domain-emissions="currentDomainEmissions"
      :average-emissions="averageEmissions"
      :range="range"
      :interval="interval"
      :hidden-domains="hiddenFuelTechs"
      :prop-name="propName"
      :incomplete-intervals="incompleteIntervals"
    />

    <emission-intensity-chart
      v-if="ready && domainEmissions.length > 0 && showChartEmissionIntensity && featureEmissions"
      :read-only="true"
      :zoom-extent="filteredDates"
      :emission-intensity-dataset="emissionIntensityData"
      :range="range"
      :interval="interval"
    />

    <price-market-value-chart
      v-if="ready && domainPrice.length > 0 && showChartPrice"
      :read-only="true"
      :zoom-extent="filteredDates"
      :price-dataset="currentDataset"
      :domain-price="domainPrice"
      :range="range"
      :interval="interval"
    />

    <temperature-chart
      v-if="ready && domainTemperature.length > 0 && showChartTemperature"
      :read-only="true"
      :zoom-extent="filteredDates"
    />

  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'

import GetIncompleteIntervals from '@/services/incompleteIntervals.js'

import PowerEnergyChart from '@/components/Energy/Charts/PowerEnergyChart'
import EmissionsChart from '@/components/Charts/EmissionsChart'
import EmissionIntensityChart from '@/components/Charts/EmissionIntensityChart'
import PriceMarketValueChart from '@/components/Charts/PriceMarketValueChart'
import TemperatureChart from '@/components/Energy/Charts/TemperatureChart'

export default {
  components: {
    PowerEnergyChart,
    EmissionsChart,
    EmissionIntensityChart,
    PriceMarketValueChart,
    TemperatureChart
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      fuelTechGroupName: 'fuelTechGroupName',
      hiddenFuelTechs: 'hiddenFuelTechs',
      filterPeriod: 'filterPeriod',
      percentContributionTo: 'percentContributionTo',

      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      filteredDates: 'regionEnergy/filteredDates',
      currentDataset: 'regionEnergy/currentDataset',
      domainEmissions: 'regionEnergy/domainEmissions',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainPrice: 'regionEnergy/domainPrice',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions',

      showChartPowerEnergy: 'chartOptionsPowerEnergy/chartShown',
      showChartEmissionsVolume: 'chartOptionsEmissionsVolume/chartShown',
      showChartEmissionIntensity: 'chartOptionsEmissionIntensity/chartShown',
      showChartPrice: 'chartOptionsPrice/chartShown',
      showChartTemperature: 'chartOptionsTemperature/chartShown',

      averageEmissions: 'energy/emissions/averageEmissions',
      emissionIntensityData: 'energy/emissions/emissionIntensityData',

      featureEmissions: 'feature/emissions'
    }),
    domains() {
      return this.currentDomainPowerEnergy
        ? _cloneDeep(this.currentDomainPowerEnergy).reverse()
        : []
    },
    renewablesLineColour() {
      return this.fuelTechGroupName === 'Renewable/Fossil' ||
        this.fuelTechGroupName === 'Flexibility'
        ? '#e34a33'
        : '#52BCA3'
    },
    byGeneration() {
      return this.percentContributionTo === 'generation'
    },
    propName() {
      return this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
    },
    incompleteIntervals() {
      return GetIncompleteIntervals({
        dataset: this.currentDataset,
        range: this.range,
        interval: this.interval,
        filterPeriod: this.filterPeriod
      })
    }
  }
}
</script>
