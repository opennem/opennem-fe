<template>
  <div
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartShown
    }"
    class="chart"
    @mouseenter="() => showDivider = true"
    @mouseleave="() => showDivider = false"
  >
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
      :is-type-change-since-line="isTypeChangeSinceLine"
      :interval="customInterval === '' ? interval : customInterval"
      :average-emissions-volume="convertValue(averageEmissions)"
      :hover-display-date="hoverDisplayDate"
      :hover-value="domains.length > 1 ? hoverValue : null"
      :hover-domain-colour="hoverDomainColour"
      :hover-domain-label="hoverDomainLabel"
      :hover-total="hoverTotal"
      :show-average-value="showAverageValue"
      :emissions-options="emissionsOptions"
      :show-date-axis="showDateAxis"
      @type-click="handleTypeClick"
      @date-axis="(visible) => showDateAxis = visible"
    />

    <stacked-area-vis
      v-if="chartShown && (isTypeArea || isTypeProportion)"
      :read-only="readOnly"
      :domains="domains"
      :dataset="dataset"
      :projection-dataset="projectionDataset"
      :range="range"
      :interval="interval"
      :curve="chartCurve"
      :y-min="isTypeArea ? yMin : 0"
      :y-max="isTypeArea ? yMax : 100"
      :vis-height="chartHeight"
      :show-x-axis="false"
      :show-tooltip="false"
      :show-zoom-out="showDateAxis"
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
      :should-convert-value="shouldConvertValue"
      :convert-value="convertValue"
      :unit="` ${chartDisplayPrefix}${chartUnit}`"
      :filter-period="filterPeriod"
      :compare-dates="compareDates"
      :show-total-line="showTotalLine"
      :use-offset-diverge="useOffsetDiverge"
      :class="{ dragging: dragging }"
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
      :svg-height="chartHeight"
      :domains1="domains"
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
      :should-convert-value="shouldConvertValue"
      :convert-value="convertValue"
      :class="{ dragging: dragging }"
      class="vis-chart"
      @date-hover="handleDateHover"
      @domain-hover="handleDomainHover"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
    />
    <date-brush
      v-if="showDateAxis && chartShown"
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

    <Divider 
      style="margin-left: 0.5rem;"
      :allow-x="false" 
      :show="showDivider"
      @dragging="(d) => dragging = d" 
      @dragged="onDragged"
      @last-drag="() => draggedHeight = chartHeight" />
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
import StackedAreaVis from '@/components/Vis/StackedArea.vue'
import Divider from '@/components/Divider.vue'
import EmissionsChartOptions from './EmissionsChartOptions'

const emissionsOptions = {
  type: [
    OPTIONS.CHART_HIDDEN,
    OPTIONS.CHART_STACKED,
    OPTIONS.CHART_PROPORTION,
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
    EmissionsChartOptions,
    StackedAreaVis,
    MultiLine,
    DateBrush,
    Divider
  },

  props: {
    emissionsDataset: {
      type: Array,
      default: () => []
    },
    emissionsProjectionDataset: {
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
    emissionsOptions: {
      type: Object,
      default: () => emissionsOptions
    }
  },

  data() {
    return {
      chartHeight: 200,
      draggedHeight: 200,
      dragging: false,
      showDivider: false
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

    showDateAxis: {
      get() {
        return this.$store.getters['chartOptionsEmissionsVolume/chartDateAxis']
      },
      set(value) {
        this.$store.commit('chartOptionsEmissionsVolume/chartDateAxis', value)
      }
    },

    shouldConvertValue() {
      return (
        this.isTypeArea ||
        ((this.isTypeLine || this.isTypeChangeSinceLine) &&
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
      let unit = this.chartCurrentUnit
      if (
        this.isTypeProportion ||
        ((this.isTypeLine || this.isTypeChangeSinceLine) &&
          this.chartYAxis === OPTIONS.CHART_YAXIS_PERCENTAGE)
      ) {
        unit = '%'
      }
      return unit
    },

    hoverEmissionsDomain() {
      const domain = this.hoverDomain
      if (domain) {
        const split = domain.split('.')

        if (split.length > 1) {
          split.pop()
          return `${split.join('.')}.${EMISSIONS}`
        } else {
          return domain
        }
      }
      return ''
    },
    highlightId() {
      const domain = this.highlightDomain
      const find = this.domains.find((d) => d[this.propName] === domain)
      return find ? find.id : domain
    },
    yMax() {
      const dataset = _cloneDeep(this.withProjectionDataset)
      dataset.forEach((d) => {
        let stackedMax = 0
        this.domains.forEach((domain) => {
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
        this.domains.forEach((domain) => {
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
        this.domains.forEach((domain) => {
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

      this.withProjectionDataset.forEach((d) => {
        this.domains.forEach((domain) => {
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
      return domains.filter((d) => !_includes(hidden, d[this.propName]))
    },

    hasProjectionDataset() {
      return this.emissionsProjectionDataset.length > 0
    },

    stackedDataset() {
      const dataset = _cloneDeep(this.emissionsDataset)
      dataset.forEach((d) => {
        this.emissionsDomains.forEach((e) => {
          if (e.category === FT.LOAD) {
            const negValue = -d[e.id]
            d[e.id] = negValue
          }
        })
      })

      return dataset
    },

    stackedProjectionDataset() {
      const dataset = _cloneDeep(this.emissionsProjectionDataset)
      dataset.forEach((d) => {
        this.emissionsDomains.forEach((e) => {
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

    lineProjectionDataset() {
      return this.emissionsProjectionDataset
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
        if (this.chartYAxis === OPTIONS.CHART_YAXIS_EMISSIONS_VOL) {
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
        if (this.chartYAxis === OPTIONS.CHART_YAXIS_EMISSIONS_VOL) {
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

        this.emissionsDomains.forEach((e) => {
          total += d[e.id]
        })

        this.emissionsDomains.forEach((e) => {
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

        this.emissionsDomains.forEach((e) => {
          total += d[e.id]
        })

        this.emissionsDomains.forEach((e) => {
          const value = d[e.id]
          d[e.id] = (value / total) * 100
        })
      })

      return dataset
    },

    proportionDataset() {
      const dataset = _cloneDeep(this.emissionsDataset)
      dataset.forEach((d) => {
        let total = 0

        this.emissionsDomains.forEach((e) => {
          total += d[e.id]
        })

        this.emissionsDomains.forEach((e) => {
          const value = d[e.id]
          d[e.id] = (value / total) * 100
        })
      })

      return dataset
    },

    proportionProjectionDataset() {
      const dataset = _cloneDeep(this.emissionsProjectionDataset)
      dataset.forEach((d) => {
        let total = 0

        this.emissionsDomains.forEach((e) => {
          total += d[e.id]
        })

        this.emissionsDomains.forEach((e) => {
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
      const find = this.domains.find((d) => d.id === this.hoverEmissionsDomain)
      return find ? find.label : '—'
    },
    hoverDomainColour() {
      const find = this.domains.find((d) => d.id === this.hoverEmissionsDomain)
      return find ? find.colour : '—'
    },
    hoverTotal() {
      let total = 0
      if (this.hoverData) {
        this.domains.forEach((d) => {
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
    }
  },

  mounted() {
    this.$emit('changeDataset', this.changeSinceDataset)
    this.chartHeight = this.visHeight
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

    onDragged({ offsetY }) {
      if (this.draggedHeight + offsetY > 50) {
        this.chartHeight = this.draggedHeight + offsetY
      } else {
        this.chartHeight = 50
      }
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
        this.domains.forEach((domain) => {
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
.dragging {
  pointer-events: none;
  user-select: none;
}
</style>
