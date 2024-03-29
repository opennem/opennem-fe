<template>
  <div 
    style="display: flex; flex-wrap: nowrap; gap: 1rem;">
    <div
      style="width: 66%; position: relative;" 
      class="vis-wrapper">

      <ChartHeader
        :title="title"
        :tooltip-values="tooltipValues"
        :average-value="averageValue"
      >
        <template 
          v-if="!isPrice" 
          v-slot:chart-unit>
          <button 
            class="display-unit" 
            @click="() => $emit('unit-click')">
            {{ chartPowerCurrentUnit }}
          </button>
        </template>
      </ChartHeader>

      <button
        v-if="zoomRange.length > 0"
        class="button is-rounded is-small reset-btn"
        @click.stop="() => $emit('date-filter', [])"
      >
        Zoom Out
      </button>

      <div v-if="isPrice">
        <MultiLine
          :svg-height="chartHeightPositiveLogPrice"
          :domains1="domainsWithColour"
          :dataset1="dataset"
          :y1-max="20000"
          :y1-min="300"
          :y1-ticks="[300, 2000, 6000, 10000, 14000]"
          :y1-log="true"
          :y1-tick-text="false"
          :y1-first-tick-text="true"
          :x-ticks="xTicks"
          :curve="curve"
          :date-hovered="hoverDate"
          :zoom-range="zoomRange"
          :highlight-domain="highlightDomain"
          :positive-y-bg="'rgba(255,255,255, 0.2)'"
          :cursor-type="'line'"
          :append-datapoint="false"
          :stroke-dasharray="'2,2'"
          :margin-left="0"
          class="vis-chart"
          @date-hover="(evt, date) => $emit('date-hover', date)" 
          @domain-hover="handleDomainHover"
          @enter="handleVisEnter"
          @leave="handleVisLeave"
        />
        <MultiLine
          style="position: relative; top: -1px"
          :svg-height="chartHeightPrice"
          :domains1="domainsWithColour"
          :dataset1="dataset"
          :y1-max="300"
          :y1-min="0"
          :y1-ticks="[0, 100, 200, 300]"
          :x-ticks="xTicks"
          :curve="curve"
          :date-hovered="hoverDate"
          :zoom-range="zoomRange"
          :highlight-domain="highlightDomain"
          :positive-y-bg="'rgba(255,255,255, 0.2)'"
          :cursor-type="'line'"
          :append-datapoint="false"
          :margin-left="0"
          class="vis-chart"
          @date-hover="(evt, date) => $emit('date-hover', date)" 
          @domain-hover="handleDomainHover"
          @enter="handleVisEnter"
          @leave="handleVisLeave"
        />
        <MultiLine
          style="position: relative; top: -1px"
          :svg-height="chartHeightNegativeLogPrice"
          :domains1="domainsWithColour"
          :dataset1="dataset"
          :y1-max="-1100"
          :y1-min="-0.1"
          :y1-invert="true"
          :y1-ticks="[-60, -400]"
          :y1-log="true"
          :y1-tick-text="false"
          :x-ticks="xTicks"
          :curve="curve"
          :date-hovered="hoverDate"
          :zoom-range="zoomRange"
          :highlight-domain="highlightDomain"
          :positive-y-bg="'rgba(255,255,255, 0.2)'"
          :cursor-type="'line'"
          :append-datapoint="false"
          :stroke-dasharray="'2,2'"
          :margin-left="0"
          class="vis-chart"
          @date-hover="(evt, date) => $emit('date-hover', date)" 
          @domain-hover="handleDomainHover"
          @enter="handleVisEnter"
          @leave="handleVisLeave"
        />
      </div>
      
      <MultiLine
        v-else
        :svg-height="chartHeight"
        :domains1="domainsWithColour"
        :dataset1="dataset"
        :y1-max="yMax"
        :y1-min="yMin"
        :y1-ticks="yTicks"
        :x-ticks="xTicks"
        :curve="curve"
        :date-hovered="hoverDate"
        :zoom-range="zoomRange"
        :highlight-domain="highlightDomain"
        :positive-y-bg="'rgba(255,255,255, 0.2)'"
        :cursor-type="'line'"
        :append-datapoint="false"
        :margin-left="0"
        :should-convert-value="shouldConvertValue"
        :convert-value="convertValue"
        :display-prefix="chartPowerDisplayPrefix"
        class="vis-chart"
        @date-hover="(evt, date) => $emit('date-hover', date)" 
        @domain-hover="handleDomainHover"
        @enter="handleVisEnter"
        @leave="handleVisLeave"
      />

      <DateBrush
        :dataset="dataset"
        :x-ticks="xTicks"
        :tick-format="tickFormat"
        :second-tick-format="secondTickFormat"
        :append-datapoint="false"
        :margin-left="0"
        :zoom-range="zoomRange"
        class="date-brush vis-chart"
        @date-hover="(evt, date) => $emit('date-hover', date)"
        @date-filter="(dateRange) => $emit('date-filter', dateRange)"
      />
    </div>

    <div style="width: 34%;">
      <table 
        style="font-size: 11px; table-layout: fixed;" 
        class="table is-narrow is-fullwidth is-hoverable">
        <thead>
          <tr>
            <th>
              <button 
                class="button is-small" 
                @click="handleTableToggle">
                <i 
                  class="fal fa-fw" 
                  :class="{ 'fa-caret-right': !expand, 'fa-caret-down': expand }" />
                {{ title }}
              </button>
            </th>

            <th style="text-align:right; white-space: nowrap">{{ isPrice ? '$/MWh' : chartPowerCurrentUnit }}</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(domain, i) in tableRowDomains" 
            :key="`${domain.id}-${i}`"
            style="font-weight: bold;"
            :style="{
              color: getTextColour(domain.id),
              'background-color': highlightRow === domain.id ? 'rgba(255,255,255, 0.8)' : 'transparent'
            }"
            @mouseenter="() => handleMouseEnter(domain.id)"
            @mouseleave="() => handleMouseLeave()">
            <td>{{ domain.label }}</td>
            <td style="text-align: right;">
              <span v-if="isPrice">
                {{ domain.value | formatCurrency }}
              </span>
              <span v-else>
                {{ convertValue(domain.value) | formatValue }}
              </span>
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <th 
              colspan="2"
              style="text-align:right; white-space: nowrap; height: 23px;">{{ currentX }}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import * as SI from '@/constants/si'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'
import ChartHeader from './ChartHeader.vue'

export default {
  components: {
    MultiLine,
    DateBrush,
    ChartHeader
  },

  props: {
    title: {
      type: String,
      default: ''
    },
    domains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    yTicks: {
      type: Array,
      default: () => []
    },
    xTicks: {
      type: Function,
      default: () => null
    },
    tickFormat: {
      type: Function,
      default: () => {}
    },
    secondTickFormat: {
      type: Function,
      default: () => {}
    },
    curve: {
      type: String,
      default: ''
    },
    yMin: {
      type: Number,
      default: 0
    },
    yMax: {
      type: Number,
      default: 0
    },
    hoverDate: {
      type: Date,
      default: null
    },
    zoomRange: {
      type: Array,
      default: () => []
    },
    todayKey: {
      type: String,
      default: ''
    },
    averageValue: {
      type: String,
      default: ''
    },
    convertValue: {
      type: Function,
      default: () => function () {}
    }
  },

  data() {
    return {
      expand: false,
      highlightDomain: null,
      highlightRow: null
    }
  },

  computed: {
    ...mapGetters({
      chartPowerCurrentUnit: 'chartOptionsPowerEnergy/chartPowerCurrentUnit',
      chartPowerDisplayPrefix: 'chartOptionsPowerEnergy/chartPowerDisplayPrefix'
    }),

    isPrice() {
      return this.title === 'Price'
    },

    shouldConvertValue() {
      return this.chartPowerDisplayPrefix === SI.GIGA
    },

    tooltipValues() {
      if (this.highlightRow && this.hoverValues) {
        const domainLabel = this.highlightRow === '_average' ? 'Average' : this.highlightRow
        const value = this.isPrice ? this.hoverValues[this.highlightRow] : this.convertValue(this.hoverValues[this.highlightRow])
        const unit = this.isPrice ? '$/MWh' : this.chartPowerCurrentUnit
        return {
          date: `${domainLabel}, ${this.hoverValues.x}`,
          value: this.formatValue({value, type: this.isPrice ? 'price' : 'power', unit}),
          unit
        }
      }

      return null
    },

    chartHeight() {
      return this.expand ? this.tableRowDomainsCount > 29 ? 692 : 400 : 200
    },

    chartHeightPrice() {
      return this.expand ? this.tableRowDomainsCount > 29 ? 392 : 200 : 100
    },
    chartHeightPositiveLogPrice() {
      return this.expand ? this.tableRowDomainsCount > 29 ? 150 : 100 : 50
    },
    chartHeightNegativeLogPrice() {
      return this.expand ? this.tableRowDomainsCount > 29 ? 150 : 100 : 50
    },

    domainsWithColour() {
      return this.domains.map((domain) => {
        return {
          ...domain,
          colour: this.getChartColour(domain.id),
          value: this.hoverValues ? this.hoverValues[domain.id] : null,
          pathStrokeWidth: this.getPathStrokeWidth(domain.id)
        }
      })
    },

    tableRowDomainsCount() {
      return this.tableRowDomains.length
    },
    
    tableRowDomains() {
      return this.expand ? this.allRowsDomains : this.collapsedDomains
    },

    allRowsDomains() {
      return this.domainsWithColour.map((domain) => {
        return {
          id: domain.id,
          label: domain.label,
          value: this.hoverValues ? this.hoverValues[domain.id] : null
        }
      }) 
    },

    collapsedDomains() {
      const domains = this.domainsWithColour.filter(d => d.id === '_average' || d.id === this.todayKey)

      return domains.map((domain) => {
        return {
          id: domain.id,
          label: domain.label,
          value: this.hoverValues ? this.hoverValues[domain.id] : null
        }
      })  
    },

    hoverValues() {
      return this.hoverDate ? this.dataset.find(d => d.time === this.hoverDate.getTime()) : null
    },

    currentX() {
      return this.hoverValues ? this.hoverValues.x : null
    }
  },

  methods: {
    handleDomainHover(domain) {
      this.highlightRow = domain
      this.highlightDomain = domain
    },
    
    handleVisEnter() {
      this.$emit('isHovering', true)
    },

    handleVisLeave() {
      this.$emit('isHovering', false)
    },

    getChartColour(id) {
      if (id === '_average') return '#DC3A33'
      return this.todayKey === id ? '#333' : this.expand ? '#aaa' : '#ccc';
    },

    getTextColour(id) {
      if (id === '_average') return '#DC3A33'
      return this.todayKey === id ? '#333' : this.expand ? '#787878' : '#ddd';
    },

    getPathStrokeWidth(id) {
      if (id === '_average') return 2
      return this.todayKey === id ? 2 : 1;
    },

    handleTableToggle() {
      this.expand = !this.expand
    },

    handleMouseEnter(id) {
      this.highlightDomain = id
    },

    handleMouseLeave() {
      this.highlightDomain = null
    },

    formatValue({ value, type, unit }) {
      if (value === null) return '—'
      if (type === 'price') return this.$options.filters.formatCurrency(value)
      return `${this.$options.filters.formatValue(value)} ${unit}`
    },
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

table.table {
  position: sticky;
  top: 0;
  background: none;
  // border-bottom: 1px solid #696969;
  
  thead tr th {
    border-bottom: 1px solid #696969;
    padding-left: 0;
    vertical-align: bottom;
  }

  tbody tr:hover {
    background-color: rgba(255,255,255, 0.8) !important;
  }

  tfoot tr th {
    border-top: 1px solid #696969;
  }

  button.button {
    background: transparent;
    padding: 0;
    color: #454545;
    font-weight: bold;
    font-size: 13px;
    height: auto;
    font-family: $header-font-family;
    min-width: auto;
  }

  .title {
    color: #454545;
    font-weight: bold;
    font-size: 13px;
    font-family: $header-font-family;
  }
}

.reset-btn {
  position: absolute;
  top: 39px;
  right: 24px;
}

.display-unit {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  background-color: transparent;
  font-size: 10px;
  border: none;
  color: #333;
  position: relative;
  top: -1px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }
}
</style>
