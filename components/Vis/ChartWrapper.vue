<template>
  <div class="chart">
    <button
      v-if="zoomBtn"
      class="button is-rounded is-small reset-btn"
      @click.stop="handleReset"
    >
      Zoom Out
    </button>
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
    zoomBtn: {
      type: Boolean,
      default: () => false
    },
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
    },
    handleReset() {
      this.$emit('date-filter', [])
    }
  }
}
</script>

<style lang="scss" scoped>
.chart {
  position: relative;
}
.reset-btn {
  position: absolute;
  top: 30px;
  right: 20px;
}
</style>
