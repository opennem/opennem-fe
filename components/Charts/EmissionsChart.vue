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
      :chart-y-axis="chartYAxis"
      :chart-unit="chartUnit"
      :chart-display-prefix="chartDisplayPrefix"
      :display-unit="displayUnit"
      :is-type-area="isTypeArea"
      :is-type-proportion="isTypeProportion"
      :is-type-line="isTypeLine"
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
      :vis-height="visHeight"
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
      :svg-height="visHeight"
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

import AxisTimeFormats from '@/services/axisTimeFormats.js'
import * as FT from '@/constants/energy-fuel-techs/group-default.js'
import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si.js'
import { EMISSIONS } from '@/constants/data-types.js'
import DateDisplay from '@/services/DateDisplay.js'
import MultiLine from '@/components/Vis/MultiLine'
import StackedAreaVis from '@/components/Vis/StackedArea.vue'
import EmissionsChartOptions from './EmissionsChartOptions'

export default {
  components: {
    EmissionsChartOptions,
    StackedAreaVis,
    MultiLine
  },

  props: {
    emissionsDataset: {
      type: Array,
      default: () => []
    },
    domainEmissions: {
      type: Array,
      default: () => []
    },
    averageEmissions: {
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
    },
    visHeight: {
      type: Number,
      default: 200
    },
    incompleteIntervals: {
      type: Array,
      default: () => []
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

      chartShown: 'chartOptionsEmissionsVolume/chartShown',
      chartType: 'chartOptionsEmissionsVolume/chartType',
      chartCurve: 'chartOptionsEmissionsVolume/chartCurve',
      chartUnit: 'chartOptionsEmissionsVolume/chartUnit',
      chartYAxis: 'chartOptionsEmissionsVolume/chartYAxis',
      chartUnitPrefix: 'chartOptionsEmissionsVolume/chartUnitPrefix',
      chartDisplayPrefix: 'chartOptionsEmissionsVolume/chartDisplayPrefix',
      chartCurrentUnit: 'chartOptionsEmissionsVolume/chartCurrentUnit'
    }),

    shouldConvertValue() {
      return (
        this.isTypeArea ||
        (this.isTypeLine &&
          this.chartYAxis === OPTIONS.CHART_YAXIS_EMISSIONS_VOL)
      )
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
      if (
        this.isTypeProportion ||
        (this.isTypeLine && this.chartYAxis === OPTIONS.CHART_YAXIS_PERCENTAGE)
      ) {
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
      return this.domainEmissions
        ? _cloneDeep(this.domainEmissions).reverse()
        : []
    },
    domains() {
      const domains = this.emissionsDomains
      const hidden = this.hiddenDomains
      return domains.filter(d => !_includes(hidden, d[this.propName]))
    },

    stackedDataset() {
      const dataset = _cloneDeep(this.emissionsDataset)
      dataset.forEach(d => {
        this.emissionsDomains.forEach(e => {
          if (e.category === FT.LOAD) {
            const negValue = -d[e.id]
            d[e.id] = negValue
          }
        })
      })

      return dataset
    },

    lineDataset() {
      return this.emissionsDataset
    },

    dataset() {
      if (this.isTypeArea) {
        return this.stackedDataset
      }
      if (this.isTypeProportion) {
        return this.proportionDataset
      }
      if (this.isTypeLine) {
        if (this.chartYAxis === OPTIONS.CHART_YAXIS_EMISSIONS_VOL) {
          return this.lineDataset
        }
        return this.linePercentageDataset
      }
    },

    linePercentageDataset() {
      const dataset = _cloneDeep(this.lineDataset)
      dataset.forEach(d => {
        let total = 0

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

    proportionDataset() {
      const dataset = _cloneDeep(this.emissionsDataset)
      dataset.forEach(d => {
        let total = 0

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
      return this.dataset ? this.dataset.find(d => d.time === time) : null
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
