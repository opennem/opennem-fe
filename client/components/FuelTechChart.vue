<template>
  <div class="fuel-tech-chart-wrapper">
    <div id="chart"></div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { bb } from 'billboard.js'

export default {
  mounted() {
    //TODO: move api call to actions
    d3.json('/sample.json', function(error, data) {
      let fuelTech = Object.keys(data)
      let dates = Object.keys(data[fuelTech[0]]) // assuming date range are the same
      let columns = [
        ['x', ... (dates.map(d => {
          return new Date(d)
        }))]
      ]

      fuelTech.forEach(ft => {
        columns.push([ft, ...Object.values(data[ft])])
      })

      setup(columns, fuelTech)
    });
  },
}

function setup(columns, groups) {
  //TODO: create opennem-chart config options
  bb.generate({
    bindto: '#chart',
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
      type: 'area-spline',
      columns,
      groups: [groups]
    }
  })
}
</script>

<style>
@import "/billboard.min.css";

#chart {
  height: 400px;
}
</style>
