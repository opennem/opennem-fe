<template>
  <section>
    <power-energy-chart
      v-if="ready"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      :tick-format="tickFormat"
      :second-tick-format="secondTickFormat"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
      @svgClick="handleSvgClick"
    />

    <energy-compare
      v-if="compareDifference"
      :domains="domains"
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

    <price-market-value-chart 
      v-if="ready && domainPriceMarketValue.length > 0" 
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

import PowerEnergyChart from '@/components/Energy/PowerEnergyChart'
import EmissionsChart from '@/components/Energy/EmissionsChart'
import EnergyCompare from '@/components/Energy/Compare2'
import PriceMarketValueChart from '@/components/Energy/PriceMarketValueChart'
import TemperatureChart from '@/components/Energy/TemperatureChart'
import DateDisplay from '@/services/DateDisplay.js'
import AxisTicks from '@/services/axisTicks.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'

import ChartHeader from '@/components/Vis/ChartHeader.vue'
import Chart from '@/components/Vis/Chart.vue'
import DateBrush from '@/components/Vis/DateBrush.vue'

export default {
  components: {
    PowerEnergyChart,
    EmissionsChart,
    EnergyCompare,
    PriceMarketValueChart,
    TemperatureChart,
    ChartHeader,
    Chart,
    DateBrush
  },

  data() {
    return {
      compareData: [],
      isHovering: false,
      hoverDate: null,
      zoomExtent: []
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
      currentDatasetFlat: 'regionEnergy/currentDatasetFlat',
      domainEmissions: 'regionEnergy/domainEmissions',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainPriceMarketValue: 'regionEnergy/domainPriceMarketValue',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy'
    }),
    domains() {
      return _cloneDeep(this.currentDomainPowerEnergy).reverse()
    },
    yMin() {
      return min(this.currentDatasetFlat, d => d._stackedTotalMin)
    },
    yMax() {
      return max(this.currentDatasetFlat, d => d._stackedTotalMax)
    },
    xTicks() {
      return AxisTicks(this.range, this.interval, false)
    },
    tickFormat() {
      switch (this.interval) {
        case 'Day':
          return AxisTimeFormats.intervalDayTimeFormat
        case 'Week':
          return AxisTimeFormats.intervalWeekTimeFormat
        case 'Month':
          return this.range === 'ALL'
            ? AxisTimeFormats.rangeAllIntervalMonthTimeFormat
            : AxisTimeFormats.intervalMonthTimeFormat
        case 'Fin Year':
          return d => {
            const year = d.getFullYear() + 1 + ''
            return `FY${year.substr(2, 2)}`
          }
        default:
          return AxisTimeFormats.defaultFormat
      }
    },
    secondTickFormat() {
      switch (this.interval) {
        case 'Day':
          return AxisTimeFormats.intervalDaySecondaryTimeFormat
        case 'Week':
          return AxisTimeFormats.intervalWeekSecondaryTimeFormat
        default:
          return AxisTimeFormats.secondaryFormat
      }
    }
  },

  methods: {
    ...mapMutations({
      setIsHovering: 'visInteract/isHovering',
      setDateZoomExtent: 'visInteract/dateZoomExtent',
      setHoverDate: 'visInteract/hoverDate',
      setFocusDate: 'visInteract/focusDate',
      setIsFocusing: 'visInteract/isFocusing'
    }),
    getDataByTime(dataset, time) {
      return dataset.find(d => d.time === time)
    },
    handleDateHover(date) {
      const closestDate = DateDisplay.snapToClosestInterval(this.interval, date)
      this.setHoverDate(closestDate)
      this.hoverDate = closestDate
    },
    handleIsHovering(hover) {
      this.setIsHovering(hover)
      this.isHovering = hover
    },
    handleSvgClick(metaKey) {
      if (metaKey && this.focusOn && !this.compareDifference) {
        this.$store.dispatch('compareDifference', true)
        const hoverTime = this.hoverDate.getTime()
        const focusTime = this.focusDate.getTime()
        const firstData = this.getDataByTime(this.currentDatasetFlat, focusTime)
        const secondData = this.getDataByTime(
          this.currentDatasetFlat,
          hoverTime
        )

        setTimeout(() => {
          this.$store.dispatch('compareDates', [focusTime, hoverTime])
          this.compareData = [firstData, secondData].slice()
          this.setIsFocusing(false)
          this.setFocusDate(null)
        }, 10)
      } else {
        this.setIsFocusing(false)
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
              this.currentDatasetFlat,
              compareDates[0]
            )
            const secondData = this.getDataByTime(
              this.currentDatasetFlat,
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
            this.setIsFocusing(false)
          } else {
            this.setFocusDate(this.hoverDate)
            this.setIsFocusing(true)
          }
        }
      }
    },
    handleZoomExtent(dateRange) {
      // console.log('zoom extent', dateRange)
      if (dateRange && dateRange.length > 0) {
        let startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        const endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )
        // if (this.interval === 'Fin Year') {
        //   startTime = moment(startTime).add(1, 'year')
        // }
        // this.filteredDataset = EnergyDataTransform.filterDataByStartEndDates(
        //   this.dataset,
        //   startTime,
        //   endTime
        // )
        this.setDateZoomExtent([startTime, endTime])
        this.zoomExtent = [startTime, endTime]
      } else {
        this.setDateZoomExtent([])
        this.zoomExtent = []
        // this.filteredDataset = this.dataset
      }
    }
  }
}
</script>
