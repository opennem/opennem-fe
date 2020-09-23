<template>
  <div>
    <div class="chart">
      <power-chart-options
        :options="options"
      />
      <stacked-area-vis
        :domains="domains"
        :dataset="dataset"
        :y-min="0"
        :y-max="30"
        :y-axis-ticks="5"
        :vis-height="200"
        :zoomed="zoomExtent.length > 0"
        :show-tooltip="false"
        class="vis-chart"
      />
    </div>
  </div>
</template>

<script>
import parseISO from 'date-fns/parseISO'
import getTime from 'date-fns/getTime'
import * as OPTIONS from '@/constants/chart-options.js'
import StackedAreaVis from '@/components/Vis/StackedArea.vue'
import PowerChartOptions from '@/components/Facility/Charts/PowerChartOptions'

const options = {
  type: [OPTIONS.CHART_HIDDEN, OPTIONS.CHART_STACKED],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: []
}

export default {
  components: {
    PowerChartOptions,
    StackedAreaVis
  },

  props: {
    units: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      options,
      hoverOn: false,
      hoverDate: null,
      zoomExtent: []
    }
  },

  computed: {
    domains() {
      return this.units.map(d => {
        return {
          colour: 'red',
          domain: d.code,
          id: d.code
        }
      })
    },
    dataset() {
      const ds = []

      this.units.forEach(d => {
        if (ds.length === 0) {
          if (d.scada_power) {
            d.scada_power.forEach(p => {
              const key = d.code
              const date = parseISO(p[0])
              const obj = {
                date,
                time: getTime(date)
              }
              obj[key] = p[1]
              ds.push(obj)
            })
          }
        }
      })

      console.log(ds)
      return ds
    }
  }
}
</script>
