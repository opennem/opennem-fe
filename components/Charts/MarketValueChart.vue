<template>
  <div
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartShown
    }"
    class="chart">
    <market-value-chart-options
      :read-only="readOnly"
      :chart-shown="chartShown"
      :chart-type="chartType"
      :chart-curve="chartCurve"
      :interval="interval"
      :average-market-value="averageMarketValue"
      :hover-display-date="hoverDisplayDate"
      :hover-value="domains.length > 1 ? hoverValue : null"
      :hover-domain-colour="hoverDomainColour"
      :hover-domain-label="hoverDomainLabel"
      :hover-total="hoverTotal"
      :show-hover="domains.length > 1"
    />

    <stacked-area-vis
      v-if="chartShown"
      :read-only="readOnly"
      :domains="domains"
      :dataset="dataset"
      :range="range"
      :interval="interval"
      :curve="chartCurve"
      :y-min="yMin"
      :y-max="yMax"
      :vis-height="200"
      :show-x-axis="showXAxis"
      :show-tooltip="false"
      :show-zoom-out="showXAxis"
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
      :should-convert-value="true"
      :convert-value="convertValue"
      class="vis-chart"
      @dateOver="handleDateHover"
      @domainOver="handleDomainHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
      @zoomExtent="handleZoomExtent"
    />

    <!-- <multi-line
      v-if="chartShown"
      :svg-height="200"
      :domains1="domains"
      :dataset1="dataset"
      :y1-max="yLineMax"
      :y1-min="yLineMin"
      :x-ticks="xTicks"
      :curve="chartCurve"
      :date-hovered="hoverDate"
      :zoom-range="zoomExtent"
      :draw-incomplete-bucket="true"
      :x-shades="xGuides"
      :highlight-domain="highlightId"
      :should-convert-value="true"
      :convert-value="convertValue"
      class="vis-chart"
      @date-hover="handleDateHover"
      @domain-hover="handleDomainHover"
      @enter="handleVisEnter"
      @leave="handleVisLeave" /> -->

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
import * as FT from '@/constants/energy-fuel-techs/group-default.js'
import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si.js'
import { MARKET_VALUE } from '@/constants/data-types.js'
import DateDisplay from '@/services/DateDisplay.js'
import MultiLine from '@/components/Vis/MultiLine'
import StackedAreaVis from '@/components/Vis/StackedArea.vue'
import MarketValueChartOptions from './MarketValueChartOptions'

export default {
  components: {
    MarketValueChartOptions,
    StackedAreaVis,
    MultiLine
  },

  props: {
    marketValueDataset: {
      type: Array,
      default: () => []
    },
    domainMarketValue: {
      type: Array,
      default: () => []
    },
    averageMarketValue: {
      type: Number,
      default: 0
    },
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
    },
    propName: {
      type: String,
      default: ''
    },
    range: {
      type: String,
      default: ''
    },
    interval: {
      type: String,
      default: ''
    },
    hiddenDomains: {
      type: Array,
      default: () => []
    },
    showXAxis: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',
      hoverDomain: 'visInteract/hoverDomain',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      xGuides: 'visInteract/xGuides',
      highlightDomain: 'visInteract/highlightDomain',
      xTicks: 'visInteract/xTicks',
      visTickFormat: 'visInteract/tickFormat',
      visSecondTickFormat: 'visInteract/secondTickFormat',

      chartShown: 'chartOptionsMarketValue/chartShown',
      chartType: 'chartOptionsMarketValue/chartType',
      chartCurve: 'chartOptionsMarketValue/chartCurve'
    }),

    tickFormat() {
      if (typeof this.visTickFormat === 'string') {
        return AxisTimeFormats[this.visTickFormat]
      }
      return this.visTickFormat
    },

    secondTickFormat() {
      return AxisTimeFormats[this.visSecondTickFormat]
    },

    hoverMarketValueDomain() {
      const domain = this.hoverDomain
      if (domain) {
        const split = domain.split('.')
        split.pop()
        return `${split.join('.')}.${MARKET_VALUE}`
      }
      return ''
    },
    highlightId() {
      const domain = this.highlightDomain
      const find = this.domains.find(d => d[this.propName] === domain)
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
        let min = 0
        this.domains.forEach(domain => {
          if (d[domain.id] < 0) {
            min += d[domain.id] || 0
          }
        })
        d._stackedTotalEmissionsMin = min
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

    marketValueDomains() {
      return this.domainMarketValue
        ? _cloneDeep(this.domainMarketValue).reverse()
        : []
    },
    domains() {
      const domains = this.marketValueDomains
      const hidden = this.hiddenDomains
      return domains.filter(d => !_includes(hidden, d[this.propName]))
    },

    stackedDataset() {
      return _cloneDeep(this.marketValueDataset)
    },

    lineDataset() {
      return this.marketValueDataset
    },

    dataset() {
      return this.stackedDataset
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
      return this.dataset ? this.dataset.find(d => d.time === time) : null
    },
    hoverValue() {
      console.log(this.hoverData, this.hoverMarketValueDomain)
      return this.hoverData
        ? this.convertValue(this.hoverData[this.hoverMarketValueDomain])
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
      const find = this.domains.find(d => d.id === this.hoverMarketValueDomain)
      return find ? find.label : '—'
    },
    hoverDomainColour() {
      const find = this.domains.find(d => d.id === this.hoverMarketValueDomain)
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
      const filtered = this.marketValueDataset.filter(
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
    convertValue(value) {
      return value && value !== 0 ? value : 0
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
