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
      :dataset="filteredCurrentDataset"
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

    <energy-records
      :domains="domains"
      :dataset="filteredCurrentDataset"
      :range="range"
      :interval="interval"
      :price-id="domainPrice.length > 0 ? domainPrice[0].id : ''"
      :temperature-id="temperatureMeanDomain"
      @recordSelect="handleRecordSelect"
      @recordDeselect="handleRecordDeselect"
      @recordMouseEnter="handleRecordMouseEnter"
      @recordMouseLeave="handleRecordMouseLeave" />
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import SummaryTable from '@/components/SummaryTable/index2'
import EnergyRecords from '~/components/Energy/Records.vue'
import { TEMPERATURE, TEMPERATURE_MEAN } from '@/constants/v2/data-types.js'
export default {
  components: {
    SummaryTable,
    EnergyRecords
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
      filteredCurrentDataset: 'regionEnergy/filteredCurrentDataset',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainPrice: 'regionEnergy/domainPrice',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDomainMarketValue: 'regionEnergy/currentDomainMarketValue'
    }),
    domains() {
      return _cloneDeep(this.currentDomainPowerEnergy).reverse()
    },
    temperatureMeanDomain() {
      const find = this.domainTemperature.find(
        t => t.type === TEMPERATURE || t.type === TEMPERATURE_MEAN
      )
      return find ? find.domain : ''
    }
  },

  methods: {
    ...mapMutations({
      setSummary: 'regionEnergy/summary',
      setHighlightDomain: 'visInteract/highlightDomain',
      setFocusDate: 'visInteract/focusDate'
    }),
    handleFuelTechsHidden(hidden) {
      this.$store.dispatch('hiddenFuelTechs', hidden)
    },
    handleSummaryUpdated(summary) {
      this.setSummary(summary)
    },
    handleSummaryRowMouseEnter(ft) {
      const property =
        this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
      this.setHighlightDomain(ft[property])
    },
    handleSummaryRowMouseLeave() {
      this.setHighlightDomain('')
    },
    handleRecordMouseEnter(date) {
      this.$emit('dateHover', new Date(date))
      this.$emit('isHovering', true)
    },
    handleRecordMouseLeave() {
      this.$emit('dateHover', null)
      this.$emit('isHovering', false)
    },
    handleRecordSelect(date) {
      this.setFocusDate(new Date(date))
    },
    handleRecordDeselect() {
      this.setFocusDate(null)
    }
  }
}
</script>
