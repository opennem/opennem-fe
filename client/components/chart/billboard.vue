<template>
  <div>
    <div v-bind:id="idDonut"></div>
    <div v-bind:id="id"></div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import * as moment from 'moment'
import { bb } from 'billboard.js'

export default {
  props: {
    name: String,
    dMe: Object
  },
  data: function() {
    return {
      id: '',
      idDonut: ''
    }
  },
  mounted() {
    var self = this;
    this.id = this.$props.name;
    this.idDonut = this.$props.name + '-donut';

    //TODO: move api call to actions
    if (this.id === 'price') {
      d3.json('/samples/price_sample.json', function(error, data) {
        let price = Object.keys(data)
        let dataLength = data[price[0]].data.length
        let start = moment(data[price[0]].start, moment.ISO_8601)
        let interval = 5
        let dates = [new Date(start)]

        for (let i=1; i<=dataLength; i++) {
          dates.push(new Date(moment(start).add(interval*i, 'm')))
        }

        let columns = [
          ['x', ...dates]
        ]

        price.forEach(ft => {
          columns.push([ft, ...data[ft].data])
        })

        setup(self.id, columns, price)
      })
    }

    if (this.id === 'fuel-tech') {
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

        setup(self.id, columns, fuelTech)
        setupDonut(self.idDonut, columns, fuelTech)
      });
    } 
  },
}

function setup(id, columns, groups) {
  //TODO: create opennem-chart config options
  bb.generate({
    bindto: `#${id}`,
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

function setupDonut(id, columns, groups) {
  //TODO: create opennem-chart config options
  bb.generate({
    bindto: `#${id}`,
    legend: {show: false},
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
      type: 'donut',
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
