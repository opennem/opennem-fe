<template>
  <div class="echart">
    <div id="area"></div>
    <table>
      <thead>
        <tr>
          <th colspan="3">{{series[0].date}}</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in series">
          <td>
            <div class="colour-sq" v-bind:style="{backgroundColor: item.colour}"></div>
          </td>
          <td>{{item.label}}</td>
          <td class="value">{{item.value}}</td>
          <td class="value">{{item.sum}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
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
     // this.area.legend.data = this.eData.groups
     this.area.color = this.eData.colours
     this.series = this.eData.series.map((item) => {
      return {
        name: item.name,
        label: item.label,
        sum: item.dataSum.toFixed(2),
        colour: item.colour,
        date: ''
      }
     })

     // this.eData.series.forEach((item) => {
     //  this.series[item.name] = {
     //    name: item.name,
     //    sum: item.dataSum.toFixed(2),
     //    colour: item.colour,
     //    value: 0,
     //  }
     // })

     this.myChart.setOption(this.area);
    }
  },
  mounted: function() {
    this.myChart = echarts.init(document.getElementById('area'))

    window.onresize = (event) => {
      this.myChart.resize()
    };
  },
  methods: {
    updateTime: function(params) {
      let newSeries = []
      
      params.forEach((param) => {
        const name = param.seriesName
        const item = this.series.find((item) => {
          return item.name === name
        })

        item.value = param.data
        item.date = param.axisValue

        newSeries.push(item)
      })

      this.series = newSeries
    }
  },
  data: function () {
    const self = this
    return {
      myChart: null,
      series: [{date: ''}],
      area: {
        title: {show: false},
        color: [],
        textStyle: {
          fontFamily: '-apple-system, BlinkMacSystemFont, helvetica, arial, sans-serif'
        },
        animation: false,
        tooltip: {
          show: true,
          trigger: 'axis',
          axisPointer: {
            animation: false,
          },
          formatter: function (params, ticket, callback) {
            self.updateTime(params)
            return '';
          }
        },
        legend: { show: false, data: [] },
        toolbox: {
          top: 0,
          right: 20,
          feature: {
            restore: {show: true, title: 'Reset'},
            saveAsImage: {show: true, title: 'Download PNG'}
          }
        },
        dataZoom: [
          {
            type: 'inside',
            show: true,
            realtime: true,
            start: 0,
            end: 100,
            xAxisIndex: [0, 1]
          }
        ],
        grid: [{
          top: 30,
          left: 60,
          right: 26,
          height: '45%'
        }, {
          left: 60,
          right: 26,
          top: '60%',
          height: '38%'
        }],
        axisPointer: {
          link: {xAxisIndex: 'all'}
        },
        xAxis: [
          {
            show: false,
            type: 'category',
            boundaryGap: false,
            axisPointer: {
              show: true,
              label: {
                show: false
              }
            },
            axisLine: {onZero: true},
            data: []
          },
          {
            gridIndex: 1,
            type : 'category',
            offset: 20,
            boundaryGap: false,
            data: [],
            axisLine: {onZero: true, lineStyle: {color: '#000'}},
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
            axisLine: {lineStyle: {color: '#ababab'}},
            splitLine: {lineStyle: {color: ['#ddd'], type: 'dashed'}}
          },
          {
            gridIndex: 1,
            type: 'value',
            //logBase: 300,
            //max: 15000,
            axisLine: {lineStyle: {color: '#ababab'}},
            splitLine: {lineStyle: {color: ['#ddd'], type: 'dashed'}}
          }
        ],
        series: []
      }
    }
  }
}
</script>

<style>
.echart {
  display: flex;

}

table {
  font-size: 0.8rem;
  width: 330px;
  flex: 0 0 400px;
  border-collapse: collapse;
  margin-top: 5px;

  thead th, .value { text-align: right }

  .value {
    padding-left: 10px;
  }

  td, th {
    padding: 5px;
    border-bottom: 1px solid #999;
  }

  .colour-sq {
    width: 15px;
    height: 15px;
    background-color: #999;
  }
}

#area {
  width: 100%;
  height: 600px;
}


</style>
