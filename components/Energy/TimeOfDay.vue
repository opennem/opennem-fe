<template>
  <div class="time-of-day">
    <header>
      <GroupSelector />
      <DomainSelector 
        :domains="allDomains" 
        @domainSelect="(domain) => selectedDomain = domain" />
    </header>

    <div class="vis-wrapper">
      <MultiLine
        :svg-height="400"
        :domains1="timeDomains"
        :dataset1="dataset"
        :y1-max="yLineMax"
        :y1-min="yLineMin"
        :x-ticks="xTicks"
        :curve="chartCurve"
        class="vis-chart"
      />
      <DateBrush
        :dataset="dataset"
        :x-ticks="xTicks"
        :tick-format="tickFormat"
        :second-tick-format="secondTickFormat"
        class="date-brush vis-chart"
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
import startOfToday from 'date-fns/startOfToday'
import isToday from 'date-fns/isToday'
import format from 'date-fns/format'

import { CHART_CURVE_SMOOTH } from '@/constants/chart-options.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'
import GroupSelector from '~/components/ui/FuelTechGroupSelector'
import DomainSelector from './DomainSelector.vue'

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

export default {
  components: {
    MultiLine,
    DateBrush,
    GroupSelector,
    DomainSelector
  },

  data() {
    return {
      selectedDomain: null,
      todayKey: null,
    }
  },

  computed: {
    ...mapGetters({
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDataset: 'regionEnergy/currentDataset',
      interval: 'interval',
    }),

    allDomains() {
      return this.currentDomainPowerEnergy
        ? _cloneDeep(this.currentDomainPowerEnergy).reverse()
        : []
    },

    timeDomains() {
      const keys = Object.keys(this.dataset[0]).filter((key) => {
        return key !== 'x' && key !== 'date' && key !== 'time'
      })

      const datasetKeys = keys.map((key) => {
        return {
          domain: key,
          id: key,
          colour: this.todayKey === key ? 'steelblue' : '#ccc'
        }
      })  

      return [...datasetKeys, {
        domain: '_average',
        id: '_average',
        colour: '#e34a33'
      }]
    },

    dataset() {
      const interval = this.interval === '5m' ? 5 : 30
      const dataset = this.currentDataset.map((d) => {
        return {
          date: d.date,
          time: d.time,
          value: d[this.selectedDomain],
        }
      })

      let utcCurrent = new Date()
      utcCurrent.setUTCDate(18);
      utcCurrent.setUTCHours(0, 0, 0)
      const bucket = []

      let x = getX(utcCurrent)

      for (let i = 0; i < 1440 / interval; i++) {
        bucket.push({ x, date: utcCurrent, time: utcCurrent.getTime() })
        utcCurrent = addMinutes(utcCurrent, interval)
        x = getX(utcCurrent)
      }

      dataset.forEach(d => {
        const date = d.date
        const day = getDay(date)
        const x = getX(date)
        const find = bucket.find(b => b.x === x)
        find[day] = d.value
      })

      const keys = Object.keys(bucket[0]).filter((key) => {
        return key !== 'x' && key !== 'date' && key !== 'time'
      })

      bucket.forEach(b => {
        let total = 0
        keys.forEach(key => {
          total += b[key] || 0
        })

        b._average = total / keys.length
      })

      console.log('bucket', bucket)

      return bucket
    },

    yLineMin() {
      let min = 0

      this.dataset.forEach((d) => {
        this.timeDomains.forEach((domain) => {
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

      this.dataset.forEach((d) => {
        this.timeDomains.forEach((domain) => {
          const val = d[domain.id]
          if (val > max) {
            max = val
          }
        })
      })

      return max
    }
  },

  watch: {
    dataset(val) {
      console.log(val)
    },
    currentDomainPowerEnergy(val) {
      console.log('changed', val)
    },
    yLineMax(val) {
      console.log(val)
    }
  },

  created() {
    this.xTicks = utcMinute.every(60)
    this.tickFormat = utcFormat('%H:%M')
    this.secondTickFormat = AxisTimeFormats.secondaryFormat
    this.chartCurve = CHART_CURVE_SMOOTH

    let utcCurrent = new Date()
    utcCurrent.setUTCDate(utcCurrent.getDate());
    utcCurrent.setUTCHours(0, 0, 0)

    this.todayKey = getDay(utcCurrent)
  },

  mounted() {
    console.log(this.currentDomainPowerEnergy)
  }
}
</script>

<style lang="scss" scoped>
.time-of-day {
  padding: 1rem;
  text-align: center;
}
header {
  width: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
  margin-bottom: 1rem;
  gap: 1rem;
}
</style>