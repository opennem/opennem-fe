<template>
  <div 
    class="time-of-day-section" 
    style="margin-left: 1rem;">

    <div 
      v-if="showStackedAverages" 
      class="vis-wrapper"
    >
      <AverageStackedArea
        :zoom-range="zoomRange"
        :datasets="datasets"
        :hover-date="hoverDate"
        :y-ticks="yTicks"
        :x-ticks="xTicks"
        :tick-format="tickFormat"
        :second-tick-format="secondTickFormat"
        :convert-value="convertValue"
        @date-hover="handleDateHover"
        @date-filter="handleZoomRange"
        @unit-click="handleUnitClick"
      />
    </div>

    <div 
      v-if="showSparklines" 
      style="background-color: rgba(255, 255, 255, 0.5); padding: 1rem;  margin-right: 1rem; border-radius: 1rem;">
      <h4>Time of Day</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0 2rem;">
        <div 
          v-for="ds in datasetsWithPositiveLoads" 
          :key="ds.id"
          class="sparkline-button"        
          @click="() => toggleSelected(ds)">
          <DaySparkLines
            :title="ds.label"
            :domains="filteredTimeDomains"
            :dataset="ds.data"
            :y-ticks="yTicks"
            :x-ticks="xTicks"
            :tick-format="tickFormat"
            :second-tick-format="secondTickFormat"
            :curve="ds.label === 'Price' ? curveStep : curveSmooth"
            :y-min="ds.yMin"
            :y-max="ds.yMax"
            :today-key="todayKey"
            :selected="isSelected(ds)"
          />
        </div>
      </div>

      <div 
        v-for="ds in selectedToDs"
        :key="ds.id"
        style="width: 100%; margin-top: 1rem;">
        <DayLines
          :title="ds.label"
          :domains="timeDomains"
          :dataset="ds.data"
          :y-ticks="yTicks"
          :x-ticks="xTicks"
          :tick-format="tickFormat"
          :second-tick-format="secondTickFormat"
          :curve="ds.label === 'Price' ? curveStep : curveSmooth"
          :y-min="ds.yMin"
          :y-max="ds.yMax"
          :hover-date="hoverDate"
          :today-key="todayKey"
          :zoom-range="zoomRange"
          :average-value="formatAverage({
            value: ds.label === 'Price' ? ds.average : convertValue(ds.average),
            type: ds.type,
            unit: ds.label === 'Price' ? '$' : chartPowerCurrentUnit
          })"
          :convert-value="convertValue"
          @date-hover="handleDateHover"
          @date-filter="handleZoomRange"
          @unit-click="handleUnitClick"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import { utcHour } from 'd3-time'
import * as SI from '@/constants/si'
import { CHART_CURVE_SMOOTH, CHART_CURVE_STEP } from '@/constants/chart-options.js'
import DateDisplay from '@/services/DateDisplay.js'
import DayLines from './DayLines.vue'
import DaySparkLines from './DaySparkLines.vue'
import { getDataBucket, getTimeLabel, getDay, getDayKeys } from '@/data/transform/time-of-day.js'
import AverageStackedArea from './AverageStackedArea.vue'
import day from '~/data/helpers/time-groups/day'

export default {
  components: {
    AverageStackedArea,
    DayLines,
    DaySparkLines
  },

  props: {
    showStackedAverages: {
      type: Boolean,
      default: true
    },
    showSparklines: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      hoverDate: null,
      zoomRange: [],
      curveSmooth: CHART_CURVE_SMOOTH,
      curveStep: CHART_CURVE_STEP,
      selectedToD: null,
      dayKeys: [],
      timeDomains: []
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',
      widthBreak: 'app/widthBreak',
      domainTemperature: 'regionEnergy/domainTemperature',
      domainPrice: 'regionEnergy/domainPrice',
      domainDemandPower: 'regionEnergy/domainDemandPower',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      currentDataset: 'regionEnergy/currentDataset',
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      hiddenFuelTechs: 'hiddenFuelTechs',

      selectedToDs: 'timeOfDay/selectedToDs',

      chartPowerCurrentUnit: 'chartOptionsPowerEnergy/chartPowerCurrentUnit',
      chartPowerUnitPrefix: 'chartOptionsPowerEnergy/chartPowerUnitPrefix',
      chartPowerDisplayPrefix: 'chartOptionsPowerEnergy/chartPowerDisplayPrefix'
    }),

    xTicks() {
      return this.zoomRange.length > 0 ? null : utcHour.every(2)
    },

    sparklineButtonWidth() {
      return this.tabletBreak ? '24%' : this.widthBreak ? '19%' : '15.6%';
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

    todayKey() {
      const lastDate = this.currentDataset[this.currentDataset.length - 1].date
      return getDay(lastDate)
    },

    allDomains() {
      const price = []
      if (!this.currentDomainPowerEnergy) return []
      if (this.domainPrice.length > 0) price.push(this.domainPrice[0])

      const domainPower = [...this.currentDomainPowerEnergy]

      const domainTotalRenewables = []
      domainTotalRenewables.push({
        domain: '_totalRenewables',
        id: '_totalRenewables',
        label: 'Renewables'
      })
      const domainTotalNetGeneration = []
      domainTotalNetGeneration.push({
          domain: '_total',
          id: '_total',
          label: 'Net'
        })
      
      return [
        ...domainTotalNetGeneration,
        ...domainTotalRenewables,
        ...domainPower.reverse(),
        ...price,
        ...this.domainTemperature
      ]
    },

    averageStackedDomains() {
      if (!this.currentDomainPowerEnergy) return []

      const filtered = this.currentDomainPowerEnergy.filter((domain) => {
        const ft = domain.fuelTech || domain.group
        return !this.hiddenFuelTechs.includes(ft)
      })
      
      return [...filtered.reverse()]
    },

    filteredTimeDomains() {
      return this.timeDomains.filter(d => d.id === '_average' || d.id === this.todayKey)
    },

    datasets() {
      const datasets = this.averageStackedDomains.map(domain => {
        const { data, average } = getDataBucket({
          data: this.currentDataset,
          domain: domain.id,
          demandDomain: this.domainDemandPower.length > 0 ? this.domainDemandPower[0].id : null,
          isPrice: domain.type === 'price',
          category: domain.category,
          positiveLoads: false,
          interval: this.intervalVal,
          dayKeys: this.dayKeys
        })
        return {
          id: domain.id,
          label: domain.label,
          type: domain.type,
          fuelTech: domain.fuelTech,
          data,
          average,
          yMin: this.getYMin(data),
          yMax: this.getYMax(data)
        }
      })

      return datasets
    },

    datasetsWithPositiveLoads() {
      const datasets = this.allDomains.map(domain => {
        const { data, average } = getDataBucket({
          data: this.currentDataset,
          domain: domain.id,
          demandDomain: this.domainDemandPower.length > 0 ? this.domainDemandPower[0].id : null,
          isPrice: domain.type === 'price',
          category: domain.category,
          positiveLoads: true,
          interval: this.intervalVal,
          dayKeys: this.dayKeys
        })
        return {
          id: domain.id,
          label: domain.label,
          type: domain.type,
          fuelTech: domain.fuelTech,
          data,
          average,
          yMin: this.getYMin(data),
          yMax: this.getYMax(data)
        }
      })

      return datasets
    }
  },

  watch: {
    allDomains(val) {
      const filtered = this.datasets.filter(d => d.id === '_total' || d.id === '_totalRenewables')
      // this.selectedToDs = filtered
    },

    currentDataset: {
      immediate: true,
      handler(val) {
        const lastPoint = val[val.length - 1]
        this.dayKeys = getDayKeys(this.rangeVal, lastPoint.date)

        const timeDomains = this.dayKeys.map((key) => {
          return {
            domain: key,
            id: key,
            label: key
          }
        }).reverse()

        timeDomains.push({
          domain: '_average',
          id: '_average',
          label: 'Average'
        })

        this.timeDomains = timeDomains
      }
    },

    interval(val) {
      this.reassignSelectedToDs()
    }
  },

  created() {
    this.yTicks = []
    this.tickFormat = (d) => getTimeLabel(d)
    this.secondTickFormat = () => ''

    this.reassignSelectedToDs()
  },

  mounted() {
    const filtered = this.datasets.filter(d => d.id === '_total' || d.id === '_totalRenewables')
    // this.selectedToDs = filtered
  },

  methods: {
    ...mapMutations({
      setChartPowerDisplayPrefix: 'chartOptionsPowerEnergy/chartPowerDisplayPrefix',
      setSelectedToDs: 'timeOfDay/selectedToDs'
    }),

    reassignSelectedToDs() {
      const updatedSelectedToDs = []
      this.datasetsWithPositiveLoads.forEach(ds => {
        const isPrice = ds.type === 'price'
        const hasFuelTech = ds.fuelTech ? true : false
        const find = hasFuelTech
          ? this.selectedToDs.find(d => d.fuelTech === ds.fuelTech)
          : isPrice 
            ? this.selectedToDs.find(d => d.type === 'price') 
            : this.selectedToDs.find(d => d.id === ds.id)
        
        if (find) {
          updatedSelectedToDs.push(ds)
        }
      })
      this.setSelectedToDs(updatedSelectedToDs)
    },

    handleDateHover(date) {
      this.hoverDate = DateDisplay.getClosestDateByInterval(
        date,
        this.interval,
        this.filterPeriod
      )
    },

    handleZoomRange(dateRange) {
      let filteredDates = []
      if (dateRange && dateRange.length > 0) {
        let startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        let endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )

        filteredDates = [startTime, endTime]
      } else {
        filteredDates = []
      }
      this.zoomRange = filteredDates
    },

    getYMin(dataset) {
      let min = 0

      dataset.forEach((d) => {
        this.timeDomains.forEach((domain) => {
          const val = d[domain.id]
          if (min === null || val < min) {
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

    isSelected(ds) {
      const isPrice = ds.type === 'price'
      const hasFuelTech = ds.fuelTech ? true : false
      const find = hasFuelTech
        ? this.selectedToDs.find(d => d.fuelTech === ds.fuelTech)
        : isPrice 
          ? this.selectedToDs.find(d => d.type === 'price') 
          : this.selectedToDs.find(d => d.id === ds.id)
      return find ? true : false
    },

    toggleSelected(ds) {
      const find = this.selectedToDs.find(d => d.id === ds.id)
      if (find) {
        this.setSelectedToDs(this.selectedToDs.filter(d => d.id !== ds.id))
      } else {
        this.setSelectedToDs([...this.selectedToDs, ds])
      }
    },

    formatAverage({ value, type, unit }) {
      if (value === null) return '—'
      if (type === 'price') return this.$options.filters.formatCurrency(value)
      return `${this.$options.filters.formatValue(value)} ${unit}`
    },

    handleUnitClick() {
      const updatedPrefix = this.chartPowerDisplayPrefix === SI.MEGA ? SI.GIGA : SI.MEGA
      this.setChartPowerDisplayPrefix(updatedPrefix)
    },

    convertValue(value) {
      return SI.convertValue(
        this.chartPowerUnitPrefix,
        this.chartPowerDisplayPrefix,
        value
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
h4 {
  font-size: 18px;
  font-family: $header-font-family;
  font-weight: bold;
  margin: 0 0 1rem;
}
.sparkline-button {
  width: 130px;
}
</style>