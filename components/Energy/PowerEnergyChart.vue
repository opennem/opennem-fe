<template>
  <div 
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartEnergy
    }"
    class="chart">
    <chart-header
      :show="chartEnergyOptions" 
      @show-change="s => chartEnergyOptions = s">

      <template v-slot:label-unit >
        <strong v-if="isEnergyType">Energy</strong>
        <strong v-else>Generation</strong>

        <small v-if="isTypeProportion || (isTypeLine && isYAxisPercentage)">%</small>
        <small v-else-if="isEnergyType">{{ isYearInterval ? 'TWh' : 'GWh' }}/{{ interval | intervalLabel }}</small>
        <small v-else>MW</small>
      </template>

      <template 
        v-slot:average-value 
        v-if="!isRenewableLineOnly && isTypeProportion">
        Av.
        <strong>
          {{ averageEnergy | formatValue }}
          <span v-if="isEnergyType">{{ isYearInterval ? 'TWh' : 'GWh' }}/{{ interval | intervalLabel }}</span>
          <span v-else>MW</span>
        </strong>
      </template>

      <template v-slot:hover-date>
        {{ hoverDisplayDate }}
      </template>
      <template v-slot:hover-values>
        <span
          v-if="hoverValue"
          class="ft-value">
          <em
            :style="{ 'background-color': hoverDomainColour }"
            class="colour-square" />
          {{ hoverDomainLabel }}
          <strong>
            {{ hoverValue | formatValue }}<span v-if="isTypeProportion || (isTypeLine && isYAxisPercentage)">%</span>
            <span v-else-if="isEnergyType">{{ isYearInterval ? ' TWh' : ' GWh' }}</span>
            <span v-else> MW</span>
          </strong>
        </span>

        <!-- <span
          v-if="isRenewableLineOnly"
          class="renewables-value">
          <strong>{{ hoverRenewables | percentageFormatNumber }}</strong>
        </span> -->
        <span
          v-else-if="isTypeProportion"
          class="total-value">
          Total
          <strong>
            {{ hoverTotal | formatValue }}
            <span v-if="isEnergyType">{{ isYearInterval ? 'TWh' : 'GWh' }}</span>
            <span v-else>MW</span>
          </strong>
        </span>
      </template>
    </chart-header>
    <!--
            
      summary table first
      :highlight-domain="highlightDomain"
      
      :mobile-screen="tabletBreak"
    -->
    <stacked-area-vis
      v-if="chartEnergy && (isTypeArea || isTypeProportion)"
      :domains="isTypeArea ? domains : energyPercentDomains"
      :dataset="isTypeArea ? currentDatasetFlat : energyPercentDataset"
      :range="range"
      :interval="interval"
      :curve="isEnergyType ? chartEnergyCurve : chartPowerCurve"
      :y-min="isTypeArea ? yMin : 0"
      :y-max="isTypeArea ? yMax : 100"
      :vis-height="350"
      :hover-on="hoverOn"
      :hover-date="hoverDate"
      :dynamic-extent="zoomExtent"
      :zoomed="zoomExtent.length > 0"
      :x-guides="xGuides"
      :x-axis-dy="tabletBreak ? 8 : 12"
      :compare-dates="compareDates"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :incomplete-intervals="incompleteIntervals"
      :dataset-two="chartEnergyRenewablesLine ? renewablesPercentageDataset : []"
      :dataset-two-colour="renewablesLineColour"
      :mobile-screen="tabletBreak"
      class="vis-chart"
      @dateOver="handleDateHover"
      @domainOver="handleDomainHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
      @zoomExtent="handleZoomExtent"
    />

    <!-- 
      :toggled="chartEnergy"
      :highlight-domain="highlightDomain"

     -->

    <button
      v-if="chartEnergy && isTypeLine && zoomExtent.length > 0"
      class="button is-rounded is-small reset-btn"
      @click.stop="handleZoomReset"
    >
      Zoom Out
    </button>
    <multi-line
      v-if="chartEnergy && isTypeLine"
      :svg-height="350 - 30"
      :domains1="domains"
      :dataset1="isYAxisPercentage ? energyGrossPercentDataset : multiLineEnergyDataset"
      :domains2="[{
        label: 'Renewables',
        domain: 'value',
        colour: renewablesLineColour
      }]"
      :dataset2="renewablesPercentageDataset"
      :show-y2="chartEnergyRenewablesLine"
      :y2-max="renewablesMax"
      :y2-min="0"
      :y2-axis-unit="'%'"
      :y1-max="energyLineYMax"
      :y1-min="energyLineYMin"
      :x-ticks="xTicks"
      :y1-axis-unit="isYAxisPercentage ? '%' : ''"
      :curve="isEnergyType ? chartEnergyCurve : chartPowerCurve"
      :date-hovered="hoverDate"
      :zoom-range="zoomExtent"
      :draw-incomplete-bucket="false"
      :x-shades="xGuides"
      @date-hover="handleDateHover"
      @domain-hover="handleDomainHover"
      @enter="handleVisEnter"
      @leave="handleVisLeave" />
    <date-brush
      v-if="chartEnergy && isTypeLine"
      :dataset="energyGrossPercentDataset"
      :zoom-range="zoomExtent" 
      :x-ticks="xTicks"
      :tick-format="tickFormat"
      :second-tick-format="secondTickFormat"
      class="date-brush"
      @date-hover="handleDateHover"
      @date-filter="handleZoomExtent"
      @enter="handleVisEnter"
      @leave="handleVisLeave" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { min, max } from 'd3-array'
import _cloneDeep from 'lodash.clonedeep'
import addWeeks from 'date-fns/addWeeks'
import addMonths from 'date-fns/addMonths'
import addQuarters from 'date-fns/addQuarters'
import addYears from 'date-fns/addYears'

import AxisTicks from '@/services/axisTicks.js'
import DateDisplay from '@/services/DateDisplay.js'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'
import ChartHeader from '@/components/Vis/ChartHeader'
import StackedAreaVis from '@/components/Vis/StackedArea2'

export default {
  components: {
    ChartHeader,
    StackedAreaVis,
    MultiLine,
    DateBrush
  },

  props: {
    hoverOn: {
      type: Boolean,
      default: false
    },
    hoverDate: {
      type: Date,
      default: null
    },
    zoomExtent: {
      type: Array,
      default: () => []
    },
    tickFormat: {
      type: Function,
      default: () => ({})
    },
    secondTickFormat: {
      type: Function,
      default: () => ({})
    }
  },

  data() {
    return {
      chartEnergyOptions: false
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',
      hoverDomain: 'visInteract/hoverDomain',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      chartEnergy: 'visInteract/chartEnergy',
      chartEnergyType: 'visInteract/chartEnergyType',
      chartEnergyYAxis: 'visInteract/chartEnergyYAxis',
      chartEnergyCurve: 'visInteract/chartEnergyCurve',
      chartPowerCurve: 'visInteract/chartPowerCurve',
      chartEnergyRenewablesLine: 'visInteract/chartEnergyRenewablesLine',
      range: 'range',
      interval: 'interval',
      compareDates: 'compareDates',
      percentContributionTo: 'percentContributionTo',
      fuelTechGroupName: 'fuelTechGroupName',
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      currentDatasetFlat: 'regionEnergy/currentDatasetFlat',
      domainTemperature: 'regionEnergy/domainTemperature',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      summary: 'regionEnergy/summary'
    }),
    isTypeArea() {
      return this.chartEnergyType === 'area'
    },
    isTypeProportion() {
      return this.chartEnergyType === 'proportion'
    },
    isTypeLine() {
      return this.chartEnergyType === 'line'
    },
    isYAxisPercentage() {
      return this.chartEnergyYAxis === 'percentage'
    },
    renewablesLineColour() {
      return this.fuelTechGroupName === 'Renewable/Fossil' ||
        this.fuelTechGroupName === 'Flexibility'
        ? '#e34a33'
        : '#52BCA3'
    },
    renewablesPercentageDataset() {
      const d = this.currentDatasetFlat.map(d => {
        return {
          date: d.date,
          time: d.time,
          renewables: d._totalRenewables,
          value:
            this.percentContributionTo === 'generation'
              ? d._totalGenerationRenewablesPercentage
              : d._totalDemandRenewablesPercentage
        }
      })
      return d
    },
    renewablesMax() {
      let m = max(this.renewablesPercentageDataset, d => d.value)
      return m < 100 ? 100 : m
    },
    energyPercentDomains() {
      return this.domains.filter(d => d.category === 'source')
    },
    energyPercentDataset() {
      const dataset = _cloneDeep(this.currentDatasetFlat)
      dataset.forEach((d, i) => {
        let totalNetGeneration = 0,
          min = 0,
          max = 0

        this.domains.forEach(domain => {
          const id = domain.id
          const ft = domain.fuelTech

          if (d[id] < min) {
            min = d[id]
          }
          if (d[id] > max) {
            max = d[id]
          }

          if (domain.category === 'source') {
            if (ft === 'battery_discharging') {
              totalNetGeneration += d._netBattery
            } else if (ft === 'hydro') {
              totalNetGeneration += d._netHydro
            } else if (ft === 'imports') {
              totalNetGeneration += d._netImports
            } else {
              totalNetGeneration += d[id]
            }
          }
        })

        this.domains.forEach(domain => {
          const ft = domain.fuelTech
          if (domain.category === 'source') {
            if (ft === 'battery_discharging') {
              d[domain.id] = (d._netBattery / totalNetGeneration) * 100
            } else if (ft === 'hydro') {
              d[domain.id] = (d._netHydro / totalNetGeneration) * 100
            } else if (ft === 'imports') {
              d[domain.id] = (d._netImports / totalNetGeneration) * 100
            } else {
              d[domain.id] = (d[domain.id] / totalNetGeneration) * 100
            }
          }
        })

        d._lowest = min
        d._highest = max
      })
      return dataset
    },
    energyGrossPercentDataset() {
      const dataset = this.currentDatasetFlat.map(d => {
        const obj = {
          date: d.date,
          time: d.time,
          _isIncompleteBucket: d._isIncompleteBucket
        }
        this.domains.forEach(domain => {
          obj[domain.id] = (d[domain.id] / d._total) * 100
        })
        return obj
      })

      dataset.forEach(p => {
        let min = 0,
          max = 0
        this.domains.forEach(domain => {
          const id = domain.id

          if (domain.category === 'load') {
            p[id] = -p[id]
          }
          if (p[id] < min) {
            min = p[id]
          }
          if (p[id] > max) {
            max = p[id]
          }
        })
        p._lowest = min
        p._highest = max
      })

      return dataset
    },
    multiLineEnergyDataset() {
      return this.currentDatasetFlat.map(d => {
        const obj = {
          date: d.date,
          time: d.time,
          _isIncompleteBucket: d._isIncompleteBucket
        }
        this.domains.forEach(domain => {
          if (domain.category === 'load') {
            obj[domain.id] = d[domain.id] === 0 ? null : -d[domain.id]
          } else {
            obj[domain.id] = d[domain.id] === 0 ? null : d[domain.id]
          }
        })
        return obj
      })
    },
    yMin() {
      return min(this.currentDatasetFlat, d => d._stackedTotalMin)
    },
    yMax() {
      return max(this.currentDatasetFlat, d => d._stackedTotalMax)
    },
    energyLineYMin() {
      const dataset = this.isYAxisPercentage
        ? this.energyGrossPercentDataset
        : this.currentDatasetFlat
      const lowest = this.getMinValue(dataset)
      return lowest < 0 ? 0 : lowest
    },
    energyLineYMax() {
      const dataset = this.isYAxisPercentage
        ? this.energyGrossPercentDataset
        : this.currentDatasetFlat
      return this.getMaxValue(dataset)
    },
    xGuides() {
      if (this.currentDatasetFlat.length <= 0) {
        return []
      }
      let dStart = this.currentDatasetFlat[0].time
      const dEnd = this.currentDatasetFlat[this.currentDatasetFlat.length - 1]
        .time

      if (this.interval === 'Day') {
        return DateDisplay.weekendGuides(dStart, dEnd)
      }
      if (this.interval === '5m' || this.interval === '30m') {
        return DateDisplay.nightGuides(dStart, dEnd)
      }
      return []
    },
    xTicks() {
      return AxisTicks(this.range, this.interval, this.zoomExtent.length > 0)
    },
    domains() {
      return _cloneDeep(this.currentDomainPowerEnergy).reverse()
    },
    isYearInterval() {
      return this.interval === 'Fin Year' || this.interval === 'Year'
    },
    isRenewableLineOnly() {
      return this.chartEnergyRenewablesLine && this.domains.length === 0
    },
    averageEnergy() {
      return this.summary ? this.summary._averageEnergy : 0
    },
    hoverData() {
      if (!this.hoverDate) {
        return null
      }
      const time = this.hoverDate.getTime()
      let dataset = this.currentDatasetFlat
      if (this.isTypeProportion) {
        dataset = this.energyPercentDataset
      }
      if (this.isTypeLine) {
        if (this.isYAxisPercentage) {
          dataset = this.energyGrossPercentDataset
        } else {
          dataset = this.multiLineEnergyDataset
        }
      }

      return dataset.find(d => d.time === time)
    },
    hoverValue() {
      return this.hoverData ? this.hoverData[this.hoverDomain] : null
    },
    hoverDisplayDate() {
      let date = this.focusDate
      if (this.hoverOn) {
        date = this.hoverDate
      }
      return date
        ? DateDisplay.specialDateFormats(
            date.getTime(),
            this.range,
            this.interval,
            false,
            false,
            false,
            true
          )
        : ''
    },
    hoverDomainLabel() {
      let find = null
      // if (
      //   this.chartEnergyType === 'proportion' ||
      //   (this.chartEnergyType === 'line' &&
      //     this.chartEnergyYAxis === 'percentage')
      // ) {
      //   find = this.stackedEnergyPercentDomains.find(
      //     d => d.id === this.hoverDomain
      //   )
      // } else {
      //   find = this.currentDomainPowerEnergy.find(d => d.id === this.hoverDomain)
      // }

      find = this.currentDomainPowerEnergy.find(d => d.id === this.hoverDomain)
      return find ? find.label : '—'
    },
    hoverDomainColour() {
      let find = null
      // if (
      //   this.chartEnergyType === 'proportion' ||
      //   (this.chartEnergyType === 'line' &&
      //     this.chartEnergyYAxis === 'percentage')
      // ) {
      //   find = this.stackedEnergyPercentDomains.find(
      //     d => d.id === this.hoverDomain
      //   )
      // } else {
      //   find = this.currentDomainPowerEnergy.find(d => d.id === this.hoverDomain)
      // }

      find = this.currentDomainPowerEnergy.find(d => d.id === this.hoverDomain)
      return find ? find.colour : '—'
    },
    hoverTotal() {
      let total = 0
      if (this.hoverData) {
        this.currentDomainPowerEnergy.forEach(d => {
          total += this.hoverData[d.id]
        })
      }
      return total
    },
    incompleteIntervals() {
      const incompletes = []
      const filtered = this.currentDatasetFlat.filter(
        d => d._isIncompleteBucket
      )
      filtered.forEach(f => {
        if (this.interval === 'Week') {
          incompletes.push({
            start: f.date,
            end: addWeeks(f.date, 1)
          })
        }
        if (this.range === '1Y' && this.interval === 'Month') {
          incompletes.push({
            start: f.date,
            end: addMonths(f.date, 1)
          })
        }
        if (this.interval === 'Season') {
          incompletes.push({
            start: f.date,
            end: addMonths(f.date, 3)
          })
        }
        if (this.interval === 'Quarter') {
          incompletes.push({
            start: f.date,
            end: addQuarters(f.date, 1)
          })
        }
        if (this.interval === 'Half Year') {
          incompletes.push({
            start: f.date,
            end: addMonths(f.date, 6)
          })
        }
        if (this.interval === 'Year' || this.interval === 'Fin Year') {
          incompletes.push({
            start: f.date,
            end: addYears(f.date, 1)
          })
        }
      })
      return incompletes
    }
  },

  methods: {
    ...mapMutations({
      setHoverDomain: 'visInteract/hoverDomain'
    }),
    getMinValue(dataset) {
      let min = 0
      dataset.forEach(d => {
        if (d._lowest < min) {
          min = d._lowest
        }
      })
      return min
    },
    getMaxValue(dataset) {
      let max = 0
      if (this.fuelTechGroupName === 'Default') {
        dataset.forEach(d => {
          if (d._highest > max && !d._isIncompleteBucket) {
            max = d._highest
          }
        })
      } else {
        dataset.forEach(d => {
          this.domains.forEach(domain => {
            if (d[domain.id] > max && !d._isIncompleteBucket) {
              max = d[domain.id]
            }
          })
        })
      }
      return max === 0 ? 100 : max
    },
    handleDomainHover(domain) {
      this.setHoverDomain(domain)
    },
    handleDateHover(evt, date) {
      this.$emit('dateHover', date)
    },
    handleVisEnter() {
      this.$emit('isHovering', true)
    },
    handleVisLeave() {
      this.$emit('isHovering', false)
    },
    handleSvgClick(metaKey) {
      this.$emit('svgClick', metaKey)
    },
    handleZoomExtent(dateRange) {
      this.$emit('zoomExtent', dateRange)
    },
    handleZoomReset() {
      this.$emit('zoomExtent', [])
    }
  }
}
</script>

<style lang="scss" scoped>
.reset-btn {
  position: absolute;
  top: 39px;
  right: 24px;
}
</style>
