<template>
  <section>
    <power-energy-chart
      v-if="ready && showChartPowerEnergy"
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
      :prop-name="fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'"
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

import PowerEnergyChart from '@/components/Energy/Charts/PowerEnergyChart'
import EmissionsChart from '@/components/Charts/EmissionsChart'
import EmissionIntensityChart from '@/components/Energy/Charts/EmissionIntensityChart'
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

      ready: 'regionEnergy/ready',
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
    }
  }
}
</script>
