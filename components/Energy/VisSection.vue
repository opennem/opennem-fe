<template>
  <section>
    <div class="power-energy-vis">
      <chart-header :show="false" />
      <multi-line
        v-if="ready"
        :svg-height="300"
        :domains1="powerEnergyDomains"
        :dataset1="energyDatasetByInterval"
        :y1-max="35000"
        :y1-min="0"
        :x-ticks="xTicks"
        :draw-incomplete-bucket="false"
        :stacked="true"
        @date-hover="handleDateHover"
        @domain-hover="handleDomainHover"
        @enter="handleVisEnter"
        @leave="handleVisLeave" />
      <date-brush
        v-if="ready"
        :dataset="energyDatasetByInterval"
        :x-ticks="xTicks"
        :tick-format="tickFormat"
        :second-tick-format="secondTickFormat"
        class="date-brush"
        @date-hover="handleDateHover"
        @enter="handleVisEnter"
        @leave="handleVisLeave" />
    </div>

    <div class="temperature-vis">
      <chart-header :show="false" />
      <multi-line
        v-if="ready"
        :svg-height="200"
        :domains1="temperatureDomains"
        :dataset1="temperatureDataset"
        :y1-max="50"
        :y1-min="0"
        :x-ticks="xTicks"
        :draw-incomplete-bucket="false"
        @date-hover="handleDateHover"
        @domain-hover="handleDomainHover"
        @enter="handleVisEnter"
        @leave="handleVisLeave" />
    </div>
    
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import ChartHeader from '@/components/Vis/ChartHeader.vue'
import MultiLine from '@/components/Vis/MultiLine.vue'
import DateBrush from '@/components/Vis/DateBrush.vue'
import AxisTicks from '@/services/axisTicks.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'

export default {
  components: {
    ChartHeader,
    MultiLine,
    DateBrush
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      ready: 'regionEnergy/ready',
      powerEnergyDomains: 'regionEnergy/powerEnergyDomains',
      energyDatasetByInterval: 'regionEnergy/energyDatasetByInterval',
      temperatureDataset: 'regionEnergy/temperatureDataset',
      temperatureDomains: 'regionEnergy/temperatureDomains'
    }),
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
