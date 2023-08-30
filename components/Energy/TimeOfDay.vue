<template>
  <div style="display: flex;">
    <div style="width: 25%;">
      <table 
        style="font-size: 11px;" 
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
            <th style="text-align:right;">{{ currentX }}</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(domain, i) in tableRowDomains" 
            :key="`${domain.id}-${i}`"
            style="font-weight: bold;"
            :style="{
              color: getTextColour(domain.id)
            }"
            @mouseenter="() => handleMouseEnter(domain.id)"
            @mouseleave="() => handleMouseLeave()">
            <td>{{ domain.label }}</td>
            <td style="text-align: right;">{{ domain.value | formatValue }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div 
      style="width: 75%" 
      class="vis-wrapper">
      <MultiLine
        :svg-height="chartHeight"
        :domains1="domainsWithColour"
        :dataset1="lineDataset"
        :y1-max="yMax"
        :y1-min="yMin"
        :y1-ticks="yTicks"
        :x-ticks="xTicks"
        :curve="chartCurve"
        :date-hovered="hoverDate"
        :highlight-domain="highlightDomain"
        :positive-y-bg="'rgba(255,255,255, 0.2)'"
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
        class="date-brush vis-chart"
      />
    </div>
  </div>
</template>

<script>
import { utcHour } from 'd3-time'
import _cloneDeep from 'lodash.clonedeep'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'

export default {
  components: {
    MultiLine,
    DateBrush
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
    tickFormat: {
      type: Function,
      default: () => {}
    },
    secondTickFormat: {
      type: Function,
      default: () => {}
    },
    chartCurve: {
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
    todayKey: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      expand: false,
      xTicks: utcHour.every(2),
      highlightDomain: null,
      hightlightRow: null
    }
  },

  computed: {
    chartHeight() {
      return this.expand ? 400 : 200
    },

    domainsWithColour() {
      return this.domains.map((domain) => {
        return {
          ...domain,
          colour: this.getChartColour(domain.id),
          value: this.hoverValues ? this.hoverValues[domain.id] : null
        }
      })
    },

    lineDataset() {
      const arr = _cloneDeep(this.dataset)

      arr.forEach((d, i) => {
        const start = d.time
        const next = arr[i+1] ? arr[i+1].time : null
        if (next) {
          const mid = (next - start) / 2
          d.displayTime = d.time + mid
        }
      })

      const lastSecondItem = arr[arr.length - 2]
      const lastItem = arr[arr.length - 1]
      const mid = (lastItem.time - lastSecondItem.time) / 2
      lastItem.displayTime = lastItem.time + mid

      return arr
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

  watch: {
    yMax(val) {
      // console.log(val)
    }
  },

  methods: {
    handleDomainHover(domain) {
      // this.hightlightRow = domain
    },
    
    handleVisEnter() {
      // this.$emit('isHovering', true)
    },

    handleVisLeave() {
      // this.$emit('isHovering', false)
    },

    getChartColour(id) {
      if (id === '_average') return '#DC3A33'
      return this.todayKey === id ? '#333' : this.expand ? '#cfcfcf' : '#ddd';
    },

    getTextColour(id) {
      if (id === '_average') return '#DC3A33'
      return this.todayKey === id ? '#333' : this.expand ? '#787878' : '#ddd';
    },

    handleTableToggle() {
      this.expand = !this.expand
    },

    handleMouseEnter(id) {
      this.highlightDomain = id
    },

    handleMouseLeave() {
      this.highlightDomain = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

table.table {
  position: sticky;
  top: 0;
  background: none;
  border-bottom: 1px solid #696969;
  
  thead tr th {
    border-bottom: 1px solid #696969;
    padding-left: 0;
    vertical-align: bottom;
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
}
</style>
