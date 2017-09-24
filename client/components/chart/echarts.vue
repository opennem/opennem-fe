<template>
  <chart id="area" :options="area" auto-resize></chart>
</template>

<script>
import ECharts from 'vue-echarts/components/ECharts.vue'

// import ECharts modules manually to reduce bundle size
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/title'

export default {
  components: {
    chart: ECharts
  },

  props: {
    id: String,
    type: String,
    eData: Object,
  },
  watch: {
    eData: function() {
     this.area.xAxis.data = this.eData.dates
     this.area.series = this.eData.series
     this.area.legend.data = this.eData.groups
     this.area.color = this.eData.colours
    }
  },
  data: function () {
    return {
      area: {
        color: [],
        animation: false,
        tooltip: {trigger: 'axis'},
        legend: { data: []},
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          // logBase: 200
        },
        series: [{
          smooth: true,
          type: 'line',
          data: []
        }]
      }
    }
  }
}
</script>

<style>

#area {
  width: 100%;
  }
</style>
