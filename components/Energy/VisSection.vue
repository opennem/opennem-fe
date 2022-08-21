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
      @selectedDataset="handleSelectedDatasetChange"
      @displayUnit="handleDisplayUnitChange"
    />

    <energy-compare
      v-if="compareDifference"
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
      :filter-period="filterPeriod"
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
      :filter-period="filterPeriod"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick"
    />

    <price-chart
      v-if="ready && !isEnergyType && domainPrice.length > 0"
      :price-dataset="currentDataset"
      :domain-price="domainPrice"
      :range="range"
      :interval="interval"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      :filter-period="filterPeriod"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick"
    />
    <price-chart
      v-if="ready && isEnergyType && domainDemandPrice.length > 0"
      :price-dataset="currentDataset"
      :domain-price="domainDemandPrice"
      :range="range"
      :interval="interval"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      :filter-period="filterPeriod"
      :use-demand="true"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick"
    />

    <temperature-chart
      v-if="ready && domainTemperature.length > 0"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      :filter-period="filterPeriod"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick"
    />
  </section>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import addYears from 'date-fns/addYears'

import * as OPTIONS from '@/constants/chart-options.js'

import DateDisplay from '@/services/DateDisplay.js'
import GetIncompleteIntervals from '@/services/incompleteIntervals.js'
import PowerEnergyChart from '@/components/Charts/PowerEnergyChart'
import EmissionsChart from '@/components/Charts/EmissionsChart'
import EmissionIntensityChart from '@/components/Charts/EmissionIntensityChart'
import EnergyCompare from '@/components/Energy/Charts/CompareChart'
import PriceChart from '@/components/Charts/PriceChart'
import TemperatureChart from '@/components/Energy/Charts/TemperatureChart'

export default {
  components: {
    PowerEnergyChart,
    EmissionsChart,
    EmissionIntensityChart,
    EnergyCompare,
    PriceChart,
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
      filteredDates: 'regionEnergy/filteredDates',
      currentDataset: 'regionEnergy/currentDataset',
      domainEmissions: 'regionEnergy/domainEmissions',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainDemandPrice: 'regionEnergy/domainDemandPrice',
      domainPrice: 'regionEnergy/domainPrice',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions',

      averageEmissions: 'energy/emissions/averageEmissions',
      emissionIntensityData: 'energy/emissions/emissionIntensityData',
      averageEmissionIntensity: 'energy/emissions/averageEmissionIntensity',

      chartType: 'chartOptionsPowerEnergy/chartType',

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

    isTypeChangeSinceLine() {
      return this.chartType === OPTIONS.CHART_CHANGE_SINCE_LINE
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
      const isNemOrAu = this.regionId === 'nem' || this.regionId === 'au'
      if (isNemOrAu && !this.tabletBreak) {
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
    }
  },

  created() {
    this.clearHoverFocus()
    this.setEmissionsStepCurve()
    this.zoomExtent = this.filteredDates
  },

  methods: {
    ...mapMutations({
      setFocusDate: 'visInteract/focusDate',
      setFilteredDates: 'regionEnergy/filteredDates',
      setChangeSinceDataset: 'regionEnergy/changeSinceDataset',
      setCompareDifference: 'compareDifference',
      setPowerEnergyDisplayUnit: 'chartOptionsPowerEnergy/displayUnit'
    }),
    ...mapActions({
      setEmissionsStepCurve: 'chartOptionsEmissionsVolume/setStepCurve'
    }),
    clearHoverFocus() {
      this.isHovering = false
      this.hoverDate = null
      this.setFocusDate(null)
    },
    getDataByTime(dataset, time) {
      return dataset.find((d) => d.time === time)
    },
    updateFilteredDates(filteredDates) {
      this.zoomExtent = filteredDates
      this.setFilteredDates(filteredDates)
    },
    updateCompareData() {
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
            const newCompareDates = compareDates.filter((d) => d !== hoverTime)
            if (newCompareDates.length === 1) {
              compareDates = newCompareDates
              newCompare = true
            } else {
              compareDates.pop()
            }
          }
          if (compareDates.length < 2 && !newCompare) {
            const newCompareDates = compareDates.filter((d) => d !== hoverTime)
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
        let endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )
        if (this.interval === 'Fin Year') {
          startTime = addYears(startTime, 2)
          endTime = addYears(endTime, 1)
        }

        filteredDates = [startTime, endTime]
      } else {
        filteredDates = []
      }

      this.updateFilteredDates(filteredDates)
    },

    handleSelectedDatasetChange(ds) {
      if (this.isTypeChangeSinceLine) {
        this.setChangeSinceDataset(ds)
      }
      this.selectedDataset = ds
      this.updateCompareData()
    },

    handleDisplayUnitChange(unit) {
      this.setPowerEnergyDisplayUnit(unit)
      this.selectedUnit = unit
    }
  }
}
</script>
