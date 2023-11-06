<template>
  <section>
    <ChartHeader
      :title="`Average over last ${parseInt(range)} full days`"
      :tooltip-values="tooltipValues"
    >
      <template v-slot:chart-unit>
        <button 
          class="display-unit" 
          @click="() => $emit('unit-click')">
          {{ chartPowerCurrentUnit }}
        </button>
      </template>
    </ChartHeader>

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
      :should-convert-value="shouldConvertValue"
      :convert-value="convertValue"
      :display-prefix="chartPowerDisplayPrefix"
      class="vis-chart"
      @date-hover="(evt, date) => $emit('date-hover', date)"
      @domain-hover="(domain) => highlightFuelTech = domain"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
      
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
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { CHART_CURVE_SMOOTH } from '@/constants/chart-options.js'
import * as SI from '@/constants/si'
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
    convertValue: {
      type: Function,
      default: () => function () {}
    }
  },

  data() {
    return {
      curveSmooth: CHART_CURVE_SMOOTH,
      highlightFuelTech: null
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      domainPowerEnergy: 'regionEnergy/domainPowerEnergy',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      chartPowerCurrentUnit: 'chartOptionsPowerEnergy/chartPowerCurrentUnit',
      chartPowerDisplayPrefix: 'chartOptionsPowerEnergy/chartPowerDisplayPrefix',
      detailedAveragesDataset: 'timeOfDay/detailedAveragesDataset'
    }),

    shouldConvertValue() {
      return this.chartPowerDisplayPrefix === SI.GIGA
    },

    averagesDataset: {
      get() {
        return this.$store.state.timeOfDay.averagesDataset
      },
      set(val) {
        const averagesDs = []
        const detailedAverages = []

        this.detailedAveragesDataset.forEach(ds => {
          const id = ds.id

          ds.data.forEach((d, i) => {
            if (detailedAverages.length !== ds.data.length) {
              detailedAverages.push({
                x: d.x,
                date: d.date,
                time: d.time
              })
              detailedAverages[i][id] = d._average
            } else {
              detailedAverages[i][id] = d._average
            }
          })
        })

        if (val.length > 0) {
          val.forEach(ds => {
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

          detailedAverages.forEach((d, i) => {
            let total = 0
            this.domainPowerEnergy.forEach(domain => {
              if (domain.renewable) {
                // console.log('domain', domain.id, d[domain.id])
                total += d[domain.id] || 0
              }
            })
            averagesDs[i]._totalRenewables = total
          })

          // const domain = this.currentDomainPowerEnergy.find(d => d.id === id)
          // console.log(id, domain.renewable, ds.data)

        }

        this.setAveragesDataset(averagesDs)
      }
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
        const formatValue = (value, unit) => {
          return `${this.$options.filters.formatValue(value)} ${unit}`
        }
        const ft = this.currentDomainPowerEnergy.find(d => d.id === this.highlightFuelTech)
        const value = this.convertValue(this.hoverValues[this.highlightFuelTech])
        return {
          date: `${this.hoverValues.x}`,
          fuelTech: ft?.label,
          fuelTechColour: ft?.colour,
          value: formatValue(value, this.chartPowerCurrentUnit)
        }
      }

      return null
    },

    hoverValues() {
      return this.hoverDate ? this.averagesDataset.find(d => d.time === this.hoverDate.getTime()) : null
    }
  },

  watch: {
    datasets: {
      immediate: true,
      handler(val) {
        this.averagesDataset = val
      }
    }
  },

  methods: {
    ...mapMutations({
      setAveragesDataset: 'timeOfDay/averagesDataset'
    }),

    handleVisEnter() {
      this.$emit('is-hovering', true)
    },
    handleVisLeave() {
      this.$emit('is-hovering', false)
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
.display-unit {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  background-color: transparent;
  font-size: 10px;
  border: none;
  color: #333;
  position: relative;
  top: -1px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }
}
</style>