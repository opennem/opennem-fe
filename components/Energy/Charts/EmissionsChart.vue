<template>
  <div
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartShown
    }"
    class="chart">
    <emissions-chart-options
      :read-only="readOnly"
      :chart-shown="chartShown"
      :chart-type="chartType"
      :chart-curve="chartCurve"
      :chart-unit="chartUnit"
      :chart-display-prefix="chartDisplayPrefix"
      :display-unit="displayUnit"
      :is-type-proportion="isTypeProportion"
      :interval="interval"
      :average-emissions-volume="convertValue(averageEmissions)"
      :hover-display-date="hoverDisplayDate"
      :hover-value="domains.length > 1 ? hoverValue : null"
      :hover-domain-colour="hoverDomainColour"
      :hover-domain-label="hoverDomainLabel"
      :hover-total="hoverTotal"
    />

    <stacked-area-vis
      v-if="chartShown && (isTypeArea || isTypeProportion)"
      :read-only="readOnly"
      :domains="domains"
      :dataset="dataset"
      :range="range"
      :interval="interval"
      :curve="chartCurve"
      :y-min="isTypeArea ? yMin : 0"
      :y-max="isTypeArea ? yMax : 100"
      :vis-height="200"
      :show-x-axis="false"
      :show-tooltip="false"
      :show-zoom-out="false"
      :hover-on="hoverOn"
      :hover-date="hoverDate"
      :dynamic-extent="zoomExtent"
      :zoomed="zoomExtent.length > 0"
      :x-guides="xGuides"
      :x-axis-dy="tabletBreak ? 8 : 12"
      :y-axis-ticks="4"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :incomplete-intervals="incompleteIntervals"
      :highlight-domain="highlightId"
      :display-prefix="chartDisplayPrefix"
      :should-convert-value="shouldConvertValue"
      :convert-value="convertValue"
      :unit="` ${chartDisplayPrefix}${chartUnit}`"
      class="vis-chart"
      @dateOver="handleDateHover"
      @domainOver="handleDomainHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
      @zoomExtent="handleZoomExtent"
    />

    <multi-line
      v-if="chartShown && isTypeLine"
      :svg-height="200"
      :domains1="domains"
      :dataset1="currentDataset"
      :y1-max="yLineMax"
      :y1-min="yLineMin"
      :x-ticks="xTicks"
      :curve="chartCurve"
      :date-hovered="hoverDate"
      :zoom-range="zoomExtent"
      :draw-incomplete-bucket="true"
      :x-shades="xGuides"
      :highlight-domain="highlightId"
      :display-prefix="chartDisplayPrefix"
      :should-convert-value="shouldConvertValue"
      :convert-value="convertValue"
      class="vis-chart"
      @date-hover="handleDateHover"
      @domain-hover="handleDomainHover"
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
import AxisTimeFormats from '@/services/axisTimeFormats.js'
import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si.js'
import { EMISSIONS } from '@/constants/data-types.js'
import DateDisplay from '@/services/DateDisplay.js'
import MultiLine from '@/components/Vis/MultiLine'
import StackedAreaVis from '@/components/Vis/StackedArea.vue'
import EmissionsChartOptions from '@/components/Energy/Charts/EmissionsChartOptions'

export default {
  components: {
    EmissionsChartOptions,
    StackedAreaVis,
    MultiLine
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
    readOnly: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      fuelTechGroupName: 'fuelTechGroupName',
      hiddenFuelTechs: 'hiddenFuelTechs',
      tabletBreak: 'app/tabletBreak',
      hoverDomain: 'visInteract/hoverDomain',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      xGuides: 'visInteract/xGuides',
      highlightDomain: 'visInteract/highlightDomain',
      xTicks: 'visInteract/xTicks',
      visTickFormat: 'visInteract/tickFormat',
      visSecondTickFormat: 'visInteract/secondTickFormat',

      chartShown: 'chartOptionsEmissionsVolume/chartShown',
      chartType: 'chartOptionsEmissionsVolume/chartType',
      chartCurve: 'chartOptionsEmissionsVolume/chartCurve',
      chartUnit: 'chartOptionsEmissionsVolume/chartUnit',
      chartUnitPrefix: 'chartOptionsEmissionsVolume/chartUnitPrefix',
      chartDisplayPrefix: 'chartOptionsEmissionsVolume/chartDisplayPrefix',
      chartCurrentUnit: 'chartOptionsEmissionsVolume/chartCurrentUnit',

      currentDataset: 'regionEnergy/currentDataset',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions',
      summary: 'regionEnergy/summary',

      averageEmissions: 'energy/emissions/averageEmissions'
    }),

    shouldConvertValue() {
      return this.isTypeArea || this.isTypeLine
    },

    isTypeArea() {
      return this.chartType === OPTIONS.CHART_STACKED
    },
    isTypeProportion() {
      return this.chartType === OPTIONS.CHART_PROPORTION
    },
    isTypeLine() {
      return this.chartType === OPTIONS.CHART_LINE
    },

    tickFormat() {
      if (typeof this.visTickFormat === 'string') {
        return AxisTimeFormats[this.visTickFormat]
      }
      return this.visTickFormat
    },
    secondTickFormat() {
      return AxisTimeFormats[this.visSecondTickFormat]
    },

    displayUnit() {
      let unit = this.chartCurrentUnit
      if (this.isTypeProportion) {
        unit = '%'
      }
      return unit
    },

    hoverEmissionsDomain() {
      const domain = this.hoverDomain
      if (domain) {
        const split = domain.split('.')
        split.pop()
        return `${split.join('.')}.${EMISSIONS}`
      }
      return ''
    },
    highlightId() {
      const domain = this.highlightDomain
      const property =
        this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
      const find = this.domains.find(d => d[property] === domain)
      return find ? find.id : ''
    },
    yMax() {
      const dataset = _cloneDeep(this.dataset)
      dataset.forEach(d => {
        let stackedMax = 0
        this.domains.forEach(domain => {
          stackedMax += d[domain.id]
        })
        d._stackedTotalEmissionsMax = stackedMax
      })
      return max(dataset, d => d._stackedTotalEmissionsMax)
    },
    yMin() {
      const dataset = _cloneDeep(this.dataset)
      dataset.forEach(d => {
        let emissionsMin = 0
        this.domains.forEach(domain => {
          if (d[domain.id] < 0) {
            emissionsMin += d[domain.id] || 0
          }
        })
        d._stackedTotalEmissionsMin = emissionsMin
      })
      return min(dataset, d => d._stackedTotalEmissionsMin)
    },

    yLineMin() {
      let min = 0

      this.dataset.forEach(d => {
        this.domains.forEach(domain => {
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

      this.dataset.forEach(d => {
        this.domains.forEach(domain => {
          const val = d[domain.id]
          if (val > max) {
            max = val
          }
        })
      })

      return max
    },

    emissionsDomains() {
      return this.currentDomainEmissions
        ? _cloneDeep(this.currentDomainEmissions).reverse()
        : []
    },
    domains() {
      const property =
        this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
      const domains = this.emissionsDomains
      const hidden = this.hiddenFuelTechs
      return domains.filter(d => !_includes(hidden, d[property]))
    },

    dataset() {
      return this.isTypeProportion
        ? this.proportionDataset
        : this.currentDataset
    },

    proportionDataset() {
      const dataset = _cloneDeep(this.currentDataset)
      dataset.forEach(d => {
        let total = 0,
          min = 0,
          max = 0

        this.emissionsDomains.forEach(e => {
          total += d[e.id]
        })

        this.emissionsDomains.forEach(e => {
          const value = d[e.id]
          d[e.id] = (value / total) * 100
        })
      })

      return dataset
    },

    hoverData() {
      let date = this.focusDate
      if (this.hoverOn) {
        date = this.hoverDate
      }
      if (!date) {
        return null
      }
      const time = date.getTime()
      return this.dataset.find(d => d.time === time)
    },
    hoverValue() {
      return this.hoverData
        ? this.shouldConvertValue
          ? this.convertValue(this.hoverData[this.hoverEmissionsDomain])
          : this.hoverData[this.hoverEmissionsDomain]
        : null
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
      const find = this.domains.find(d => d.id === this.hoverEmissionsDomain)
      return find ? find.label : '—'
    },
    hoverDomainColour() {
      const find = this.domains.find(d => d.id === this.hoverEmissionsDomain)
      return find ? find.colour : '—'
    },
    hoverTotal() {
      let total = 0
      if (this.hoverData) {
        this.domains.forEach(d => {
          total += this.hoverData[d.id]
        })
      }
      return this.convertValue(total)
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
    convertValue(value) {
      return SI.convertValue(
        this.chartUnitPrefix,
        this.chartDisplayPrefix,
        value
      )
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
    }
  }
}
</script>
