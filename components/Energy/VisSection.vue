<template>
  <section>
    <power-energy-chart
      @svgClick="handleSvgClick"
    />

    <!-- <energy-compare
      :domains="domains"
      :compare-data="compareData"
    /> -->

    <price-market-value-chart v-if="ready && domainPriceMarketValue.length > 0"/>

  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { min, max } from 'd3-array'
import _cloneDeep from 'lodash.clonedeep'

import PowerEnergyChart from '@/components/Energy/PowerEnergyChart'
import EnergyCompare from '@/components/Energy/Compare2'
import PriceMarketValueChart from '@/components/Energy/PriceMarketValueChart'
import DateDisplay from '@/services/DateDisplay.js'
import AxisTicks from '@/services/axisTicks.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'

import ChartHeader from '@/components/Vis/ChartHeader.vue'
import Chart from '@/components/Vis/Chart.vue'
import DateBrush from '@/components/Vis/DateBrush.vue'

export default {
  components: {
    PowerEnergyChart,
    EnergyCompare,
    PriceMarketValueChart,
    ChartHeader,
    Chart,
    DateBrush
  },

  data() {
    return {
      compareData: []
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      compareDifference: 'compareDifference',
      compareDates: 'compareDates',
      hoverDate: 'visInteract/hoverDate',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      ready: 'regionEnergy/ready',
      currentDatasetFlat: 'regionEnergy/currentDatasetFlat',
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
      setFocusDate: 'visInteract/focusDate',
      setIsFocusing: 'visInteract/isFocusing'
    }),
    getDataByTime(dataset, time) {
      return dataset.find(d => d.time === time)
    },
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
    handleSvgClick(metaKey) {
      if (metaKey && this.focusOn && !this.compareDifference) {
        this.$store.dispatch('compareDifference', true)
        this.setIsFocusing(false)
        const hoverTime = this.hoverDate.valueOf()
        const focusTime = this.focusDate.valueOf()
        const firstData = this.getDataByTime(this.currentDatasetFlat, focusTime)
        const secondData = this.getDataByTime(
          this.currentDatasetFlat,
          hoverTime
        )
        setTimeout(() => {
          this.$store.dispatch('compareDates', [focusTime, hoverTime])
          this.compareData = [firstData, secondData].slice()
        }, 10)
      } else {
        this.setIsFocusing(false)
        if (this.compareDifference) {
          const hoverTime = this.hoverDate.valueOf()
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
            this.focusDate.valueOf() === this.hoverDate.valueOf()
          ) {
            this.setFocusDate(null)
            this.setIsFocusing(false)
          } else {
            this.setFocusDate(this.hoverDate)
            this.setIsFocusing(true)
          }
        }
      }
    }
  }
}
</script>
