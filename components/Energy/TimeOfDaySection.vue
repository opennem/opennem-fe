<template>
  <div 
    class="time-of-day-section" 
    style="margin-left: 1rem;">
    <!-- <header>
      <GroupSelector />
      <DomainSelector 
        :domains="allDomains" 
        @domainSelect="(domain) => selectedDomain = domain" />
    </header> -->

    <div 
      v-for="ds in datasets" 
      :key="ds.id">
      <h3 style="margin-left: 0.6rem; font-weight: bold;">{{ ds.label }}</h3>
      <TimeOfDay
        :domains="timeDomains"
        :dataset="ds.data"
        :x-ticks="xTicks"
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
import { utcMinute } from 'd3-time'
import { utcFormat } from 'd3-time-format'
import addMinutes from 'date-fns/addMinutes'
import subDays from 'date-fns/subDays'
import { CHART_CURVE_SMOOTH } from '@/constants/chart-options.js'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'
import GroupSelector from '~/components/ui/FuelTechGroupSelector'
import DomainSelector from './DomainSelector.vue'
import TimeOfDay from './TimeOfDay.vue'

function getX(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

function getDay(d) {
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()

  return `${year}-${month}-${day}`
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

function getTimebucket(interval) {
  let utcCurrent = new Date()
  utcCurrent.setUTCDate(utcCurrent.getDate());
  utcCurrent.setUTCHours(0, 0, 0, 0)
  const b = []

  let x = getX(utcCurrent)

  for (let i = 0; i < 1440 / interval; i++) {
    b.push({ x, date: utcCurrent, time: utcCurrent.getTime() })
    utcCurrent = addMinutes(utcCurrent, interval)
    x = getX(utcCurrent)
  }

  return b
}

export default {
  components: {
    MultiLine,
    DateBrush,
    GroupSelector,
    DomainSelector,
    TimeOfDay
  },

  data() {
    return {
      selectedDomain: null,
      todayKey: null,
      hoverDate: null,
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

      const getColour = (key) => {
        if (key === '_average') return '#e34a33'
        return this.todayKey === key ? 'steelblue' : '#ccc'
      }

      const datasetKeys = keys.map((key) => {
        return {
          domain: key,
          id: key,
          colour: getColour(key)
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

    dataset() {
      return this.getTimeBucket(this.selectedDomain)
    }
  },


  created() {
    this.xTicks = utcMinute.every(60)
    this.tickFormat = utcFormat('%H:%M')
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
      // this.$emit('dateHover', date)
      this.hoverDate = utcMinute.every(this.intervalVal).round(date)
      
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
        const x = getX(date)
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