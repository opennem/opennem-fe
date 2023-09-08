<template>
  <div 
    class="time-of-day-section" 
    style="margin-left: 1rem;">

    <div class="vis-wrapper">
      <TimeOfDayChartHeader
        :title="'An average day'"
        :tooltip-values="tooltipValues"
      />

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
        :stacked="true"
        :show-cursor-dots="false"
        :cursor-type="'line'"
        :margin-left="0"
        :append-datapoint="false"
        class="vis-chart"
        @date-hover="(evt, date) => handleDateHover(date)"
        @domain-hover="handleDomainHover"
      />
      <DateBrush
        :dataset="averagesDataset"
        :x-ticks="xTicks"
        :tick-format="tickFormat"
        :second-tick-format="secondTickFormat"
        :margin-left="0"
        :append-datapoint="false"
        class="date-brush vis-chart"
      />
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 1%;">
      <div 
        v-for="ds in datasetsWithPositiveLoads" 
        :key="ds.id"
        class="sparkline-button"
        style="margin-bottom: 1%;"
        :style="{ width: sparklineButtonWidth }"
        @click="() => selectedToD = ds">
        <TimeOfDaySparkline
          :title="ds.label"
          :domains="filteredTimeDomains"
          :dataset="ds.data"
          :y-ticks="yTicks"
          :tick-format="tickFormat"
          :second-tick-format="secondTickFormat"
          :curve="ds.label === 'Price' ? curveStep : curveSmooth"
          :y-min="ds.yMin"
          :y-max="ds.yMax"
          :today-key="todayKey"
        />
      </div>
    </div>

    <div 
      v-show="selectedToD" 
      class="time-of-day-detailed"
      @click="() => (selectedToD = null)">
      <div 
        class="time-of-day-chart"
        @click.stop>
        <!-- <button
          class="button is-primary"
          @click="() => (selectedToD = null)"
        >
          Close
        </button> -->

        <div 
          v-if="selectedToD"
          style="width: 100%">
          <TimeOfDay
            :title="selectedToD.label"
            :domains="timeDomains"
            :dataset="selectedToD.data"
            :y-ticks="yTicks"
            :tick-format="tickFormat"
            :second-tick-format="secondTickFormat"
            :curve="selectedToD.label === 'Price' ? curveStep : curveSmooth"
            :y-min="selectedToD.yMin"
            :y-max="selectedToD.yMax"
            :hover-date="hoverDate"
            :today-key="todayKey"
            @date-hover="handleDateHover"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import { utcHour } from 'd3-time'
import { utcFormat } from 'd3-time-format'
import addMinutes from 'date-fns/addMinutes'
import subDays from 'date-fns/subDays'
import { CHART_CURVE_SMOOTH, CHART_CURVE_STEP } from '@/constants/chart-options.js'
import DateDisplay from '@/services/DateDisplay.js'
import MultiLine from '@/components/Vis/MultiLine'
import StackedArea from '../Vis/StackedArea.vue'
import DateBrush from '@/components/Vis/DateBrush'
import GroupSelector from '~/components/ui/FuelTechGroupSelector'
import TimeOfDay from './TimeOfDay.vue'
import TimeOfDaySparkline from './TimeOfDaySparkline.vue'
import TimeOfDayChartHeader from './TimeOfDayChartHeader.vue'

function getDay(d) {
  return utcFormat(`%e %b`)(d)
}

function getDayKeys(range) {
  const keys = []
  let utcCurrent = new Date()
  utcCurrent.setUTCDate(utcCurrent.getDate());
  utcCurrent.setUTCHours(0, 0, 0, 0)

  for (let i = 0; i < range; i++) {
    keys.push(getDay(utcCurrent))
    utcCurrent = subDays(utcCurrent, 1)
  }

  return keys
}

function getTimeLabel(d) {
  const date = new Date(d)
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const ampm = hours >= 12 ? 'pm' : 'am'
  const hour = function() {
    return hours === 0 || hours === 12 ? 12 : hours % 12
  }()
  const min = minutes === 0 ? '' : `:${(minutes + '').padStart(2, '0')}`
  return `${hour}${min}${ampm}`
}

function getTimebucket(interval) {
  let utcCurrent = new Date()
  utcCurrent.setUTCDate(utcCurrent.getDate());
  utcCurrent.setUTCHours(0, 0, 0, 0)
  const b = []

  let x = getTimeLabel(utcCurrent)

  for (let i = 0; i < 1440 / interval; i++) {
    b.push({ x, date: utcCurrent, time: utcCurrent.getTime() })
    utcCurrent = addMinutes(utcCurrent, interval)
    x = getTimeLabel(utcCurrent)
  }

  return b
}

export default {
  components: {
    StackedArea,
    MultiLine,
    DateBrush,
    GroupSelector,
    TimeOfDay,
    TimeOfDaySparkline,
    TimeOfDayChartHeader
  },

  data() {
    return {
      todayKey: null,
      hoverDate: null,
      highlightFuelTech: null,
      xTicks: utcHour.every(2),
      curveSmooth: CHART_CURVE_SMOOTH,
      curveStep: CHART_CURVE_STEP,
      selectedToD: null
    }
  },

  computed: {
    ...mapGetters({
      wideScreenBreak: 'app/wideScreenBreak',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainPrice: 'regionEnergy/domainPrice',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDataset: 'regionEnergy/currentDataset',
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      hiddenFuelTechs: 'hiddenFuelTechs',
      chartEnergyRenewablesLine: 'chartOptionsPowerEnergy/chartEnergyRenewablesLine',
      chartEnergyNetLine: 'chartOptionsPowerEnergy/chartEnergyNetLine'
    }),

    sparklineButtonWidth() {
      return this.wideScreenBreak ? '24%' : '19%';
    },
    
    intervalVal() {
      return this.interval === '5m' ? 5 : 30
    },

    rangeVal() {
      if (this.range === '30D') return 30
      if (this.range === '7D') return 7
      if (this.range === '3D') return 3
      if (this.range === '1D') return 1
      return 1
    },

    allDomains() {
      const price = []
      if (!this.currentDomainPowerEnergy) return []
      if (this.domainPrice.length > 0) price.push(this.domainPrice[0])

      const filtered = this.currentDomainPowerEnergy.filter((domain) => {
        const ft = domain.fuelTech || domain.group
        return !this.hiddenFuelTechs.includes(ft)
      })

      const domainTotalRenewables = []
      if (this.chartEnergyRenewablesLine) {
        domainTotalRenewables.push({
          domain: '_totalRenewables',
          id: '_totalRenewables',
          label: 'Renewables'
        })
      }
      const domainTotalNetGeneration = []
      if (this.chartEnergyNetLine) {
        domainTotalNetGeneration.push({
          domain: '_total',
          id: '_total',
          label: 'Net'
        })
      }
      
      return [
        ...filtered.reverse(),
        ...price,
        ...this.domainTemperature,
        ...domainTotalNetGeneration,
        ...domainTotalRenewables
      ]
    },

    timeDomains() {
      const bucket = this.getDataBucket()
      const keys = Object.keys(bucket[0]).filter((key) => {
          return key !== 'x' && key !== 'date' && key !== 'time'
        })

        const getLabel = (key) => {
          if (key === '_average') return 'Average'
          return key
        }

        const datasetKeys = keys.map((key) => {
          return {
            domain: key,
            id: key,
            label: getLabel(key)
          }
        })  

        return datasetKeys
      
    },

    filteredTimeDomains() {
      return this.timeDomains.filter(d => d.id === '_average' || d.id === this.todayKey)
    },

    datasets() {
      const datasets = this.allDomains.map(domain => {
        const data = this.getDataBucket(domain.id, domain.category, false)
        return {
          id: domain.id,
          label: domain.label,
          data,
          yMin: this.getYMin(data),
          yMax: this.getYMax(data)
        }
      })

      console.log('datasets', datasets)

      return datasets
    },

    datasetsWithPositiveLoads() {
      const datasets = this.allDomains.map(domain => {
        const data = this.getDataBucket(domain.id, domain.category, true)
        return {
          id: domain.id,
          label: domain.label,
          data,
          yMin: this.getYMin(data),
          yMax: this.getYMax(data)
        }
      })

      console.log('datasets', datasets)

      return datasets
    },

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

      console.log('average datasets', averagesDs)

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
  },

  created() {
    this.yTicks = []
    this.tickFormat = (d) => getTimeLabel(d)
    this.secondTickFormat = () => ''

    let utcCurrent = new Date()
    utcCurrent.setUTCDate(utcCurrent.getDate());
    utcCurrent.setUTCHours(0, 0, 0, 0)

    this.todayKey = getDay(utcCurrent)
  },

  mounted() {
    // console.log(this.currentDomainPowerEnergy)
  },

  methods: {
    handleDomainHover(domain) {
      this.highlightFuelTech = domain
    },

    handleDateHover(date) {
      this.hoverDate = DateDisplay.getClosestDateByInterval(
        date,
        this.interval,
        this.filterPeriod
      )
    },

    getYMin(dataset) {
      let min = 0

      dataset.forEach((d) => {
        this.timeDomains.forEach((domain) => {
          const val = d[domain.id]
          if (val < min) {
            min = val
          }
        })
      })

      return min
    },

    getYMax(dataset) {
      let max = 0

      dataset.forEach((d) => {
        this.timeDomains.forEach((domain) => {
          const val = d[domain.id]
          if (val > max) {
            max = val
          }
        })
      })

      return max
    },

    getDataBucket(domain, category, positiveLoads) {
      const dataset = this.currentDataset.map((d) => {
        return {
          date: d.date,
          time: d.time,
          value: positiveLoads && category === 'load' ? -d[domain] : d[domain], // invert load values so it shows up as positive values
        }
      })

      // TODO: maybe create dayKeys using dataset start/last time instead
      const dayKeys = getDayKeys(this.rangeVal)
      const timeBucket = getTimebucket(this.intervalVal)

      dataset.forEach(d => {
        const date = d.date
        const day = getDay(date)
        const x = getTimeLabel(date)
        const find = timeBucket.find(b => b.x === x)
        find[day] = d.value
      })

      timeBucket.forEach(b => {
        let total = 0
        let keyCount = 0
        dayKeys.forEach(key => {
          if (b[key] !== undefined && b[key] !== null) keyCount++
          total += b[key] || 0
        })

        b._average = total / keyCount
      })

      return timeBucket
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
.chart-title {
  font-size: 13px;
  font-family: $header-font-family;
  font-weight: bold;
}

.time-of-day-detailed {
  position: fixed;
  top: 0;
  left: 0; 
  width: 100%;
  height: 100vh;
  background-color: rgba(0,0,0,0.5);
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.time-of-day-chart {
  width: 100%;
  height: 780px;
  background: $body-background-color;
  overflow-y: auto;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
}
</style>