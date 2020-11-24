<template>
  <section>
    <svg 
      :id="id" 
      :height="svgHeight" 
      width="2000" />
  </section>
</template>

<script>
import { select } from 'd3-selection'
import { scaleSequential, scaleLinear } from 'd3-scale'
import { interpolate, piecewise, interpolateRgb } from 'd3-interpolate'

export default {
  props: {
    id: {
      type: String,
      default: ''
    },
    dataset: {
      type: Array,
      default: () => []
    },
    valueProp: {
      type: String,
      default: ''
    },
    svgHeight: {
      type: Number,
      default: 50
    },
    cellWidth: {
      type: Number,
      default: 4
    },
    cellHeight: {
      type: Number,
      default: null
    },
    radius: {
      type: Number,
      default: 0
    },
    divisor: {
      type: Number,
      default: 100
    },
    colourRange: {
      type: Array,
      default: () => []
    },
    colourDomain: {
      type: Array,
      default: () => []
    }
  },

  watch: {
    dataset(d) {
      this.update(d)
    },
    valueProp() {
      this.update(this.dataset)
    }
  },

  mounted() {
    this.update(this.dataset)
  },

  methods: {
    update(data) {
      console.log(data, this.divisor, this.id)
      const barWidth = this.cellWidth
      const barHeight = this.cellHeight || this.svgHeight
      const $svg = select(`#${this.id}`)
      const colourScale = scaleLinear()
        .domain(this.colourDomain)
        .range(this.colourRange)
        .interpolate(interpolateRgb.gamma(2.2))

      $svg.selectAll('g.cell').remove()
      const g = $svg.selectAll('g.cell').data(data)

      const rect = g
        .enter()
        .append('g')
        .attr('class', 'cell')
        .append('rect')
        .attr('x', (d, i) => i * barWidth)
        .attr('width', barWidth)
        .attr('height', barHeight)
        .attr('rx', this.radius)
        // .style('stroke', '#eee')
        .style('fill', d => colourScale(d[this.valueProp] / this.divisor))

      rect.on('mouseenter', d => {
        console.log(d[this.valueProp], d, this.valueProp)
      })
    }
  }
}
</script>
