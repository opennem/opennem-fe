<template>
  <section>
    <power-energy-chart
      v-if="ready"
      :power-energy-dataset="currentDataset"
      :domain-power-energy="currentDomainPowerEnergy"
      :hidden-domains="hiddenFuelTechs"
      :range="range"
      :interval="interval"
      :by-generation="byGeneration"
      :compare-dates="compareDates"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      :renewables-line-colour="renewablesLineColour"
      :prop-name="propName"
      :chart-height="chartHeight"
      :filter-period="filterPeriod"
      :incomplete-intervals="incompleteIntervals"
      :is-energy-type="isEnergyType"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick"
      @selectedDataset="ds => selectedDataset = ds"
      @displayUnit="unit => selectedUnit = unit"
    />

    <energy-compare
      v-if="compareDifference"
      :domains="domains"
      :unit="selectedUnit"
      :compare-data="compareData"
    />

    <emissions-chart
      v-if="ready && domainEmissions.length > 0 && featureEmissions"
      :emissions-dataset="currentDataset"
      :domain-emissions="currentDomainEmissions"
      :range="range"
      :interval="interval"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      :average-emissions="averageEmissions"
      :hidden-domains="hiddenFuelTechs"
      :prop-name="propName"
      :incomplete-intervals="incompleteIntervals"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick"
    />

    <emission-intensity-chart
      v-if="ready && domainEmissions.length > 0 && featureEmissions"
      :emission-intensity-dataset="emissionIntensityData"
      :range="range"
      :interval="interval"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      :average-emission-intensity="averageEmissionIntensity"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick" />

    <price-market-value-chart
      v-if="ready && domainPrice.length > 0"
      :price-dataset="currentDataset"
      :domain-price="domainPrice"
      :range="range"
      :interval="interval"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick" />

    <temperature-chart
      v-if="ready && domainTemperature.length > 0"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick" />

  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { min, max } from 'd3-array'
import _cloneDeep from 'lodash.clonedeep'
import addYears from 'date-fns/addYears'

import DateDisplay from '@/services/DateDisplay.js'
import GetIncompleteIntervals from '@/services/incompleteIntervals.js'
import PowerEnergyChart from '@/components/Charts/PowerEnergyChart'
import EmissionsChart from '@/components/Charts/EmissionsChart'
import EmissionIntensityChart from '@/components/Charts/EmissionIntensityChart'
import EnergyCompare from '@/components/Energy/Charts/CompareChart'
import PriceMarketValueChart from '@/components/Charts/PriceMarketValueChart'
import TemperatureChart from '@/components/Energy/Charts/TemperatureChart'

export default {
  components: {
    PowerEnergyChart,
    EmissionsChart,
    EmissionIntensityChart,
    EnergyCompare,
    PriceMarketValueChart,
    TemperatureChart
  },

  props: {
    onHover: {
      type: Boolean,
      default: false
    },
    dateHover: {
      type: Date,
      default: null
    }
  },

  data() {
    return {
      compareData: [],
      isHovering: false,
      hoverDate: null,
      zoomExtent: [],
      selectedDataset: [],
      selectedUnit: ''
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',

      range: 'range',
      interval: 'interval',
      compareDifference: 'compareDifference',
      compareDates: 'compareDates',
      filterPeriod: 'filterPeriod',
      fuelTechGroupName: 'fuelTechGroupName',
      hiddenFuelTechs: 'hiddenFuelTechs',
      percentContributionTo: 'percentContributionTo',

      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',

      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      currentDataset: 'regionEnergy/currentDataset',
      domainEmissions: 'regionEnergy/domainEmissions',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainPrice: 'regionEnergy/domainPrice',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions',

      averageEmissions: 'energy/emissions/averageEmissions',
      emissionIntensityData: 'energy/emissions/emissionIntensityData',
      averageEmissionIntensity: 'energy/emissions/averageEmissionIntensity',

      featureEmissions: 'feature/emissions'
    }),

    regionId() {
      return this.$route.params.region
    },

    domains() {
      return this.currentDomainPowerEnergy
        ? _cloneDeep(this.currentDomainPowerEnergy).reverse()
        : []
    },

    byGeneration() {
      return this.percentContributionTo === 'generation'
    },

    renewablesLineColour() {
      return this.fuelTechGroupName === 'Renewable/Fossil' ||
        this.fuelTechGroupName === 'Flexibility'
        ? '#e34a33'
        : '#52BCA3'
    },

    propName() {
      return this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
    },

    chartHeight() {
      let height = 330
      if (this.regionId === 'nem' && !this.tabletBreak) {
        height = 520
      }
      return height
    },

    incompleteIntervals() {
      return GetIncompleteIntervals({
        dataset: this.currentDataset,
        range: this.range,
        interval: this.interval,
        filterPeriod: this.filterPeriod
      })
    }
  },

  watch: {
    range() {
      this.clearHoverFocus()
    },
    interval() {
      this.clearHoverFocus()
    },
    onHover(hover) {
      this.isHovering = hover
    },
    dateHover(date) {
      this.hoverDate = date
    },
    compareDifference(compare) {
      if (!compare) {
        this.compareData = []
        this.$store.dispatch('compareDates', [])
      }
    },
    selectedDataset(ds) {
      if (this.compareDates.length === 2) {
        const firstData = this.getDataByTime(
          this.selectedDataset,
          this.compareDates[0]
        )
        const secondData = this.getDataByTime(
          this.selectedDataset,
          this.compareDates[1]
        )
        this.compareData = [firstData, secondData]
      }
    }
  },

  created() {
    this.clearHoverFocus()
  },

  methods: {
    ...mapMutations({
      setFocusDate: 'visInteract/focusDate',
      setFilteredDates: 'regionEnergy/filteredDates'
    }),
    clearHoverFocus() {
      this.isHovering = false
      this.hoverDate = null
      this.setFocusDate(null)
    },
    getDataByTime(dataset, time) {
      return dataset.find(d => d.time === time)
    },
    updateFilteredDates(filteredDates) {
      this.zoomExtent = filteredDates
      this.setFilteredDates(filteredDates)
    },
    handleDateHover(date) {
      this.hoverDate = DateDisplay.getClosestDateByInterval(
        date,
        this.interval,
        this.filterPeriod
      )
      this.$emit('dateHover', this.hoverDate)
    },
    handleIsHovering(hover) {
      this.isHovering = hover
      this.$emit('isHovering', hover)
    },
    handleSvgClick(metaKey) {
      if (metaKey && this.focusOn && !this.compareDifference) {
        this.$store.dispatch('compareDifference', true)
        const hoverTime = this.hoverDate ? this.hoverDate.getTime() : 0
        const focusTime = this.focusDate ? this.focusDate.getTime() : 0
        const firstData = this.getDataByTime(this.selectedDataset, focusTime)
        const secondData = this.getDataByTime(this.selectedDataset, hoverTime)

        setTimeout(() => {
          this.$store.dispatch('compareDates', [focusTime, hoverTime])
          this.compareData = [firstData, secondData].slice()
          this.setFocusDate(null)
        }, 10)
      } else {
        if (this.compareDifference) {
          const hoverTime = this.hoverDate ? this.hoverDate.getTime() : 0
          let newCompare = false
          let compareDates = this.compareDates.slice()

          if (compareDates.length === 2) {
            const newCompareDates = compareDates.filter(d => d !== hoverTime)
            if (newCompareDates.length === 1) {
              compareDates = newCompareDates
              newCompare = true
            } else {
              compareDates.pop()
            }
          }
          if (compareDates.length < 2 && !newCompare) {
            const newCompareDates = compareDates.filter(d => d !== hoverTime)
            if (newCompareDates.length === 0) {
              compareDates = newCompareDates
            } else {
              compareDates.push(hoverTime)
            }
          }

          if (compareDates.length === 2) {
            const firstData = this.getDataByTime(
              this.selectedDataset,
              compareDates[0]
            )
            const secondData = this.getDataByTime(
              this.selectedDataset,
              compareDates[1]
            )
            this.compareData = [firstData, secondData]
          }

          if (compareDates.length === 0) {
            this.$store.dispatch('compareDifference', false)
          }
          this.$store.dispatch('compareDates', compareDates)
        } else if (!this.isTouchDevice) {
          const hoverTime = this.hoverDate ? this.hoverDate.getTime() : 0
          const focusTime = this.focusDate ? this.focusDate.getTime() : 0
          if (this.focusDate && focusTime === hoverTime) {
            this.setFocusDate(null)
          } else {
            this.setFocusDate(this.hoverDate)
          }
        }
      }
    },
    handleZoomExtent(dateRange) {
      let filteredDates = []
      if (dateRange && dateRange.length > 0) {
        let startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        const endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )
        if (this.interval === 'Fin Year') {
          startTime = addYears(startTime, 1)
        }

        filteredDates = [startTime, endTime]
      } else {
        filteredDates = []
      }

      this.updateFilteredDates(filteredDates)
    }
  }
}
</script>
