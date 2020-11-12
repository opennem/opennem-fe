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
    />

    <emission-intensity-chart 
      v-if="ready && domainEmissions.length > 0 && showChartEmissionIntensity && featureEmissions"
      :read-only="true"
      :zoom-extent="filteredDates"
    />

    <price-market-value-chart 
      v-if="ready && domainPrice.length > 0 && showChartPrice" 
      :read-only="true"
      :zoom-extent="filteredDates"
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
import EmissionsChart from '@/components/Energy/Charts/EmissionsChart'
import EmissionIntensityChart from '@/components/Energy/Charts/EmissionIntensityChart'
import PriceMarketValueChart from '@/components/Energy/Charts/PriceMarketValueChart'
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
      ready: 'regionEnergy/ready',
      filteredDates: 'regionEnergy/filteredDates',
      domainEmissions: 'regionEnergy/domainEmissions',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainPrice: 'regionEnergy/domainPrice',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      showChartPowerEnergy: 'chartOptionsPowerEnergy/chartShown',
      showChartEmissionsVolume: 'chartOptionsEmissionsVolume/chartShown',
      showChartEmissionIntensity: 'chartOptionsEmissionIntensity/chartShown',
      showChartPrice: 'chartOptionsPrice/chartShown',
      showChartTemperature: 'chartOptionsTemperature/chartShown',

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
