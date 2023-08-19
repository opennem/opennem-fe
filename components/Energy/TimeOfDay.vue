<template>
  <div class="time-of-day">
    <header>
      <GroupSelector />
      <DomainSelector 
        :domains="allDomains" 
        @domainSelect="(domain) => selectedDomain = domain" />
    </header>

    <div style="display: flex;">
      <div 
        style="width: 80%" 
        class="vis-wrapper">
        <MultiLine
          :svg-height="400"
          :domains1="timeDomains"
          :dataset1="dataset"
          :y1-max="yLineMax"
          :y1-min="yLineMin"
          :x-ticks="xTicks"
          :curve="chartCurve"
          :date-hovered="hoverDate"
          class="vis-chart"
          @date-hover="handleDateHover"
          @domain-hover="handleDomainHover"
          @enter="handleVisEnter"
          @leave="handleVisLeave"
        />
        <DateBrush
          :dataset="dataset"
          :x-ticks="xTicks"
          :tick-format="tickFormat"
          :second-tick-format="secondTickFormat"
          class="date-brush vis-chart"
        />
      </div>

      <div style="width: 20%; font-size: 0.8em;">
        <table class="table is-striped is-narrow is-fullwidth">
          <thead>
            <tr>
              <th 
                colspan="2" 
                style="text-align:right">{{ currentX }}</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(domain, i) in tableRowDomains" 
              :key="`${domain.id}-${i}`"
              style="font-weight: bold;"
              :style="{ color: getTextColour(domain.id) }">
              <td>{{ domain.id }}</td>
              <td style="text-align: right;">{{ domain.value | formatValue }}</td>
            </tr>
          </tbody>
        </table>
      </div>
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
import startOfToday from 'date-fns/startOfToday'
import isToday from 'date-fns/isToday'
import format from 'date-fns/format'
import DateDisplay from '@/services/DateDisplay.js'
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
      hoverDate: null,
      hoverValues: null,
      currentX: 'time'
    }
  },

  computed: {
    ...mapGetters({
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDataset: 'regionEnergy/currentDataset',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
    }),
    
    intervalVal() {
      return this.interval === '5m' ? 5 : 30
    },

    allDomains() {
      return this.currentDomainPowerEnergy
        ? _cloneDeep(this.currentDomainPowerEnergy).reverse()
        : []
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

    tableRowDomains() {
      return this.timeDomains.map((domain) => {
        return {
          id: domain.id,
          value: this.hoverValues ? this.hoverValues[domain.id] : null
        }
      })  
    },

    dataset() {
      const interval = this.intervalVal
      const dataset = this.currentDataset.map((d) => {
        return {
          date: d.date,
          time: d.time,
          value: d[this.selectedDomain],
        }
      })

      console.log('dataset', dataset)

      // TODO: maybe create dayKeys using dataset start/last time instead
      const dayKeys = (function() {
        const keys = []
        let utcCurrent = new Date()
        utcCurrent.setUTCDate(utcCurrent.getDate());
        utcCurrent.setUTCHours(0, 0, 0, 0)

        for (let i = 0; i < 7; i++) {
          keys.push(getDay(utcCurrent))
          utcCurrent = subDays(utcCurrent, 1)
        }

        return keys
      })()

      const timeBucket = (function() {
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
      })()

      console.log('dayKeys', dayKeys)

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

      console.log('timeBucket', timeBucket)

      return timeBucket
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
    yLineMax(val) {
      // console.log(val)
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
    console.log(this.currentDomainPowerEnergy)
  },

  methods: {
    handleDomainHover(domain) {
      // console.log(domain)
    },
    handleDateHover(evt, date) {
      // this.$emit('dateHover', date)
      this.hoverDate = utcMinute.every(this.intervalVal).round(date)
      this.hoverValues = this.dataset.find(d => d.time === this.hoverDate.getTime())
      if (this.hoverValues) {
        this.currentX = this.hoverValues.x
      }
      console.log('hovervalues', this.hoverValues)
    },
    handleVisEnter() {
      // this.$emit('isHovering', true)
    },
    handleVisLeave() {
      // this.$emit('isHovering', false)
    },
    getTextColour(id) {
      if (id === '_average') return '#e34a33'
      return this.todayKey === id ? 'steelblue' : '#123123'
    }
  }
}
</script>

<style lang="scss" scoped>
.time-of-day {
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