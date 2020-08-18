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
      :market-value-domains="currentDomainPriceMarketValue"
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
      dateZoomExtent: 'visInteract/dateZoomExtent',
      range: 'range',
      interval: 'interval',
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      currentDatasetFlat: 'regionEnergy/currentDatasetFlat',
      filteredCurrentDatasetFlat: 'regionEnergy/filteredCurrentDatasetFlat',
      domainTemperature: 'regionEnergy/domainTemperature',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDomainPriceMarketValue:
        'regionEnergy/currentDomainPriceMarketValue'
    }),
    domains() {
      return _cloneDeep(this.currentDomainPowerEnergy).reverse()
    }
  },

  methods: {
    ...mapMutations({
      setSummary: 'regionEnergy/summary'
    }),
    handleFuelTechsHidden(hidden) {
      // console.log('ft hidden', hidden)
      // this.$store.dispatch('hiddenFuelTechs', hidden)
    },
    handleSummaryUpdated(summary) {
      // console.log('summary updated', summary)
      this.setSummary(summary)
    },
    handleSummaryRowMouseEnter(ft) {
      // console.log('summary row enter', ft)
    },
    handleSummaryRowMouseLeave() {
      // console.log('summary row leave')
    }
  }
}
</script>
