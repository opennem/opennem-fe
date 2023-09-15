<template>
  <section>
    <ChartHeader
      :title="'Average Time of Day'"
      :tooltip-values="tooltipValues"
    />

    <button
      v-if="zoomRange.length > 0"
      class="button is-rounded is-small reset-btn"
      @click.stop="() => $emit('date-filter', [])"
    >
      Zoom Out
    </button>

    <MultiLine
      :svg-height="400"
      :domains1="currentDomainPowerEnergy"
      :dataset1="averagesDataset"
      :y1-max="averageYMax"
      :y1-min="averageYMin"
      :y1-ticks="yTicks"
      :x-ticks="xTicks"
      :curve="curveSmooth"
      :date-hovered="hoverDate"
      :zoom-range="zoomRange"
      :stacked="true"
      :show-cursor-dots="false"
      :cursor-type="'line'"
      :margin-left="0"
      :append-datapoint="false"
      :positive-y-bg="'transparent'"
      class="vis-chart"
      @date-hover="(evt, date) => $emit('date-hover', date)"
      @domain-hover="(domain) => highlightFuelTech = domain"
    />
    <DateBrush
      :dataset="averagesDataset"
      :x-ticks="xTicks"
      :tick-format="tickFormat"
      :second-tick-format="secondTickFormat"
      :margin-left="0"
      :append-datapoint="false"
      :zoom-range="zoomRange"
      class="date-brush vis-chart"
      @date-hover="(evt, date) => $emit('date-hover', date)"
      @date-filter="(dateRange) => $emit('date-filter', dateRange)"
    />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

import { CHART_CURVE_SMOOTH } from '@/constants/chart-options.js'

import ChartHeader from './ChartHeader.vue'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'

export default {
  components: {
    ChartHeader,
    MultiLine,
    DateBrush
  },

  props: {
    zoomRange: {
      type: Array,
      default: () => []
    },
    datasets: {
      type: Array,
      default: () => []
    },
    hoverDate: {
      type: Date,
      default: null
    },
    // highlightFuelTech: {
    //   type: String,
    //   default: ''
    // },
    yTicks: {
      type: Array,
      default: () => []
    },
    xTicks: {
      type: Function,
      default: () => null
    },
    tickFormat: {
      type: Function,
      default: () => {}
    },
    secondTickFormat: {
      type: Function,
      default: () => {}
    },
  },

  data() {
    return {
      curveSmooth: CHART_CURVE_SMOOTH,
      highlightFuelTech: null
    }
  },

  computed: {
    ...mapGetters({
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
    }),

    averagesDataset() {
      const averagesDs = []

      if (this.datasets.length > 0) {
        this.datasets.forEach(ds => {
          const id = ds.id

          ds.data.forEach((d, i) => {
            if (averagesDs.length !== ds.data.length) {
              averagesDs.push({
                x: d.x,
                date: d.date,
                time: d.time
              })
              averagesDs[i][id] = d._average
            } else {
              averagesDs[i][id] = d._average
            }
          })
        })
      }

      return averagesDs
    },

    averageYMin() {
      let min = 0

      this.averagesDataset.forEach((d) => {
        this.currentDomainPowerEnergy.forEach((domain) => {
          const val = d[domain.id]
          if (val < min) {
            min = val
          }
        })
      })

      return min
    },

    averageYMax() {
      let max = 0

      this.averagesDataset.forEach((d) => {
        let sum = 0
        this.currentDomainPowerEnergy.forEach((domain) => {
          sum += d[domain.id] || 0      
        })

        if (sum > max) {
          max = sum
        }
      })

      return max
    },

    tooltipValues() {
      if (this.highlightFuelTech && this.hoverValues) {
        const ft = this.currentDomainPowerEnergy.find(d => d.id === this.highlightFuelTech)
        return {
          date: `${this.hoverValues.x}`,
          fuelTech: ft?.label,
          fuelTechColour: ft?.colour,
          value: this.hoverValues[this.highlightFuelTech]
        }
      }

      return null
    },

    hoverValues() {
      return this.hoverDate ? this.averagesDataset.find(d => d.time === this.hoverDate.getTime()) : null
    }
  }

}
</script>

<style lang="scss" scoped>
section {
  position: relative;
}
.reset-btn {
  position: absolute;
  top: 39px;
  right: 24px;
}
</style>