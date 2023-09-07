<template>
  <div class="range-interval-selectors">
    <div 
      class="field has-addons range-buttons buttons has-addons" 
      style="margin-bottom: 0;">
        
      <button 
        v-for="d in ranges"
        :key="d.value"
        style="font-size: 11px;"
        class="button is-rounded" 
        :class="{ 'is-selected': range === d.value }"
        @click="() => handleRangeClick(d.value)">
        <span>{{ d.label }}</span>
      </button>
        
    </div>

    <div 
      class="field has-addons range-buttons buttons has-addons" 
      style="margin-bottom: 0;">
        
      <button
        v-for="d in intervals"
        :key="d.value" 
        style="font-size: 11px;"
        class="button is-rounded" 
        :class="{ 'is-selected': interval === d.value }"
        @click="() => handleIntervalClick(d.value)">
        <span>{{ d.label }}</span>
      </button>
        
    </div>
  </div>
</template>

<script>
import { getRangeQueryByRange } from '@/constants/range-queries.js'
import { getIntervalQueryByInterval } from '@/constants/interval-queries.js'

export default {
  props: {
    view: {
      type: String,
      default: 'main'
    },
    range: {
      type: String,
      default: '3D'
    },
    interval: {
      type: String,
      default: '5m'
    }
  },

  data() {
    return {
      ranges: [
        {
          label: '3D',
          value: '3D'
        },
        {
          label: '7D',
          value: '7D'
        },
        {
          label: '30D',
          value: '30D'
        }
      ],
      intervals: [
        {
          label: '5m',
          value: '5m'
        },
        {
          label: '30m',
          value: '30m'
        }
      ]
    }
  },

  methods: {
    handleRangeClick(range) {
      this.updateQuery(range, this.interval)
      this.$emit('rangeChange', range)
    },

    handleIntervalClick(interval) {
      this.updateQuery(this.range, interval)
      this.$emit('intervalChange', interval)
    },

    updateQuery(range, interval) {
      const query = {
        range: getRangeQueryByRange(range),
        interval: getIntervalQueryByInterval(interval)
      }

      this.$emit('queryChange', query)
    },
  }

}
</script>