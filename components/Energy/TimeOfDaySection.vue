<template>
  <div 
    class="time-of-day-section" 
    style="margin-left: 1rem;">

    <header>
      <div class="chart-title">
        An Average Day
      </div>
    </header>

    <MultiLine
      :svg-height="400"
      :domains1="currentDomainPowerEnergy"
      :dataset1="averagesDataset"
      :y1-max="averageYMax"
      :y1-min="averageYMin"
      :y1-ticks="yTicks"
      :x-ticks="xTicks"
      :curve="chartCurve"
      :date-hovered="hoverDate"
      :stacked="true"
      :show-cursor-dots="false"
      :cursor-type="'line'"
      :margin-left="0"
      :append-datapoint="false"
      class="vis-chart"
      @date-hover="(evt, date) => handleDateHover(date)"
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

    <div 
      v-for="ds in datasets" 
      :key="ds.id"
      style="padding-bottom: 1rem; margin-bottom: 1rem;">
      <TimeOfDay
        :title="ds.label"
        :domains="timeDomains"
        :dataset="ds.data"
        :y-ticks="yTicks"
        :tick-format="tickFormat"
        :second-tick-format="secondTickFormat"
        :curve="chartCurve"
        :y-min="ds.yMin"
        :y-max="ds.yMax"
        :hover-date="hoverDate"
        :today-key="todayKey"
        @date-hover="handleDateHover"
      />
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
import { CHART_CURVE_SMOOTH } from '@/constants/chart-options.js'
import DateDisplay from '@/services/DateDisplay.js'
import MultiLine from '@/components/Vis/MultiLine'
import StackedArea from '../Vis/StackedArea.vue'
import DateBrush from '@/components/Vis/DateBrush'
import GroupSelector from '~/components/ui/FuelTechGroupSelector'
import TimeOfDay from './TimeOfDay.vue'

function getDay(d) {
  return utcFormat('%e %b %Y')(d)
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
    TimeOfDay
  },

  data() {
    return {
      selectedDomain: null,
      todayKey: null,
      hoverDate: null,
      xTicks: utcHour.every(2)
    }
  },

  computed: {
    ...mapGetters({
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDataset: 'regionEnergy/currentDataset',
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      hiddenFuelTechs: 'hiddenFuelTechs'
    }),
    
    intervalVal() {
      return this.interval === '5m' ? 5 : 30
    },

    rangeVal() {
      if (this.range === '7D') return 7
      if (this.range === '3D') return 3
      if (this.range === '1D') return 1
      return 1
    },

    allDomains() {
      if (!this.currentDomainPowerEnergy) return []
      
      const filtered = this.currentDomainPowerEnergy.filter((domain) => {
        const ft = domain.fuelTech || domain.group
        return !this.hiddenFuelTechs.includes(ft)
      })

      return filtered.reverse()
    },

    timeDomains() {
      const keys = Object.keys(this.dataset[0]).filter((key) => {
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

    datasets() {
      const datasets = this.allDomains.map(domain => {
        const data = this.getTimeBucket(domain.id)
        return {
          id: domain.id,
          label: domain.label,
          data: this.getTimeBucket(domain.id),
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

    dataset() {
      return this.getTimeBucket(this.selectedDomain)
    }
  },


  created() {
    this.yTicks = []
    this.tickFormat = (d) => getTimeLabel(d)
    this.secondTickFormat = () => ''
    this.chartCurve = CHART_CURVE_SMOOTH

    let utcCurrent = new Date()
    utcCurrent.setUTCDate(utcCurrent.getDate());
    utcCurrent.setUTCHours(0, 0, 0, 0)

    this.todayKey = getDay(utcCurrent)
  },

  mounted() {
    // console.log(this.currentDomainPowerEnergy)
  },

  methods: {
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

    getTimeBucket(domain) {
      const dataset = this.currentDataset.map((d) => {
        return {
          date: d.date,
          time: d.time,
          value: d[domain],
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
</style>