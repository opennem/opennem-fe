<template>
  <div class="vis-wrapper">
    <MultiLine
      :svg-height="500"
      :domains1="domains"
      :dataset1="dataset"
      :y1-max="yLineMax"
      :y1-min="yLineMin"
      :x-ticks="xTicks"
      :curve="chartCurve"
      class="vis-chart" />
    <DateBrush
      :dataset="dataset"
      :x-ticks="xTicks"
      :tick-format="tickFormat"
      :second-tick-format="secondTickFormat"
      :read-only="true"
      class="date-brush vis-chart" />
  </div>
</template>

<script>
import { timeYear } from 'd3-time'
import { CHART_CURVE_SMOOTH } from '@/constants/chart-options.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'

export default {
  components: {
    MultiLine,
    DateBrush
  },

  props: {
    dataset: {
      type: Array,
      default: () => []
    },
    domains: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    yLineMin() {
      let min = 0

      this.dataset.forEach(d => {
        this.domains.forEach(domain => {
          const val = d[domain.id]
          if (val < min) {
            min = val
          }
        })
      })

      return min
    },

    yLineMax() {
      let max = 0

      this.dataset.forEach(d => {
        this.domains.forEach(domain => {
          const val = d[domain.id]
          if (val > max) {
            max = val
          }
        })
      })

      return max
    }
  },

  created() {
    this.xTicks = timeYear.every(1)
    this.tickFormat = AxisTimeFormats.rangeAllIntervalMonthTimeFormat
    this.secondTickFormat = AxisTimeFormats.secondaryFormat
    this.chartCurve = CHART_CURVE_SMOOTH
  }
}
</script>

<style lang="scss" scoped>
.vis-wrapper {
  margin-right: 1rem;
}
</style>
