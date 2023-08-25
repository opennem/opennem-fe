<template>
  <div style="display: flex;">
    <div style="width: 20%; font-size: 0.8em;">
      <table class="table is-striped is-narrow is-fullwidth">
        <thead>
          <tr>
            <th 
              colspan="2" 
              style="text-align:right">{{ currentX }}</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(domain, i) in tableRowDomains" 
            :key="`${domain.id}-${i}`"
            style="font-weight: bold;"
            :style="{ color: getTextColour(domain.id) }">
            <td>{{ domain.id }}</td>
            <td style="text-align: right;">{{ domain.value | formatValue }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div 
      style="width: 80%" 
      class="vis-wrapper">
      <MultiLine
        :svg-height="250"
        :domains1="domains"
        :dataset1="dataset"
        :y1-max="yMax"
        :y1-min="yMin"
        :x-ticks="xTicks"
        :curve="chartCurve"
        :date-hovered="hoverDate"
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
import _cloneDeep from 'lodash.clonedeep'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'

export default {
  components: {
    MultiLine,
    DateBrush
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
    xTicks: {
      type: Function,
      default: () => {}
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

  computed: {
    tableRowDomains() {
      return this.domains.map((domain) => {
        return {
          id: domain.id,
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
      // console.log(domain)
    },
    
    handleVisEnter() {
      // this.$emit('isHovering', true)
    },

    handleVisLeave() {
      // this.$emit('isHovering', false)
    },
    
    getTextColour(id) {
      if (id === '_average') return '#e34a33'
      return this.todayKey === id ? 'steelblue' : '#123123'
    }
  }
}
</script>
