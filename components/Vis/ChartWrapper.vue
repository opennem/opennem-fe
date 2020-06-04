<template>
  <div 
    :class="{'is-hovered': isHovering}" 
    class="chart">
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
      <div 
        v-if="showChart" 
        class="hover-date-value">
        <div class="hover-date">
          <time>
            <slot name="datetime"/>
          </time>
        </div>
        <div class="hover-values">
          <hover-values 
            v-for="(v, i) in hoverValues" 
            :key="i" 
            :label="v.label" 
            :value="formatter(v.value)" 
            :unit="v.unit" 
            :colour="v.colour"/>
        </div>
      </div>
    </div>
    <slot/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import HoverValues from '@/components/Vis/HoverValues'

export default {
  components: {
    HoverValues
  },
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
    },
    hoverValues: {
      type: Array,
      default: () => []
    },
    formatter: {
      type: Function,
      default: v => v
    }
  },
  computed: {
    ...mapGetters({
      isHovering: 'visInteract/isHovering'
    })
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
