<template>
  <div 
    class="button-group" 
    style="gap: 8px;">
    <div 
      class="range-buttons buttons has-addons" 
      style="margin-bottom: 0;">
      <button 
        v-for="d in ranges"
        :key="d.value"
        class="button is-rounded" 
        :class="{ 'is-selected': range === d.value }"
        @click="() => handleRangeClick(d.value)">
        <span>{{ d.label }}</span>
      </button>
        
    </div>

    <div class="interval-dropdowns">
      <IntervalDropdown
        :show-caret="intervals.length > 1"
        :selected="interval" 
        :options="intervals.map(d => d.value)"
        @option-change="handleIntervalClick" />
    </div>
  </div>
</template>

<script>
import { getRangeQueryByRange } from '@/constants/range-queries.js'
import { getIntervalQueryByInterval } from '@/constants/interval-queries.js'
import IntervalDropdown from '@/components/Energy/IntervalDropdown.vue'

export default {
  components: {
    IntervalDropdown
  },

  props: {
    view: {
      type: String,
      default: 'main'
    },
    range: {
      type: String,
      default: '7D'
    },
    interval: {
      type: String,
      default: '30m'
    }
  },

  data() {
    return {
      ranges: [
        {
          label: '7D',
          value: '7D'
        },
        {
          label: '14D',
          value: '14D'
        },
        {
          label: '28D',
          value: '28D'
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
      this.$emit('rangeChange', range, true)
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