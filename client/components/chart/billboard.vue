<template>
  <div id="chart"></div>
</template>

<script>
import * as d3 from 'd3'
import * as moment from 'moment'
import { bb } from 'billboard.js'

export default {
  mounted() {
    //TODO: move api call to actions
    d3.json('/samples/price_sample.json', function(error, data) {
      console.log(data)
    })

    d3.json('/samples/gen_sample.json', function(error, data) {
      let fuelTech = Object.keys(data)
      let dataLength = data[fuelTech[0]].data.length
      let start = moment(data[fuelTech[0]].start, moment.ISO_8601)

      /* TODO:
        interval split -
          split at 'shorthand' (see moment docs for .add)
          if error thrown, catch it
      */
      let interval = 5
      let dates = [new Date(start)]

      for (let i=1; i<=dataLength; i++) {
        dates.push(new Date(moment(start).add(interval*i, 'm')))
      }

      let columns = [
        ['x', ...dates]
      ]

      fuelTech.forEach(ft => {
        columns.push([ft, ...data[ft].data])
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
      groups: [groups],
      order: 'desc'
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
