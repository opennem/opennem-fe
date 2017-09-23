<template>
  <div :id="id"></div>
</template>

<script>
import { bb } from 'billboard.js'

export default {
  props: {
    id: String,
    type: String,
    colgroups: Object
  },
  watch: {
    colgroups: function() {
      bb.generate({
        bindto: `#${this.id}`,
        size: {
          height: 500
        },
        axis: {
          x: {
            type: 'timeseries',
            tick: {
              count: 12,
              outer: false,
              format: '%H:%M, %e %b %y'
            },
          }
        },
        point: {
          show: false,
          r: 1,
          select: {
            r: 1.5
          }
        },
        data: {
          x: 'x',
          type: this.type ? this.type : 'area-spline',
          columns: this.colgroups.columns,
          groups: [this.colgroups.groups],
          order: 'desc'
        }
      })
    }
  }
}
</script>

<style>
@import "/billboard.min.css";

#chart {
  height: 400px; 
}
</style>
