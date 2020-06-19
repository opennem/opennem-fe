<template>
  <div class="chart-title">
    <div class="chart-label">
      <chart-options 
        :show="show" 
        @show-change="handleChartOptionsChange" />
      <slot name="label-unit"/>
    </div>
    
    <div class="hover-date-value">
      <div class="average-value">
        <slot name="average-value" />
      </div>
      <div class="hover-date">
        <time>
          <slot name="hover-date" />
        </time>
      </div>
      <div class="hover-values">
        <slot name="hover-values" />
      </div>
    </div>
  </div>
</template>
<script>
import ChartOptions from '@/components/Vis/ChartOptions'

export default {
  components: {
    ChartOptions
  },
  props: {
    show: {
      type: Boolean,
      default: () => false
    }
  },
  methods: {
    handleChartOptionsChange(show) {
      this.$emit('show-change', show)
    }
  }
}
</script>
