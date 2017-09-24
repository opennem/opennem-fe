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
     this.area.xAxis[0].data = this.eData.dates
     this.area.xAxis[1].data = this.eData.dates
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
        tooltip: {trigger: 'axis', axisPointer: {
            animation: false
        }},
        legend: { data: [] },
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 30,
            end: 70,
            xAxisIndex: [0, 1]
          },
          {
            type: 'inside',
            realtime: true,
            start: 30,
            end: 70,
            xAxisIndex: [0, 1]
          }
        ],
        grid: [{
          left: 50,
          right: 50,
          height: '35%'
        }, {
          left: 50,
          right: 50,
          top: '55%',
          height: '35%'
        }],
        axisPointer: {
          link: {xAxisIndex: 'all'}
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisPointer: {
              show: true,
              label: {
                show: true
              }
            },
            axisLine: {onZero: true},
            data: []
          },
          {
            gridIndex: 1,
            type : 'category',
            boundaryGap: false,
            data: [],
            axisLine: {onZero: true},
            axisPointer: {
              show: true,
              label: {
                show: true
              }
            },
            position: 'top'
          }
        ],
        yAxis: [
          {
            type: 'value',
            // logBase: 200
          },
          {
            gridIndex: 1,
            type: 'log',
            logBase: 300,
            max: 15000
          }
        ],
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
  height: 600px;
}
</style>
