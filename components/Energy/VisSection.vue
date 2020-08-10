<template>
  <section>
    <power-energy-chart />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { min, max } from 'd3-array'
import ChartHeader from '@/components/Vis/ChartHeader.vue'
import Chart from '@/components/Vis/Chart.vue'
import DateBrush from '@/components/Vis/DateBrush.vue'
import AxisTicks from '@/services/axisTicks.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'

import PowerEnergyChart from '@/components/Energy/PowerEnergyChart'

export default {
  components: {
    PowerEnergyChart,
    ChartHeader,
    Chart,
    DateBrush
  },

  data() {
    return {
      dateExtent: [new Date('2019-01-01'), new Date('2020-12-31')],
      dateFilter: [],
      stacked: true
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      ready: 'regionEnergy/ready',
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
    }
  }
}
</script>
