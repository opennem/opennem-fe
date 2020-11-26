<template>
  <section>
    <div 
      :id="tooltipId" 
      class="tooltip">tooltip</div>

    <svg 
      :id="id" 
      :height="height" 
      :width="width" />
  </section>
</template>

<script>
import format from 'date-fns/format'
import { format as numFormat } from 'd3-format'
import { select, mouse, event } from 'd3-selection'
import { scaleSequential, scaleLinear } from 'd3-scale'

export default {
  props: {
    dataset: {
      type: Array,
      default: () => []
    },
    valueProp: {
      type: String,
      default: ''
    },
    svgWidth: {
      type: Number,
      default: 500
    },
    svgHeight: {
      type: Number,
      default: 50
    },
    cellWidth: {
      type: Number,
      default: 1
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
    },
    dateFormatString: {
      type: String,
      default: 'd MMM y'
    },
    unit: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      width: null,
      height: null
    }
  },

  computed: {
    id() {
      return `heatmap-${this._uid}`
    },
    tooltipId() {
      return `tooltip-${this._uid}`
    }
  },

  watch: {
    dataset(d) {
      this.update(d)
    },
    valueProp() {
      this.update(this.dataset)
    },
    svgWidth() {
      this.setupWidthHeight(this.dataset)
      this.update(this.dataset)
    }
  },

  mounted() {
    this.setupWidthHeight(this.dataset)
    this.setup()
    this.update(this.dataset)
  },

  methods: {
    setupWidthHeight(data) {
      const chartWidth = this.svgWidth
      const bWidth = chartWidth / data.length

      // this.cellWidth = bWidth
      // if (this.cellWidth === 0) {
      //   this.cellWidth = 1
      // }

      const width = chartWidth
      const height = this.cellHeight || this.height

      this.width = width < 0 ? 0 : width
      this.height = height < 0 ? 0 : height
    },

    setup() {
      this.$svg = select(`#${this.id}`)
      this.$tooltip = select(`#${this.tooltipId}`)
    },

    update(data) {
      const self = this
      // const barWidth = this.cellWidth
      const cellWidth = this.svgWidth / data.length
      const barWidth = Math.floor(cellWidth)
      const barHeight = this.height
      const colourScale = scaleLinear()
        .domain(this.colourDomain)
        .range(this.colourRange)

      this.$svg.selectAll('g.cell').remove()
      const g = this.$svg.selectAll('g.cell').data(data)

      const rect = g
        .enter()
        .append('g')
        .attr('class', 'cell')
        .append('rect')
        .attr('x', (d, i) => i * barWidth)
        .attr('width', barWidth)
        .attr('height', barHeight)
        .attr('rx', this.radius)
        .style('fill', d => {
          const value =
            d[this.valueProp] || d[this.valueProp] === 0
              ? d[this.valueProp] / this.divisor
              : null
          return value || value === 0
            ? colourScale(value > 1 ? 1 : value)
            : 'rgba(255, 255, 255, 0.3)'
        })

      // rect.on('mouseenter', d => {
      //   console.log(d[this.valueProp], d, this.valueProp)
      // })

      rect
        .on('mousemove touchmove', function(d) {
          const m = mouse(this)
          const $this = select(this)
          const value =
            d[self.valueProp] || d[self.valueProp] === 0
              ? numFormat(',.0f')(d[self.valueProp])
              : '—'
          const text = `
          <b>${format(d.date, self.dateFormatString)}</b>:
          ${value}${self.unit}
        `
          // $this.style('stroke', '#e34a33').style('stroke-width', '1px')
          $this.style('opacity', 0.75)
          self.$tooltip
            .html(text)
            .style('left', m[0] + 4 + 'px')
            .style('top', m[1] - 14 + 'px')
            .style('pointer-events', 'none')
            .style('opacity', 1)
        })
        .on('mouseout', function() {
          const $this = select(this)
          // $this.style('stroke-width', 0)
          $this.style('opacity', 1)
          self.$tooltip.style('opacity', 0)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
section {
  position: relative;
}
.tooltip {
  background: white;
  position: absolute;
  top: 0;
  padding: 2px 4px;
  border-radius: 2px;
  opacity: 0;
}
</style>
