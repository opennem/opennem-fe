<template>
  <div 
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartEnergy
    }"
    class="chart">
    <power-energy-chart-options
      :options="options"
      :chart-shown="chartEnergy"
      :chart-type="chartEnergyType"
      :chart-curve="chartCurve"
      :chart-y-axis="chartEnergyYAxis"
      :interval="interval"
      :is-energy-type="isEnergyType"
      :is-type-proportion="isTypeProportion"
      :is-type-line="isTypeLine"
      :is-y-axis-percentage="isYAxisPercentage"
      :is-year-interval="isYearInterval"
      :is-renewable-line-only="isRenewableLineOnly"
      :average-energy="averageEnergy"
      :hover-display-date="hoverDisplayDate"
      :hover-value="hoverValue"
      :hover-domain-colour="hoverDomainColour"
      :hover-domain-label="hoverDomainLabel"
      :hover-renewables="hoverRenewables"
      :hover-total="hoverTotal"
    />
    
    <stacked-area-vis
      v-if="chartEnergy && (isTypeArea || isTypeProportion)"
      :domains="domains"
      :dataset="isTypeArea ? currentDataset : energyPercentDataset"
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
      :highlight-domain="highlightId"
      :mobile-screen="tabletBreak"
      class="vis-chart"
      @dateOver="handleDateHover"
      @domainOver="handleDomainHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
      @zoomExtent="handleZoomExtent"
    />

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
      :highlight-domain="highlightId"
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
import _includes from 'lodash.includes'
import _cloneDeep from 'lodash.clonedeep'
import addWeeks from 'date-fns/addWeeks'
import addMonths from 'date-fns/addMonths'
import addQuarters from 'date-fns/addQuarters'
import addYears from 'date-fns/addYears'

import DateDisplay from '@/services/DateDisplay.js'
import * as OPTIONS from '@/constants/v2/chart-options.js'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'
import StackedAreaVis from '@/components/Vis/StackedArea2'
import PowerEnergyChartOptions from '@/components/Energy/Charts/PowerEnergyChartOptions'

const options = {
  type: [
    OPTIONS.CHART_HIDDEN,
    OPTIONS.CHART_STACKED,
    OPTIONS.CHART_PROPORTION,
    OPTIONS.CHART_LINE
  ],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: [OPTIONS.CHART_YAXIS_ABSOLUTE, OPTIONS.CHART_YAXIS_PERCENTAGE]
}

export default {
  components: {
    PowerEnergyChartOptions,
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
    }
  },

  data() {
    return {
      options
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',
      hoverDomain: 'visInteract/hoverDomain',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      xTicks: 'visInteract/xTicks',
      xGuides: 'visInteract/xGuides',
      tickFormat: 'visInteract/tickFormat',
      secondTickFormat: 'visInteract/secondTickFormat',
      highlightDomain: 'visInteract/highlightDomain',
      chartEnergy: 'chartOptionsPowerEnergy/chartShown',
      chartEnergyType: 'chartOptionsPowerEnergy/chartType',
      chartEnergyYAxis: 'chartOptionsPowerEnergy/chartYAxis',
      chartEnergyCurve: 'chartOptionsPowerEnergy/chartEnergyCurve',
      chartPowerCurve: 'chartOptionsPowerEnergy/chartPowerCurve',
      chartEnergyRenewablesLine:
        'chartOptionsPowerEnergy/chartEnergyRenewablesLine',
      range: 'range',
      interval: 'interval',
      compareDates: 'compareDates',
      percentContributionTo: 'percentContributionTo',
      fuelTechGroupName: 'fuelTechGroupName',
      hiddenFuelTechs: 'hiddenFuelTechs',
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      currentDataset: 'regionEnergy/currentDataset',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      summary: 'regionEnergy/summary'
    }),
    calculateByGeneration() {
      return this.percentContributionTo === 'generation'
    },
    highlightId() {
      const domain = this.highlightDomain
      const property =
        this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
      const find = this.domains.find(d => d[property] === domain)
      return find ? find.id : ''
    },
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
    chartCurve() {
      return this.isEnergyType ? this.chartEnergyCurve : this.chartPowerCurve
    },
    renewablesLineColour() {
      return this.fuelTechGroupName === 'Renewable/Fossil' ||
        this.fuelTechGroupName === 'Flexibility'
        ? '#e34a33'
        : '#52BCA3'
    },
    renewablesPercentageDataset() {
      const d = this.currentDataset.map(d => {
        return {
          date: d.date,
          time: d.time,
          renewables: d._totalRenewables,
          value: this.calculateByGeneration
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
    energyPercentDataset() {
      const dataset = _cloneDeep(this.currentDataset)
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
      const dataset = this.currentDataset.map(d => {
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
      return this.currentDataset.map(d => {
        const obj = {
          date: d.date,
          time: d.time,
          _isIncompleteBucket: d._isIncompleteBucket
        }
        this.powerEnergyDomains.forEach(domain => {
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
      const dataset = _cloneDeep(this.currentDataset)
      dataset.forEach(d => {
        let stackedMin = 0
        this.domains.forEach(domain => {
          if (d[domain.id] < 0) {
            stackedMin += d[domain.id] || 0
          }
        })
        d._stackedTotalMin = stackedMin
      })
      return min(dataset, d => d._stackedTotalMin)
    },
    yMax() {
      const dataset = _cloneDeep(this.currentDataset)
      dataset.forEach(d => {
        let stackedMax = 0
        this.domains.forEach(domain => {
          stackedMax += d[domain.id]
        })
        d._stackedTotalMax = stackedMax
      })
      return max(dataset, d => d._stackedTotalMax)
    },
    energyLineYMin() {
      const dataset = this.isYAxisPercentage
        ? this.energyGrossPercentDataset
        : this.currentDataset
      const lowest = this.getMinValue(dataset)
      return lowest < 0 ? 0 : lowest
    },
    energyLineYMax() {
      const dataset = this.isYAxisPercentage
        ? this.energyGrossPercentDataset
        : this.currentDataset
      return this.getMaxValue(dataset)
    },
    domains() {
      const property =
        this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
      const domains = this.isTypeArea
        ? this.powerEnergyDomains
        : this.energyPercentDomains
      const hidden = this.hiddenFuelTechs
      return domains.filter(d => !_includes(hidden, d[property]))
    },
    powerEnergyDomains() {
      return _cloneDeep(this.currentDomainPowerEnergy).reverse()
    },
    energyPercentDomains() {
      return this.powerEnergyDomains.filter(d => d.category === 'source')
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
    hoverPowerEnergyDomain() {
      const domain = this.hoverDomain
      const type = this.isEnergyType ? 'energy' : 'power'
      if (domain) {
        const split = domain.split('.')
        split.pop()
        return `${split.join('.')}.${type}`
      }
      return ''
    },
    hoverData() {
      if (!this.hoverDate) {
        return null
      }
      const time = this.hoverDate.getTime()
      let dataset = this.currentDataset
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
      return this.hoverData ? this.hoverData[this.hoverPowerEnergyDomain] : null
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
      const find = this.currentDomainPowerEnergy.find(
        d => d.id === this.hoverPowerEnergyDomain
      )
      return find ? find.label : '—'
    },
    hoverDomainColour() {
      const find = this.currentDomainPowerEnergy.find(
        d => d.id === this.hoverPowerEnergyDomain
      )
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
    hoverRenewables() {
      if (!this.hoverData) {
        return 0
      }
      return this.calculateByGeneration
        ? this.hoverData._totalGenerationRenewablesPercentage
        : this.hoverData._totalDemandRenewablesPercentage
    },
    incompleteIntervals() {
      const incompletes = []
      const filtered = this.currentDataset.filter(d => d._isIncompleteBucket)
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
