<template>
  <section>
    <power-energy-chart
      v-if="ready"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
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
      v-if="ready && domainEmissions.length > 0" 
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick"
    />

    <emission-intensity-chart 
      v-if="ready && domainEmissions.length > 0"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick" />

    <price-market-value-chart 
      v-if="ready && domainPrice.length > 0" 
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
import PowerEnergyChart from '@/components/Energy/Charts/PowerEnergyChart'
import EmissionsChart from '@/components/Energy/Charts/EmissionsChart'
import EmissionIntensityChart from '@/components/Energy/Charts/EmissionIntensityChart'
import EnergyCompare from '@/components/Energy/Charts/CompareChart'
import PriceMarketValueChart from '@/components/Energy/Charts/PriceMarketValueChart'
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
      range: 'range',
      interval: 'interval',
      compareDifference: 'compareDifference',
      compareDates: 'compareDates',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      ready: 'regionEnergy/ready',
      currentDataset: 'regionEnergy/currentDataset',
      domainEmissions: 'regionEnergy/domainEmissions',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainPrice: 'regionEnergy/domainPrice',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy'
    }),
    domains() {
      return _cloneDeep(this.currentDomainPowerEnergy).reverse()
    }
  },

  methods: {
    ...mapMutations({
      setFocusDate: 'visInteract/focusDate',
      setFilteredDates: 'regionEnergy/filteredDates'
    }),
    getDataByTime(dataset, time) {
      return dataset.find(d => d.time === time)
    },
    updateFilteredDates(filteredDates) {
      this.zoomExtent = filteredDates
      this.setFilteredDates(filteredDates)
    },
    handleDateHover(date) {
      const closestDate = DateDisplay.snapToClosestInterval(this.interval, date)
      this.hoverDate = closestDate
      this.$emit('dateHover', closestDate)
    },
    handleIsHovering(hover) {
      this.isHovering = hover
      this.$emit('isHovering', hover)
    },
    handleSvgClick(metaKey) {
      if (metaKey && this.focusOn && !this.compareDifference) {
        this.$store.dispatch('compareDifference', true)
        const hoverTime = this.hoverDate.getTime()
        const focusTime = this.focusDate.getTime()
        const firstData = this.getDataByTime(this.selectedDataset, focusTime)
        const secondData = this.getDataByTime(this.selectedDataset, hoverTime)

        setTimeout(() => {
          this.$store.dispatch('compareDates', [focusTime, hoverTime])
          this.compareData = [firstData, secondData].slice()
          this.setFocusDate(null)
        }, 10)
      } else {
        if (this.compareDifference) {
          const hoverTime = this.hoverDate.getTime()
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
          if (
            this.focusDate &&
            this.focusDate.getTime() === this.hoverDate.getTime()
          ) {
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
