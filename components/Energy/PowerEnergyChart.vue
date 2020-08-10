<template>
  <div>
    <!--
      :dynamic-extent="dateFilter"
      :hover-date="hoverDate"
      :hover-on="hoverOn"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :incomplete-intervals="incompleteIntervals"
      :compare-dates="compareDates"
      :dataset-two="chartEnergyRenewablesLine ? renewablesPercentageDataset : []"
      :dataset-two-colour="renewablesLineColour"
      :highlight-domain="highlightDomain"
      :zoomed="zoomed"
      :x-guides="xGuides"
      :x-axis-dy="xAxisDy"
      :mobile-screen="tabletBreak"
    -->
    <stacked-area-vis
      v-if="chartEnergy && chartEnergyType === 'area'"
      :domains="domains"
      :dataset="currentDatasetFlat"
      :range="range"
      :interval="interval"
      :curve="isEnergyType ? chartEnergyCurve : chartPowerCurve"
      :y-min="yMin"
      :y-max="yMax"
      :vis-height="350"
      class="vis-chart"
      @dateOver="handleDateHover"
      @domainOver="handleDomainHover"
      @svgClick="handleSvgClick"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { min, max } from 'd3-array'
import _cloneDeep from 'lodash.clonedeep'
import StackedAreaVis from '@/components/Vis/StackedArea.vue'

export default {
  components: {
    StackedAreaVis
  },

  data() {
    return {
      chartEnergyOptions: false
    }
  },

  computed: {
    ...mapGetters({
      chartEnergy: 'visInteract/chartEnergy',
      chartEnergyType: 'visInteract/chartEnergyType',
      chartEnergyYAxis: 'visInteract/chartEnergyYAxis',
      chartEnergyCurve: 'visInteract/chartEnergyCurve',
      chartPowerCurve: 'visInteract/chartPowerCurve',
      range: 'range',
      interval: 'interval',
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      currentDatasetFlat: 'regionEnergy/currentDatasetFlat',
      domainTemperature: 'regionEnergy/domainTemperature',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy'
    }),
    yMin() {
      return min(this.currentDatasetFlat, d => d._stackedTotalMin)
    },
    yMax() {
      return max(this.currentDatasetFlat, d => d._stackedTotalMax)
    },
    domains() {
      return _cloneDeep(this.currentDomainPowerEnergy).reverse()
    }
  },

  methods: {
    handleDateHover(evt, date) {
      // console.log(evt, date)
    },
    handleDomainHover(domain) {
      // console.log(domain)
    },
    handleVisEnter() {
      // console.log('vis enter')
    },
    handleVisLeave() {
      // console.log('vis leave')
    },
    handleSvgClick() {
      // console.log('svg click')
    }
  }
}
</script>
