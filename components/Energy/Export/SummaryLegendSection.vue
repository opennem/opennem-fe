<template>
  <section>
    <summary-table
      :display-as-legend="showLegend"
      :show-percent-in-legend="showPercent"
      :energy-domains="powerEnergyDomains"
      :curtailment-domains="curtailmentDomains"
      :temperature-domains="domainTemperature"
      :market-value-domains="currentDomainMarketValue"
      :price-id="domainPrice.length > 0 ? domainPrice[0].id : ''"
      :dataset="filteredCurrentDataset"
      :range="range"
      :interval="interval"
      :is-energy="isEnergyType"
      :hidden-fuel-techs="hiddenFuelTechs"
      :domain-toggleable="false"
      :group-selection="false"
      style="margin-bottom: 1rem"
    />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import _includes from 'lodash.includes'

import { GROUP_DETAILED } from '@/constants/energy-fuel-techs'

import SummaryTable from '@/components/SummaryTable'
export default {
  components: {
    SummaryTable
  },

  props: {
    showSummary: {
      type: Boolean,
      default: false
    },
    showLegend: {
      type: Boolean,
      default: true
    },
    showPercent: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      hiddenFuelTechs: 'hiddenFuelTechs',
      fuelTechGroupName: 'fuelTechGroupName',
      isEnergyType: 'regionEnergy/isEnergyType',
      filteredCurrentDataset: 'regionEnergy/filteredCurrentDataset',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainPrice: 'regionEnergy/domainPrice',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDomainCurtailment: 'regionEnergy/currentDomainCurtailment',
      currentDomainMarketValue: 'regionEnergy/currentDomainMarketValue'
    }),
    powerEnergyDomains() {
      return this.currentDomainPowerEnergy
        ? _cloneDeep(this.currentDomainPowerEnergy).reverse()
        : []
    },
    curtailmentDomains() {
      return this.currentDomainCurtailment
        ? _cloneDeep(this.currentDomainCurtailment).reverse()
        : []
    },
    property() {
      return this.fuelTechGroupName === GROUP_DETAILED ? 'fuelTech' : 'group'
    }
  }
}
</script>
