<template>
  <section>
    <summary-table
      :energy-domains="powerEnergyDomains"
      :temperature-domains="domainTemperature"
      :market-value-domains="currentDomainMarketValue"
      :emissions-domains="currentDomainEmissions"
      :demand-price-domains="domainDemandPrice"
      :demand-energy-domains="domainDemandEnergy"
      :demand-power-domains="domainDemandPower"
      :demand-market-value-domains="domainDemandMarketValue"
      :price-id="domainPrice.length > 0 ? domainPrice[0].id : ''"
      :capacity-domains="capacityDomains"
      :dataset="filteredCurrentDatasetCapacity"
      :hover-date="hoverDate"
      :hover-on="isHovering"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :range="range"
      :interval="interval"
      :is-energy="isEnergyType"
      :hidden-fuel-techs="hiddenFuelTechs"
      @fuelTechsHidden="handleFuelTechsHidden"
      @summary-update="handleSummaryUpdated"
      @mouse-enter="handleSummaryRowMouseEnter"
      @mouse-leave="handleSummaryRowMouseLeave"
      @domain-click="handleDomainClick"
    />

    <!-- <section 
      v-if="showDonutBar" 
      class="bar-donut-wrapper chart-border">
      <header class="button-group">
        <div class="range-buttons buttons has-addons">
          <button
            :class="{ 'is-selected': !chartSummaryPie }"
            class="button is-rounded"
            @click="handleChartSummaryClick('bar')"
          >
            <i class="fal fa-list" />
          </button>
          <button
            :class="{ 'is-selected': chartSummaryPie }"
            class="button is-rounded"
            @click="handleChartSummaryClick('pie')"
          >
            <i class="fal fa-chart-pie" />
          </button>
        </div>
      </header>

      <energy-bar
        v-if="!chartSummaryPie"
        :bar-width="250"
        :domains="donutDomains"
        :dataset="filteredCurrentDataset"
        :hover-on="isHovering"
        :hover-date="hoverDate"
        :focus-on="focusOn"
        :focus-date="focusDate"
        :highlight-domain="highlightId"
      />

      <donut-vis
        v-if="chartSummaryPie"
        :unit="` ${chartCurrentUnit}`"
        :domains="donutDomains"
        :dataset="filteredCurrentDataset"
        :dynamic-extent="filteredDates"
        :hover-on="isHovering"
        :hover-date="hoverDate"
        :focus-on="focusOn"
        :focus-date="focusDate"
        :convert-value="convertValue"
        :highlight-domain="highlightId"
        :is-power-type="!isEnergyType"
        :is-touch-device="isTouchDevice"
        @domain-click="handleDomainClick"
      />
    </section> -->

    <!-- <EnergyRecords
      v-if="showRecords"
      :selected-power-energy-domains="domains"
      :power-energy-domains="powerEnergyDomains"
      :dataset="filteredCurrentDataset"
      :range="range"
      :interval="interval"
      :price-id="recordsPriceId"
      :temperature-id="temperatureMeanDomain"
      @recordSelect="handleRecordSelect"
      @recordDeselect="handleRecordDeselect"
      @recordMouseEnter="handleRecordMouseEnter"
      @recordMouseLeave="handleRecordMouseLeave"
    /> -->
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import _includes from 'lodash.includes'

import SummaryTable from '~/components/Capacity/SummaryTable'
import EnergyRecords from '~/components/Energy/Records'
import DonutVis from '~/components/Vis/Donut.vue'
import EnergyBar from '~/components/Energy/Charts/EnergyBarChart.vue'

import { TEMPERATURE, TEMPERATURE_MEAN } from '@/constants/data-types.js'
import { GROUP_DETAILED } from '@/constants/capacity-fuel-techs'
import * as SI from '@/constants/si.js'

export default {
  components: {
    SummaryTable,
    EnergyRecords,
    EnergyBar,
    DonutVis
  },

  props: {
    isHovering: {
      type: Boolean,
      default: false
    },
    hoverDate: {
      type: Date,
      default: null
    },
    showRecords: {
      type: Boolean,
      default: true
    },
    showDonutBar: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    ...mapGetters({
      isTouchDevice: 'app/isTouchDevice',

      hoverDomain: 'visInteract/hoverDomain',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      chartSummaryPie: 'visInteract/chartSummaryPie',
      highlightDomain: 'visInteract/highlightDomain',

      range: 'range',
      interval: 'interval',
      fuelTechGroupName: 'fuelTechGroupName',
      hiddenFuelTechs: 'hiddenFuelTechs',
      chartUnit: 'chartUnit',

      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      filteredDates: 'regionEnergy/filteredDates',
      filteredCurrentDataset: 'regionEnergy/filteredCurrentDataset',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainPrice: 'regionEnergy/domainPrice',
      domainPowerEnergy: 'regionEnergy/domainPowerEnergy',
      domainDemandPrice: 'regionEnergy/domainDemandPrice',
      domainDemandEnergy: 'regionEnergy/domainDemandEnergy',
      domainDemandPower: 'regionEnergy/domainDemandPower',
      domainDemandMarketValue: 'regionEnergy/domainDemandMarketValue',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDomainMarketValue: 'regionEnergy/currentDomainMarketValue',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions',
      currentDomainCapacity: 'regionEnergy/currentDomainCapacity',

      filteredCurrentDatasetCapacity: 'regionEnergy/filteredCurrentDatasetCapacity',

      chartEnergyUnitPrefix: 'chartOptionsPowerEnergy/chartEnergyUnitPrefix',
      chartEnergyDisplayPrefix:
        'chartOptionsPowerEnergy/chartEnergyDisplayPrefix',
      chartEnergyCurrentUnit: 'chartOptionsPowerEnergy/chartEnergyCurrentUnit',

      chartPowerUnitPrefix: 'chartOptionsPowerEnergy/chartPowerUnitPrefix',
      chartPowerDisplayPrefix:
        'chartOptionsPowerEnergy/chartPowerDisplayPrefix',
      chartPowerCurrentUnit: 'chartOptionsPowerEnergy/chartPowerCurrentUnit'
    }),

    regionId() {
      return this.$route.params.region
    },
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

    property() {
      return this.fuelTechGroupName === GROUP_DETAILED ? 'fuelTech' : 'group'
    },
    powerEnergyDomains() {
      return this.currentDomainPowerEnergy
        ? _cloneDeep(this.currentDomainPowerEnergy).reverse()
        : []
    },

    capacityDomains() {
      return this.currentDomainCapacity
        ? _cloneDeep(this.currentDomainCapacity).reverse()
        : []
    },

    domains() {
      const domains = this.powerEnergyDomains
      const hidden = this.hiddenFuelTechs
      return domains.filter((d) => !_includes(hidden, d[this.property]))
    },
    donutDomains() {
      return this.domains.filter((d) => d.category === 'source')
    },
    temperatureMeanDomain() {
      const find = this.domainTemperature.find(
        (t) => t.type === TEMPERATURE || t.type === TEMPERATURE_MEAN
      )
      return find ? find.domain : ''
    },

    highlightId() {
      const domain = this.highlightDomain
      const property =
        this.fuelTechGroupName === GROUP_DETAILED ? 'fuelTech' : 'group'
      const find = this.domains.find((d) => d[property] === domain)
      return find ? find.id : ''
    },

    recordsPriceId() {
      let id = ''

      if (this.isEnergyType) {
        id =
          this.domainDemandPrice.length > 0 ? this.domainDemandPrice[0].id : ''
      } else {
        id = this.domainPrice.length > 0 ? this.domainPrice[0].id : ''
      }
      return id
    }
  },

  methods: {
    ...mapMutations({
      setSummary: 'regionEnergy/summary',
      setHighlightDomain: 'visInteract/highlightDomain',
      setFocusDate: 'visInteract/focusDate'
    }),
    convertValue(value) {
      return SI.convertValue(
        this.chartUnitPrefix,
        this.chartDisplayPrefix,
        value
      )
    },
    handleFuelTechsHidden(hidden) {
      this.$store.dispatch('hiddenFuelTechs', hidden)
    },
    handleSummaryUpdated(summary) {
      this.setSummary(summary)
    },
    handleSummaryRowMouseEnter(ft) {
      const property =
        this.fuelTechGroupName === GROUP_DETAILED ? 'fuelTech' : 'group'
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
    },
    handleChartSummaryClick(chartType) {
      if (chartType === 'pie') {
        this.$store.commit('visInteract/chartSummaryPie', true)
      } else {
        this.$store.commit('visInteract/chartSummaryPie', false)
      }
    },
    handleDomainClick(domain) {
      let fuelTechs = []
      if (domain.domainIds) {
        domain.domainIds.forEach((d) => {
          const find = this.domainPowerEnergy.find(
            (peDomain) => peDomain.id === d
          )
          fuelTechs.push(find.fuelTech)
        })
      } else {
        fuelTechs.push(domain.fuelTech)
      }
      const query = {
        tech: fuelTechs.join(','),
        status: 'operating'
      }

      this.$router.push({
        path: `/facilities/${this.regionId}/`,
        query
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.bar-donut-wrapper {
  margin: 32px 0;
  padding-bottom: 1rem;
  header {
    margin: 1rem 0;
    justify-content: center;
    .buttons {
      justify-content: center;
    }
    button {
      font-size: 11px;
      min-width: 30px;
    }
    i.fa-chart-bar {
      -moz-transform: scaleY(-1) rotate(90deg);
      -o-transform: scaleY(-1) rotate(90deg);
      -webkit-transform: scaleY(-1) rotate(90deg);
      transform: scaleY(-1) rotate(90deg);
    }
  }
}
</style>
