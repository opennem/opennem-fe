<template>
  <svg 
    :id="id" 
    :height="svgHeight" 
    :width="svgWidth" 
    class="colour-legend" />
</template>

<script>
import { select } from 'd3-selection'
import { axisBottom } from 'd3-axis'
import { scaleLinear } from 'd3-scale'

function rampHorizontal(x, color, height) {
  var size = height

  function ramp(g) {
    var image = g.selectAll('image').data([null]),
      xz = x.range(),
      x0 = xz[0],
      x1 = xz[xz.length - 1],
      canvas = document.createElement('canvas'),
      context = ((canvas.width = x1 - x0 + 1),
      (canvas.height = 1),
      canvas).getContext('2d')

    for (var i = x0; i <= x1; ++i) {
      context.fillStyle = color(x.invert(i))
      context.fillRect(i - x0, 0, 1, 1)
    }

    image = image
      .enter()
      .append('image')
      .merge(image)
      .attr('x', x0)
      .attr('y', -size)
      .attr('width', x1 - x0 + 1)
      .attr('height', size)
      .attr('preserveAspectRatio', 'none')
      .attr('xlink:href', canvas.toDataURL())
  }

  ramp.position = function(_) {
    return arguments.length ? ((x = _), ramp) : x
  }

  ramp.color = function(_) {
    return arguments.length ? ((color = _), ramp) : color
  }

  ramp.size = function(_) {
    return arguments.length ? ((size = +_), ramp) : size
  }

  return ramp
}

export default {
  props: {
    svgWidth: {
      type: Number,
      default: 300
    },
    svgHeight: {
      type: Number,
      default: 50
    },
    unit: {
      type: String,
      default: ''
    },
    multiplier: {
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

  data() {
    return {
      margin: {
        top: 0,
        right: 20,
        bottom: 20,
        left: 20
      }
    }
  },

  computed: {
    id() {
      return `colour-legend-${this._uid}`
    }
  },

  watch: {
    colourDomain() {
      this.update()
    }
  },

  mounted() {
    this.update()
  },

  methods: {
    update() {
      const svg = select(`#${this.id}`)

      var colour = scaleLinear()
        .domain(this.colourDomain)
        .range(this.colourRange)

      var x = scaleLinear().range([
        this.margin.left,
        this.svgWidth - this.margin.right
      ])

      svg.select('.zero-rect').remove()
      svg.select('.ramp-group').remove()

      svg
        .append('rect')
        .attr('class', 'zero-rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.margin.left)
        .attr('height', this.svgHeight - this.margin.bottom)
        .style('fill', colour(0))

      svg
        .append('g')
        .attr('class', 'ramp-group')
        .attr(
          'transform',
          `translate(0,${this.svgHeight - this.margin.bottom})`
        )
        .call(rampHorizontal(x, colour, this.svgHeight))
        .call(
          axisBottom(x)
            .ticks(4)
            .tickFormat(d => `${d * this.multiplier}${this.unit}`)
        )
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
