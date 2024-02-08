<template>
  <section>
    <power-energy-chart
      v-if="ready && exportPowerEnergy"
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
      v-if="
        ready &&
          domainEmissions.length > 0 &&
          exportEmissionsVolume
      "
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
      :is-energy-type="isEnergyType"
      :filter-period="filterPeriod"
    />

    <emission-intensity-chart
      v-if="
        ready &&
          domainEmissions.length > 0 &&
          exportEmissionIntensity
      "
      :read-only="true"
      :zoom-extent="filteredDates"
      :emission-intensity-dataset="emissionIntensityData"
      :range="range"
      :interval="interval"
      :filter-period="filterPeriod"
    />

    <price-chart
      v-if="ready && !isEnergyType && domainPrice.length > 0 && exportPrice"
      :read-only="true"
      :zoom-extent="filteredDates"
      :price-dataset="currentDataset"
      :domain-price="domainPrice"
      :range="range"
      :interval="interval"
      :filter-period="filterPeriod"
    />

    <price-chart
      v-if="
        ready && isEnergyType && domainDemandPrice.length > 0 && exportPrice
      "
      :price-dataset="currentDataset"
      :domain-price="domainDemandPrice"
      :range="range"
      :interval="interval"
      :zoom-extent="filteredDates"
      :use-demand="true"
      :read-only="true"
      :filter-period="filterPeriod"
    />

    <temperature-chart
      v-if="ready && domainTemperature.length > 0 && exportTemperature"
      :read-only="true"
      :zoom-extent="filteredDates"
    />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'

import GetIncompleteIntervals from '@/services/incompleteIntervals.js'
import { GROUP_DETAILED } from '@/constants/energy-fuel-techs'

import PowerEnergyChart from '@/components/Charts/PowerEnergyChart'
import EmissionsChart from '@/components/Charts/EmissionsChart'
import EmissionIntensityChart from '@/components/Charts/EmissionIntensityChart'
import PriceChart from '@/components/Charts/PriceChart'
import TemperatureChart from '@/components/Energy/Charts/TemperatureChart'

export default {
  components: {
    PowerEnergyChart,
    EmissionsChart,
    EmissionIntensityChart,
    PriceChart,
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
      domainDemandPrice: 'regionEnergy/domainDemandPrice',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions',

      showChartPowerEnergy: 'chartOptionsPowerEnergy/chartShown',
      showChartEmissionsVolume: 'chartOptionsEmissionsVolume/chartShown',
      showChartEmissionIntensity: 'chartOptionsEmissionIntensity/chartShown',
      showChartPrice: 'chartOptionsPrice/chartShown',
      showChartTemperature: 'chartOptionsTemperature/chartShown',

      averageEmissions: 'energy/emissions/averageEmissions',
      emissionIntensityData: 'energy/emissions/emissionIntensityData',

      exportPowerEnergy: 'export/powerEnergy',
      exportEmissionsVolume: 'export/emissionsVolume',
      exportEmissionIntensity: 'export/emissionIntensity',
      exportPrice: 'export/price',
      exportTemperature: 'export/temperature'
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
      return this.fuelTechGroupName === GROUP_DETAILED ? 'fuelTech' : 'group'
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
