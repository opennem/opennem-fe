<template>
  <section>
    <summary-table
      v-if="showSummary"
      :energy-domains="powerEnergyDomains"
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
      style="margin-bottom: 1rem;"
    />

    <export-legend
      v-if="showLegend"
      :domains="domains"
    />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import _includes from 'lodash.includes'

import SummaryTable from '@/components/SummaryTable'
import ExportLegend from '@/components/Energy/Export/Legend'
export default {
  components: {
    SummaryTable,
    ExportLegend
  },

  props: {
    showSummary: {
      type: Boolean,
      default: false
    },
    showLegend: {
      type: Boolean,
      default: true
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
      currentDomainMarketValue: 'regionEnergy/currentDomainMarketValue'
    }),
    powerEnergyDomains() {
      return this.currentDomainPowerEnergy
        ? _cloneDeep(this.currentDomainPowerEnergy).reverse()
        : []
    },
    property() {
      return this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
    },
    domains() {
      const domains = this.powerEnergyDomains
      const hidden = this.hiddenFuelTechs
      return domains.filter(d => !_includes(hidden, d[this.property]))
    }
  }
}
</script>
