<template>
  <section>
    <!--
      :emissions-domains="emissionStackedAreaDomains"
      :price-id="priceDomains.length > 0 ? priceDomains[0].id : null"
      :hidden-fuel-techs="hiddenFuelTechs"
      :market-value-domains="mvDomains"
      :hidden-fuel-techs="hiddenFuelTechs"

      -->
    <summary-table
      :energy-domains="domains"
      :temperature-domains="domainTemperature"
      :market-value-domains="currentDomainMarketValue"
      :price-id="domainPrice.length > 0 ? domainPrice[0].id : ''"
      :dataset="filteredCurrentDatasetFlat"
      :hover-date="hoverDate"
      :hover-on="isHovering"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :range="range"
      :interval="interval"
      :is-energy="isEnergyType"
      @fuelTechsHidden="handleFuelTechsHidden"
      @summary-update="handleSummaryUpdated"
      @mouse-enter="handleSummaryRowMouseEnter"
      @mouse-leave="handleSummaryRowMouseLeave"
    />
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import SummaryTable from '@/components/SummaryTable/index2'

export default {
  components: {
    SummaryTable
  },

  props: {
    isHovering: {
      type: Boolean,
      default: false
    },
    hoverDate: {
      type: Date,
      default: null
    }
  },

  computed: {
    ...mapGetters({
      hoverDomain: 'visInteract/hoverDomain',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      range: 'range',
      interval: 'interval',
      fuelTechGroupName: 'fuelTechGroupName',
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      currentDatasetFlat: 'regionEnergy/currentDatasetFlat',
      filteredCurrentDatasetFlat: 'regionEnergy/filteredCurrentDatasetFlat',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainPrice: 'regionEnergy/domainPrice',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDomainMarketValue: 'regionEnergy/currentDomainMarketValue'
    }),
    domains() {
      return _cloneDeep(this.currentDomainPowerEnergy).reverse()
    }
  },

  methods: {
    ...mapMutations({
      setSummary: 'regionEnergy/summary',
      setHighlightDomain: 'visInteract/highlightDomain'
    }),
    handleFuelTechsHidden(hidden) {
      this.$store.dispatch('hiddenFuelTechs', hidden)
    },
    handleSummaryUpdated(summary) {
      // console.log('summary updated', summary)
      this.setSummary(summary)
    },
    handleSummaryRowMouseEnter(ft) {
      const property =
        this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
      this.setHighlightDomain(ft[property])
    },
    handleSummaryRowMouseLeave() {
      this.setHighlightDomain('')
    }
  }
}
</script>
