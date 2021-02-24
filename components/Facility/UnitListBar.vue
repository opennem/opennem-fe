<template>
  <div class="row-bar-wrapper">
    <div
      v-if="isValidContribution"
      :style="{
        'width': `${width}px`,
        'background-color': colour,
        opacity: 0.4
      }"
      class="row-bar" />

    <div
      v-if="isValidContribution"
      class="contribution">
      {{ contribution | percentageFormatNumber }}
    </div>
  </div>
</template>

<script>
import { scaleLinear as d3ScaleLinear } from 'd3-scale'

export default {
  props: {
    barWidth: {
      type: Number,
      default: () => 100
    },
    highlightDomain: {
      type: String,
      default: null
    },
    colour: {
      type: String,
      default: null
    },
    value: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      x: null
    }
  },

  computed: {
    width() {
      this.x.domain([0, this.total])
      return this.x(this.value)
    },
    isValidContribution() {
      return this.value && this.total
    },
    contribution() {
      return (this.value / this.total) * 100
    }
  },

  watch: {
    total(d) {
      this.x.domain([0, d])
    },
    barWidth(d) {
      this.x.range([0, this.barWidth])
    }
  },

  created() {
    this.x = d3ScaleLinear().range([0, this.barWidth])
  }
}
</script>

<style lang="scss" scoped>
.row-bar-wrapper {
  width: 45%;
  display: flex;
  align-items: center;

  .contribution {
    // width: 10%;
    font-size: 0.8em;
    margin-left: 0.25rem;
  }
  .row-bar {
    width: 1px;
    height: 18px;
    background-color: red;
  }
}
</style>
