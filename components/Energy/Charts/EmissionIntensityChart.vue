<template>
  <div
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartShown
    }"
    class="emission-intensity-chart chart">

    <emission-intensity-chart-options
      :read-only="readOnly"
      :options="options"
      :chart-shown="chartShown"
      :chart-type="chartType"
      :chart-curve="chartCurve"
      :interval="interval"
      :average-emission-intensity="averageEmissionIntensity"
      :hover-display-date="hoverDisplayDate"
      :hover-value="hoverValue"
    />

    <line-vis
      v-if="chartShown"
      :read-only="readOnly"
      :domain-id="'_emissionIntensity'"
      :domain-colour="lineColour"
      :dataset="emissionIntensityData"
      :dynamic-extent="zoomExtent"
      :hover-date="hoverDate"
      :hover-on="hoverOn"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :range="range"
      :interval="interval"
      :curve="chartCurve"
      :y-axis-log="false"
      :y-min="-50"
      :y-max="1200"
      :show-x-axis="false"
      :show-tooltip="false"
      :show-point-on-hover="true"
      :vis-height="100"
      :show-zoom-out="false"
      :x-guides="xGuides"
      :y-axis-ticks="3"
      class="emission-intensity-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import _includes from 'lodash.includes'
import * as OPTIONS from '@/constants/chart-options.js'
import * as FT from '@/constants/energy-fuel-techs/group-default.js'
import DateDisplay from '@/services/DateDisplay.js'
import EmissionIntensityChartOptions from '@/components/Energy/Charts/EmissionIntensityChartOptions'
import LineVis from '@/components/Vis/Line.vue'

const options = {
  type: [OPTIONS.CHART_HIDDEN, OPTIONS.CHART_LINE],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: []
}

export default {
  components: {
    EmissionIntensityChartOptions,
    LineVis
  },

  props: {
    hoverOn: {
      type: Boolean,
      default: false
    },
    hoverDate: {
      type: Date,
      default: null
    },
    zoomExtent: {
      type: Array,
      default: () => []
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      options,
      lineColour: '#e34a33'
    }
  },

  computed: {
    ...mapGetters({
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      xGuides: 'visInteract/xGuides',
      chartShown: 'chartOptionsEmissionIntensity/chartShown',
      chartType: 'chartOptionsEmissionIntensity/chartType',
      chartCurve: 'chartOptionsEmissionIntensity/chartCurve',

      range: 'range',
      interval: 'interval',
      fuelTechGroupName: 'fuelTechGroupName',
      hiddenFuelTechs: 'hiddenFuelTechs',
      percentContributionTo: 'percentContributionTo',
      currentDataset: 'regionEnergy/currentDataset',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      domainPowerEnergy: 'regionEnergy/domainPowerEnergy',

      summary: 'regionEnergy/summary',

      emissionIntensityData: 'energy/emissions/emissionIntensityData',
      averageEmissionIntensity: 'energy/emissions/averageEmissionIntensity'
    }),
    property() {
      return this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
    },
    calculateByGeneration() {
      return this.percentContributionTo === 'generation'
    },
    emissionsDomains() {
      const domains = this.currentDomainEmissions.filter(
        d => d.category !== FT.LOAD
      )
      const hidden = this.hiddenFuelTechs
      return domains
        ? domains.filter(d => !_includes(hidden, d[this.property]))
        : []
    },
    powerEnergyDomains() {
      const domains = this.currentDomainPowerEnergy
      const hidden = this.hiddenFuelTechs
      return domains.filter(d => !_includes(hidden, d[this.property]))
    },

    hoverData() {
      if (!this.hoverDate) {
        return null
      }
      const time = this.hoverDate.getTime()
      return this.emissionIntensityData.find(d => d.time === time)
    },
    hoverValue() {
      if (this.hoverData) {
        console.log(
          `emissions: ${this.hoverData._totalEmissions}, power/energy: ${
            this.hoverData._totalPowerEnergyMinusBatteryDischarging
          }, intensity: ${this.hoverData._emissionIntensity}`
        )
      }
      return this.hoverData ? this.hoverData._emissionIntensity : null
    },
    hoverDisplayDate() {
      let date = this.focusDate
      if (this.hoverOn) {
        date = this.hoverDate
      }
      return date
        ? DateDisplay.specialDateFormats(
            date.getTime(),
            this.range,
            this.interval,
            false,
            false,
            false,
            true
          )
        : ''
    }
  },

  watch: {
    currentDataset() {
      this.updateEmissionsData()
    },
    calculateByGeneration() {
      this.updateEmissionsData()
    },
    hiddenFuelTechs() {
      this.updateEmissionsData()
    }
  },

  mounted() {
    this.updateEmissionsData()
  },

  methods: {
    ...mapActions({
      doUpdateEmissionIntensityDataset:
        'energy/emissions/doUpdateEmissionIntensityDataset'
    }),
    updateEmissionsData() {
      this.doUpdateEmissionIntensityDataset({
        datasetAll: this.currentDataset,
        isCalculateByGeneration: this.calculateByGeneration,
        emissionsDomains: this.emissionsDomains,
        powerEnergyDomains: this.powerEnergyDomains,
        domainPowerEnergy: this.domainPowerEnergy
      })
    },
    handleDateHover(evt, date) {
      this.$emit('dateHover', date)
    },
    handleVisEnter() {
      this.$emit('isHovering', true)
    },
    handleVisLeave() {
      this.$emit('isHovering', false)
    },
    handleSvgClick(metaKey) {
      this.$emit('svgClick', metaKey)
    }
  }
}
</script>
