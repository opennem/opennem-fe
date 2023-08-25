<template>
  <div class="range-interval-selectors">
    <div 
      class="field has-addons range-buttons buttons has-addons" 
      style="margin-bottom: 0;">
        
      <button 
        v-for="range in ranges"
        :key="range.value"
        style="font-size: 11px;"
        class="button is-rounded" 
        :class="{ 'is-selected': view === range.value }"
        @click="handleRangeClick">
        <span>{{ range.label }}</span>
      </button>
        
    </div>

    <div 
      class="field has-addons range-buttons buttons has-addons" 
      style="margin-bottom: 0;">
        
      <button
        v-for="interval in intervals"
        :key="interval.value" 
        style="font-size: 11px;"
        class="button is-rounded" 
        :class="{ 'is-selected': view === interval.value }"
        @click="handleIntervalClick">
        <span>{{ interval.label }}</span>
      </button>
        
    </div>
  </div>
</template>

<script>
export default {
  props: {
    view: {
      type: String,
      default: 'main'
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
      this.$emit('range-click', range)
    },

    handleIntervalClick(interval) {
      this.$emit('interval-click', interval)
    }
  }

}
</script>