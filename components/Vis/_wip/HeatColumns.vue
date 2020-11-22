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
import { interpolateYlOrRd } from 'd3-scale-chromatic'
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
    }
  },

  watch: {
    dataset(d) {
      this.update(d)
    }
  },

  mounted() {
    this.update(this.dataset)
  },

  methods: {
    update(data) {
      const barWidth = this.cellWidth
      const barHeight = this.cellHeight || this.svgHeight
      const $svg = select(`#${this.id}`)
      const colour = scaleSequential(interpolateYlOrRd)
      const icolour = scaleLinear()
        .domain([0, 0.25, 0.55, 1])
        .range(['#2D9B14', '#ffe310', '#803D11', '#000000'])
        .interpolate(interpolateRgb.gamma(2.2))

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
        .style('fill', d => icolour(d[this.valueProp] / 1000))

      rect.on('mouseenter', d => {
        console.log(d[this.valueProp], d, this.valueProp)
      })
    }
  }
}
</script>
