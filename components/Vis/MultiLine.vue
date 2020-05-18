<template>
  <div class="vis multi-line-vis">
    <svg 
      :width="svgWidth"
      :height="svgHeight"
      :id="id">
      
      <g 
        :transform="axisTransform" 
        class="x-axis" />
      <g 
        :transform="axisTransform" 
        class="y-axis" />
      <g 
        :transform="axisTransform" 
        class="line-path-group" />
    </svg>
  </div>
</template>

<script>
import { select } from 'd3-selection'
import { scaleOrdinal, scaleLinear, scaleTime } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { line as d3Line } from 'd3-shape'
import { extent } from 'd3-array'

export default {
  props: {
    lineDomains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    yMax: {
      type: Number,
      default: () => 200
    }
  },

  data() {
    return {
      svgWidth: 0,
      svgHeight: 250,
      width: 0,
      height: 0,
      margin: { left: 10, right: 1, top: 20, bottom: 10 },
      x: null,
      y: null,
      z: null,
      xAxis: null,
      yAxis: null,
      line: null,
      $xAxisGroup: null,
      $yAxisGroup: null,
      $linePathGroup: null
    }
  },

  computed: {
    id() {
      return `multi-line-${this.uuid}`
    },

    axisTransform() {
      return `translate(${this.margin.left},0)`
    },

    colours() {
      const dict = {}
      this.lineDomains.forEach(d => {
        dict[d.domain] = d.colour
      })
      return dict
    }
  },

  watch: {
    dataset() {
      console.log(this.dataset)
      this.draw()
    }
  },

  mounted() {
    this.setupWidthHeight()
    this.setup()
  },

  methods: {
    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      const width = chartWidth - this.margin.left - this.margin.right
      const height = this.svgHeight - this.margin.top - this.margin.bottom

      this.svgWidth = chartWidth
      this.width = width < 0 ? 0 : width
      this.height = height < 0 ? 0 : height
    },

    setup() {
      const $svg = select(`#${this.id}`)
      // Axis DOM
      this.$xAxisGroup = $svg.select('.x-axis')
      this.$yAxisGroup = $svg.select('.y-axis')

      // Define scales
      this.x = scaleTime().range([0, this.width])
      this.y = scaleLinear().range([this.height, 0])
      this.z = scaleOrdinal()

      // Axis
      this.xAxis = axisBottom(this.x).tickSize(this.height)
      this.yAxis = axisLeft(this.y)
        .tickSize(-this.width)
        .ticks(5)

      // Line
      this.$linePathGroup = $svg.select('.line-path-group')
      this.line = d3Line()
        .x(d => this.x(d.date))
        .y(d => this.y(d.value))
      this.line.defined(d => d.value || d.value === 0)
    },

    draw() {
      const xExtent = extent(this.dataset, d => new Date(d.date))
      this.x.domain(xExtent)
      this.y.domain([0, this.yMax])

      this.$xAxisGroup.call(this.xAxis)
      this.$yAxisGroup.call(this.yAxis)

      const keys = Object.keys(this.dataset[0]).filter(key => key !== 'date')

      this.$linePathGroup.selectAll('path').remove()
      this.$linePathGroup
        .selectAll('path')
        .data(keys)
        .enter()
        .append('path')
        .attr('class', key => `${key}-path`)
        .style('stroke', key => this.colours[key])
        .style('fill', 'transparent')
        .attr('d', key => {
          const data = this.dataset.map(d => {
            return {
              date: d.date,
              value: d[key]
            }
          })
          return this.line(data)
        })
    }
  }
}
</script>
