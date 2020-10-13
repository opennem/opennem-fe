<template>
  <div>
    <div 
      :class="{
      'is-hovered': hoverOn }" 
      class="chart">
      <span>Av: {{ averageValue }}</span>
      <power-chart-options
        :chart-title="chartTitle"
        :options="chartOptions"
        :chart-shown="chartShown"
        :chart-type="chartType"
        :chart-curve="chartCurve"
        :chart-y-axis="chartYAxis"
        :display-unit="displayUnit"
        :hover-display-date="hoverDisplayDate"
        :hover-value="hoverValue"
        :hover-domain-label="hoverDomainLabel"
        :hover-domain-colour="hoverDomainColour"
        :hover-total="hoverTotal"
        :average-value="averageValue"
        :show-hover="domains.length > 1"
        :is-energy-type="isEnergyType"
      />
      <stacked-area-vis
        v-if="chartShown"
        :range="range"
        :interval="interval"
        :domains="domains"
        :dataset="dataset"
        :y-min="yMin"
        :y-max="computedYMax"
        :y-axis-ticks="3"
        :x-ticks="xTicks"
        :vis-height="200"
        :curve="chartCurve"
        :dynamic-extent="zoomExtent"
        :zoomed="zoomExtent.length > 0"
        :show-tooltip="false"
        :highlight-domain="highlightId"
        :hover-on="hoverOn"
        :hover-date="hoverDate"
        :x-guides="xGuides"
        :y-guides="yGuides"
        class="vis-chart"
        @dateOver="handleDateHover"
        @domainOver="handleDomainHover"
        @enter="handleVisEnter"
        @leave="handleVisLeave"
        @zoomExtent="handleZoomExtent"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import parseISO from 'date-fns/parseISO'
import getTime from 'date-fns/getTime'
import _cloneDeep from 'lodash.clonedeep'

import EnergyToAveragePower from '@/modules/dataTransform/energy-to-average-power.js'
import DateDisplay from '@/services/DateDisplay.js'
import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si.js'
import StackedAreaVis from '@/components/Vis/StackedArea.vue'
import PowerChartOptions from '@/components/Facility/Charts/PowerChartOptions'

const options = {
  type: [OPTIONS.CHART_HIDDEN, OPTIONS.CHART_STACKED],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: []
}

export default {
  components: {
    PowerChartOptions,
    StackedAreaVis
  },

  props: {
    domains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    zoomExtent: {
      type: Array,
      default: () => []
    },
    hoverOn: {
      type: Boolean,
      default: false
    },
    hoverDate: {
      type: Date,
      default: null
    },
    facilityId: {
      type: String,
      default: ''
    },
    yMax: {
      type: Number,
      default: 0
    },

    chartTitle: {
      type: String,
      default: ''
    },
    chartShown: {
      type: Boolean,
      default: false
    },
    chartType: {
      type: String,
      default: ''
    },
    chartYAxis: {
      type: String,
      default: ''
    },
    isYAxisAveragePower: {
      type: Boolean,
      default: false
    },
    chartCurve: {
      type: String,
      default: ''
    },
    displayUnit: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      hoverDomain: '',
      filteredDataset: []
    }
  },

  computed: {
    ...mapGetters({
      dataType: 'facility/dataType',
      range: 'facility/range',
      interval: 'facility/interval',
      highlightDomain: 'visInteract/highlightDomain',
      xGuides: 'visInteract/xGuides',
      xTicks: 'visInteract/xTicks'
    }),
    isEnergyType() {
      return this.dataType === 'energy'
    },
    averageValue() {
      const total = this.filteredDataset.reduce((a, b) => a + b._total, 0)
      const average = total / this.filteredDataset.length

      console.log(total, average)
      return average
    },
    highlightId() {
      const domain = this.highlightDomain
      const find = this.domains.find(d => d.code === domain)
      return find ? find.code : ''
    },
    yMin() {
      let lowest = 0
      this.dataset.forEach(d => {
        let total = 0
        this.domains.forEach(domain => {
          total += d[domain.id] || 0
        })

        if (total < lowest) {
          lowest = total
        }
      })

      return lowest
    },
    yGuides() {
      return this.dataType === 'power' ||
        (this.dataType === 'energy' && this.isYAxisAveragePower)
        ? [
            {
              value: this.yMax,
              text: 'Registered Capacity'
            }
          ]
        : []
    },
    computedYMax() {
      let highest = 0

      this.dataset.forEach(d => {
        let total = 0
        this.domains.forEach(domain => {
          total += d[domain.id] || 0
        })

        if (total > highest) {
          highest = total
        }
      })

      if (highest <= this.yMax) {
        highest = this.yMax
      }

      return highest + (highest * 10) / 100
    },
    hoverData() {
      if (!this.hoverDate) {
        return null
      }
      const time = this.hoverDate.getTime()
      return this.dataset.find(d => d.time === time)
    },
    hoverValue() {
      return this.hoverData ? this.hoverData[this.hoverDomain] : null
    },
    hoverDisplayDate() {
      if (!this.hoverDate) {
        return ''
      }
      return DateDisplay.specialDateFormats(
        this.hoverDate.getTime(),
        this.range,
        this.interval,
        false,
        false,
        false,
        true
      )
    },
    hoverTotal() {
      let total = 0
      let allNulls = true
      if (this.hoverData) {
        this.domains.forEach(d => {
          const value = this.hoverData[d.code]
          total += value || 0
          if (value || value === 0) {
            allNulls = false
          }
        })
      }
      return allNulls ? null : total
    },
    hoverDomainLabel() {
      const find = this.domains.find(d => d.code === this.hoverDomain)
      return find ? find.code : '—'
    },
    hoverDomainColour() {
      const find = this.domains.find(d => d.code === this.hoverDomain)
      return find ? find.colour : '—'
    },

    chartOptions() {
      let o = _cloneDeep(options)
      if (this.isEnergyType) {
        o.yAxis = [
          OPTIONS.CHART_YAXIS_ENERGY,
          OPTIONS.CHART_YAXIS_AVERAGE_POWER
        ]
      }
      return o
    }
  },

  watch: {
    interval(val) {
      this.updateXGuides()
      this.updateXTicks()
    },
    range() {
      this.updateXTicks()
    },
    zoomExtent() {
      this.updateFilteredDataset()
    }
  },

  created() {
    this.updateXGuides()
    this.updateXTicks()
    this.updateFilteredDataset()
  },

  methods: {
    ...mapActions({
      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateXTicks: 'visInteract/doUpdateXTicks'
    }),

    updateFilteredDataset() {
      if (this.zoomExtent.length === 2) {
        const start = this.zoomExtent[0].getTime()
        const end = this.zoomExtent[1].getTime()
        this.filteredDataset = this.dataset.filter(
          d => d.time >= start && d.time <= end
        )
      } else {
        this.filteredDataset = this.dataset
      }
    },

    updateXGuides() {
      if (this.dataset.length > 0) {
        this.doUpdateXGuides({
          interval: this.interval,
          start: this.dataset[0].time,
          end: this.dataset[this.dataset.length - 1].time
        })
      }
    },

    updateXTicks() {
      this.doUpdateXTicks({
        range: this.range,
        interval: this.interval,
        isZoomed: this.zoomExtent.length > 0,
        filterPeriod: 'All'
      })
    },

    handleDomainHover(domain) {
      this.hoverDomain = domain
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
    handleZoomExtent(dateRange) {
      this.$emit('zoomExtent', dateRange)
    }
  }
}
</script>
