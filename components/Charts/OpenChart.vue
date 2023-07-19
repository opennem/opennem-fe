<template>
  <div
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartShown
    }"
    class="chart"
  >
    <open-chart-options
      :read-only="readOnly"
      :chart-title="chartTitle"
      :chart-shown="chartShown"
      :chart-type="chartType"
      :chart-curve="chartCurve"
      :chart-y-axis="chartYAxis"
      :chart-unit="chartUnit"
      :chart-display-prefix="chartDisplayPrefix"
      :display-unit="unit"
      :is-type-area="isTypeArea"
      :is-type-proportion="isTypeProportion"
      :is-type-line="isTypeLine"
      :is-type-change-since-line="isTypeChangeSinceLine"
      :interval="customInterval === '' ? interval : customInterval"
      :average-emissions-volume="convertValue(averageValue)"
      :hover-display-date="hoverDisplayDate"
      :hover-value="hoverValue"
      :hover-domain-colour="hoverDomainColour"
      :hover-domain-label="hoverDomainLabel"
      :hover-total="hoverTotal"
      :show-average-value="showAverageValue"
      :emissions-options="chartOptions"
      :show-convert-value="!valueFormatter && shouldConvertValue"
      @type-click="handleTypeClick"
    />

    <stacked-area-vis
      v-if="chartShown && (isTypeArea || isTypeProportion)"
      :read-only="readOnly"
      :domains="filteredDomains"
      :dataset="dataset"
      :projection-dataset="projectionDataset"
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
      :x-ticks="xTicks"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :incomplete-intervals="incompleteIntervals"
      :highlight-domain="highlightId"
      :display-prefix="chartDisplayPrefix"
      :should-convert-value="!valueFormatter && shouldConvertValue"
      :convert-value="convertValue"
      :unit="` ${chartDisplayPrefix}${chartUnit}`"
      :filter-period="filterPeriod"
      :compare-dates="compareDates"
      :show-total-line="showTotalLine"
      :use-offset-diverge="useOffsetDiverge"
      class="vis-chart"
      @dateOver="handleDateHover"
      @domainOver="handleDomainHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
      @zoomExtent="handleZoomExtent"
    />

    <button
      v-if="
        chartShown &&
          (isTypeLine || isTypeChangeSinceLine) &&
          zoomExtent.length > 0 &&
          !readOnly
      "
      class="button is-rounded is-small reset-btn"
      @click.stop="handleZoomReset"
    >
      Zoom Out
    </button>
    <multi-line
      v-if="chartShown && (isTypeLine || isTypeChangeSinceLine)"
      :svg-height="visHeight"
      :domains1="filteredDomains"
      :dataset1="dataset"
      :projection-dataset="projectionDataset"
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
      :should-convert-value="!valueFormatter && shouldConvertValue"
      :convert-value="convertValue"
      :pad-y-axis="padYAxis"
      :annotations="annotations"
      class="vis-chart"
      @date-hover="handleDateHover"
      @domain-hover="handleDomainHover"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
    <date-brush
      v-if="chartShown && (isTypeLine || isTypeChangeSinceLine)"
      :dataset="[...dataset, ...projectionDataset]"
      :zoom-range="zoomExtent"
      :x-ticks="xTicks"
      :tick-format="tickFormat"
      :second-tick-format="secondTickFormat"
      :read-only="readOnly"
      :interval="interval"
      :filter-period="filterPeriod"
      class="date-brush vis-chart"
      @date-hover="handleDateHover"
      @date-filter="handleZoomExtent"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
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
import DateBrush from '@/components/Vis/DateBrush'
import StackedAreaVis from '@/components/Vis/StackedArea2.vue'
import OpenChartOptions from './OpenChartOptions'

const chartOptions = {
  type: [
    OPTIONS.CHART_LINE,
    OPTIONS.CHART_CHANGE_SINCE_LINE
  ],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: []
}

export default {
  components: {
    OpenChartOptions,
    StackedAreaVis,
    MultiLine,
    DateBrush
  },

  props: {
    chartTitle: {
      type: String,
      default: ''
    },
    chartDataset: {
      type: Array,
      default: () => []
    },
    chartProjectionDataset: {
      type: Array,
      default: () => []
    },
    chartDomains: {
      type: Array,
      default: () => []
    },
    averageValue: {
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
      default: 'id'
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
    },
    filterPeriod: {
      type: String,
      default: 'All'
    },
    compareDates: {
      type: Array,
      default: () => []
    },
    showTotalLine: {
      type: Boolean,
      default: false
    },
    useOffsetDiverge: {
      type: Boolean,
      default: false
    },
    customInterval: {
      type: String,
      default: ''
    },
    showAverageValue: {
      type: Boolean,
      default: true
    },
    chartOptions: {
      type: Object,
      default: () => chartOptions
    },
    valueFormatter: {
      type: Function,
      default: null
    },
    padYAxis: {
      type: Boolean,
      default: true
    },
    unit: {
      type: String,
      default: ''
    },
    annotations: {
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

      chartShown: 'chartOptions/chartShown',
      chartType: 'chartOptions/chartType',
      chartCurve: 'chartOptions/chartCurve',
      chartUnit: 'chartOptions/chartUnit',
      chartYAxis: 'chartOptions/chartYAxis',
      chartUnitPrefix: 'chartOptions/chartUnitPrefix',
      chartDisplayPrefix: 'chartOptions/chartDisplayPrefix',
      chartCurrentUnit: 'chartOptions/chartCurrentUnit'
    }),

    shouldConvertValue() {
      return (
        this.isTypeArea ||
        ((this.isTypeLine || this.isTypeChangeSinceLine) &&
          this.chartYAxis === OPTIONS.CHART_YAXIS_ABSOLUTE)
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
    isTypeChangeSinceLine() {
      return this.chartType === OPTIONS.CHART_CHANGE_SINCE_LINE
    },
    isYAxisAbsolute() {
      return this.chartYAxis === OPTIONS.CHART_YAXIS_ABSOLUTE
    },
    isYAxisPercentage() {
      return this.chartYAxis === OPTIONS.CHART_YAXIS_PERCENTAGE
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
      console.log('unit', this.chartCurrentUnit)
      let unit = this.chartCurrentUnit
      
      return unit
    },

    // hoverDomain() {
    //   const domain = this.hoverDomain
    //   console.log('domain', domain)
    //   if (domain) {
    //     const split = domain.split('.')

    //     if (split.length > 1) {
    //       split.pop()
    //       return `${split.join('.')}.${EMISSIONS}`
    //     } else {
    //       return domain
    //     }
    //   }
    //   return ''
    // },
    highlightId() {
      const domain = this.highlightDomain
      const find = this.filteredDomains.find((d) => d[this.propName] === domain)
      return find ? find.id : domain
    },
    yMax() {
      const dataset = _cloneDeep(this.withProjectionDataset)
      dataset.forEach((d) => {
        let stackedMax = 0
        this.filteredDomains.forEach((domain) => {
          stackedMax += d[domain.id]
        })
        d._stackedTotalEmissionsMax = stackedMax
      })
      return max(dataset, (d) => d._stackedTotalEmissionsMax)
    },
    yMin() {
      const dataset = _cloneDeep(this.withProjectionDataset)
      dataset.forEach((d) => {
        let emissionsMin = 0
        this.filteredDomains.forEach((domain) => {
          if (d[domain.id] < 0) {
            emissionsMin += d[domain.id] || 0
          }
        })
        d._stackedTotalEmissionsMin = emissionsMin
      })
      return min(dataset, (d) => d._stackedTotalEmissionsMin)
    },

    yLineMin() {
      let min = 0

      this.withProjectionDataset.forEach((d) => {
        this.filteredDomains.forEach((domain) => {
          const val = d[domain.id]
          if (val < min) {
            min = val
          }
        })
      })

      console.log('min', min)

      return min
    },

    yLineMax() {
      let max = 0

      this.withProjectionDataset.forEach((d) => {
        this.filteredDomains.forEach((domain) => {
          const val = d[domain.id]
          if (val > max) {
            max = val
          }
        })
      })

      console.log('max', max)

      return max
    },

    domains() {
      return this.chartDomains
        ? _cloneDeep(this.chartDomains).reverse()
        : []
    },
    filteredDomains() {
      const domains = this.domains
      const hidden = this.hiddenDomains
      return domains.filter((d) => !_includes(hidden, d[this.propName]))
    },

    hasProjectionDataset() {
      return this.chartProjectionDataset.length > 0
    },

    stackedDataset() {
      const dataset = _cloneDeep(this.chartDataset)
      dataset.forEach((d) => {
        this.domains.forEach((e) => {
          if (e.category === FT.LOAD) {
            const negValue = -d[e.id]
            d[e.id] = negValue
          }
        })
      })

      return dataset
    },

    stackedProjectionDataset() {
      const dataset = _cloneDeep(this.chartProjectionDataset)
      dataset.forEach((d) => {
        this.domains.forEach((e) => {
          if (e.category === FT.LOAD) {
            const negValue = -d[e.id]
            d[e.id] = negValue
          }
        })
      })

      return dataset
    },

    lineDataset() {
      return this.chartDataset
    },

    lineProjectionDataset() {
      return this.chartProjectionDataset
    },

    changeWithProjectionsDataset() {
      const dataset = this.hasProjectionDataset
        ? [...this.lineDataset, ...this.lineProjectionDataset]
        : this.lineDataset

      return this.getChangeSinceDataset(dataset, this.isYAxisPercentage)
    },

    changeSinceDataset() {
      if (this.hasProjectionDataset) {
        return this.changeWithProjectionsDataset.filter(
          (d) => d.time <= this.lineDataset[this.lineDataset.length - 1].time
        )
      }

      return this.changeWithProjectionsDataset
    },

    changeSinceProjectionDataset() {
      if (this.hasProjectionDataset) {
        return this.changeWithProjectionsDataset.filter(
          (d) => d.time > this.lineDataset[this.lineDataset.length - 1].time
        )
      }

      return []
    },

    withProjectionDataset() {
      return this.hasProjectionDataset
        ? [...this.dataset, ...this.projectionDataset]
        : this.dataset
    },

    dataset() {
      if (this.isTypeArea) {
        return this.stackedDataset
      }
      if (this.isTypeProportion) {
        return this.proportionDataset
      }
      if (this.isTypeLine) {
        if (this.chartYAxis === OPTIONS.CHART_YAXIS_ABSOLUTE) {
          return this.lineDataset
        }
        return this.linePercentageDataset
      }
      if (this.isTypeChangeSinceLine) {
        return this.changeSinceDataset
      }
    },

    projectionDataset() {
      if (this.isTypeArea) {
        return this.stackedProjectionDataset
      }
      if (this.isTypeProportion) {
        return this.proportionProjectionDataset
      }
      if (this.isTypeLine) {
        if (this.chartYAxis === OPTIONS.CHART_YAXIS_ABSOLUTE) {
          return this.lineProjectionDataset
        }
        return this.linePercentageProjectionDataset
      }
      if (this.isTypeChangeSinceLine) {
        return this.changeSinceProjectionDataset
      }
    },

    linePercentageDataset() {
      const dataset = _cloneDeep(this.lineDataset)
      dataset.forEach((d) => {
        let total = 0

        this.domains.forEach((e) => {
          total += d[e.id]
        })

        this.domains.forEach((e) => {
          const value = d[e.id]
          d[e.id] = (value / total) * 100
        })
      })

      return dataset
    },

    linePercentageProjectionDataset() {
      const dataset = _cloneDeep(this.lineProjectionDataset)
      dataset.forEach((d) => {
        let total = 0

        this.domains.forEach((e) => {
          total += d[e.id]
        })

        this.domains.forEach((e) => {
          const value = d[e.id]
          d[e.id] = (value / total) * 100
        })
      })

      return dataset
    },

    proportionDataset() {
      const dataset = _cloneDeep(this.chartDataset)
      dataset.forEach((d) => {
        let total = 0

        this.domains.forEach((e) => {
          total += d[e.id]
        })

        this.domains.forEach((e) => {
          const value = d[e.id]
          d[e.id] = (value / total) * 100
        })
      })

      return dataset
    },

    proportionProjectionDataset() {
      const dataset = _cloneDeep(this.chartProjectionDataset)
      dataset.forEach((d) => {
        let total = 0

        this.domains.forEach((e) => {
          total += d[e.id]
        })

        this.domains.forEach((e) => {
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

      let data = this.withProjectionDataset
        ? this.withProjectionDataset.find((d) => d.time === time)
        : null

      return data
    },

    hoverValue() {
      return this.hoverData
        ? this.shouldConvertValue
          ? this.valueFormatter
            ? this.valueFormatter(this.hoverData[this.hoverDomain])
            : this.convertValue(this.hoverData[this.hoverDomain])
          : this.valueFormatter(this.hoverData[this.hoverDomain])
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
      const find = this.filteredDomains.find((d) => d.id === this.hoverDomain)
      return find ? find.label : '—'
    },
    hoverDomainColour() {
      const find = this.filteredDomains.find((d) => d.id === this.hoverDomain)
      return find ? find.colour : '—'
    },
    hoverTotal() {
      let total = 0
      if (this.hoverData) {
        this.filteredDomains.forEach((d) => {
          total += this.hoverData[d.id]
        })
      }
      return this.convertValue(total)
    }
  },

  watch: {
    changeSinceDataset(curr, prev) {
      if (curr.length !== prev.length) {
        this.$emit('changeDataset', this.changeSinceDataset)
      }
    },
    interval() {
      this.handleTypeClick()
    }
  },

  mounted() {
    this.$emit('changeDataset', this.changeSinceDataset)
    this.doUpdateXTicks({
      range: this.range,
      interval: this.interval,
      isZoomed: this.zoomExtent.length > 0,
      filterPeriod: this.filterPeriod
    })
    this.doUpdateTickFormats({
      range: this.range,
      interval: this.interval,
      filterPeriod: this.filterPeriod
    })
  },

  methods: {
    ...mapMutations({
      setHoverDomain: 'visInteract/hoverDomain'
    }),

    ...mapActions({
      doUpdateXTicks: 'visInteract/doUpdateXTicks',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats'
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
    },
    handleZoomReset() {
      this.$emit('dateHover', null)
      this.$emit('isHovering', false)
      this.$emit('zoomExtent', [])
    },

    handleTypeClick() {
      this.doUpdateXTicks({
        range: this.range,
        interval: this.interval,
        isZoomed: this.zoomExtent.length > 0,
        filterPeriod: this.filterPeriod
      })
      this.doUpdateTickFormats({
        range: this.range,
        interval: this.interval,
        filterPeriod: this.filterPeriod
      })
    },

    getChangeSinceDataset(dataset, calculateProportion) {
      const excludeIncompleteIntervals = (ds) =>
        ds.filter((d) => !d._isIncompleteBucket)
      const filterExtentFilter = (ds) =>
        ds.filter(
          (d) => d.date >= this.zoomExtent[0] && d.date < this.zoomExtent[1]
        )
      const filtered =
        this.zoomExtent.length > 0
          ? excludeIncompleteIntervals(filterExtentFilter(dataset))
          : excludeIncompleteIntervals(dataset)

      const change = filtered[0]
      const newDataset = filtered.map((d, i) => {
        let min = 0,
          max = 0,
          total = 0
        const obj = {
          date: d.date,
          time: d.time
        }
        this.filteredDomains.forEach((domain) => {
          const id = domain.id
          const cValue = change[id] || 0
          obj[id] = d[id] - cValue

          if (calculateProportion && i > 0) {
            const proportion = (obj[id] / cValue) * 100
            obj[id] = isFinite(proportion) ? proportion : 0
          }

          if (obj[id] < min) {
            min = obj[id]
          }
          if (obj[id] > max) {
            max = obj[id]
          }
          obj._lowest = min
          obj._highest = max

          total += d[id]
        })

        obj._total = total

        return obj
      })

      const newChange = newDataset[0]
      newDataset.forEach((d) => {
        const totalChange =
          ((d._total - newChange._total) / newChange._total) * 100
        d._totalChange = totalChange
      })

      return newDataset
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
