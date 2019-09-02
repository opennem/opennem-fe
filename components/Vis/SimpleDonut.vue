<template>
  <div class="vis donut-vis">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :id="donutId"
      :viewBox="viewBox"
      class="donut-chart">
      <g class="slices" />
      <g class="total">
        <text>{{ total | formatValue }}</text>
      </g>
    </svg>
  </div>
</template>

<script>
import _debounce from 'lodash.debounce'
import { scaleOrdinal as d3ScaleOrdinal } from 'd3-scale'
import { pie as d3Pie, arc as d3Arc } from 'd3-shape'
import { select as d3Select, selectAll as d3SelectAll } from 'd3-selection'

export default {
  props: {
    donutId: {
      type: String,
      default: () => ''
    },
    dataset: {
      type: Array,
      default: () => []
    },
    domains: {
      type: Array,
      default: () => []
    },
    dynamicExtent: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      svgWidth: 0,
      svgHeight: 0,
      width: 0,
      height: 0,
      radius: 0,
      pie: null,
      arc: null,
      colour: null
    }
  },

  computed: {
    donutDataset() {
      const domains = this.domains
      const dataset = this.dataset

      return domains.map(domain => {
        const id = domain.id
        return {
          name: id,
          value: dataset.reduce((a, b) => a + (b[id] || 0), 0)
        }
      })
    },

    total() {
      return this.donutDataset.reduce((a, b) => a + b.value, 0)
    },

    domainIds() {
      return this.domains.map(d => d.id).reverse()
    },

    domainColours() {
      return this.domains.map(d => d.colour).reverse()
    },

    viewBox() {
      return `${-this.width / 2},${-this.height / 2},${this.width},
        ${this.height}
      `
    }
  },

  watch: {
    donutDataset() {
      this.update()
    }
  },

  mounted() {
    window.addEventListener('resize', _debounce(this.handleResize, 10))
    this.setupWidthHeight()
    this.setup()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    setupWidthHeight() {
      const chartWidth = 150
      this.svgWidth = chartWidth
      this.svgHeight = chartWidth
      this.width = chartWidth
      this.height = chartWidth
      this.radius = Math.min(this.width, this.height) / 2
    },

    handleResize() {
      this.setupWidthHeight()
      // this.resizeRedraw()
    },

    setup() {
      this.pie = d3Pie()
        .padAngle(0.005)
        .sort(null)
        .value(d => d.value)
      this.arc = d3Arc()
        .innerRadius(this.radius * 0.5)
        .outerRadius(this.radius - 1)
      this.colour = d3ScaleOrdinal()
    },

    update() {
      const $donutGroup = d3Select(`#${this.donutId} .slices`)
      this.colour.range(this.domainColours).domain(this.domainIds)

      const arcs = this.pie(this.donutDataset)
      $donutGroup
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('d', this.arc)
        .attr('fill', d => this.colour(d.data.name))
    }
  }
}
</script>
<style lang="scss" scoped>
.total {
  font-size: 12px;
}
</style>
