<template>
  <div class="chart">
    <div 
      class="chart-title" 
      @click="toggle">
      <div class="chart-label">
        <i
          :class="{
            'fa-caret-down': showChart,
            'fa-caret-right': !showChart
          }"
          class="fal fa-fw" />
        <slot name="header"/>
      </div>
    </div>
    <slot/>
  </div>
</template>

<script>
export default {
  props: {
    showChart: {
      type: Boolean,
      default: () => true
    },
    stateName: {
      type: String,
      default: () => ''
    }
  },

  methods: {
    toggle() {
      this.$store.dispatch(this.stateName, !this.showChart)
    }
  }
}
</script>
