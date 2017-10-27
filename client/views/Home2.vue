<template>
  <div>
    <header>
      <h2>Electricity Production</h2>
      <div class="date-range">
        <!-- <time>2 Mar '17</time> — <time>7 Mar '17</time>     -->
      </div>
    </header>

    <div id="chartdiv"></div>
  </div>
</template>

<script>
import * as moment from 'moment'
import axios from "axios"

export default {
  components: {},
  data() {
    return {
      genData: null,
      chartData: []
    };
  },
  mounted() {
    axios.get("/samples/combined_sample.json").then(
      function(response) {
        const chartData = generateChartData(response.data)

        var chart = AmCharts.makeChart('chartdiv', {
          type: 'stock',
          categoryAxesSettings: {
            minPeriod: "5mm",
          },
          dataSets: [
            {
              dataProvider: chartData,
              categoryField: 'date',
              fieldMappings: [{
                fromField: 'wind',
                toField: 'wind'
              },{
                fromField: 'gas_steam',
                toField: 'gas_steam'
              },{
                fromField: 'gas_ccgt',
                toField: 'gas_ccgt'
              },{
                fromField: 'gas_ocgt',
                toField: 'gas_ocgt'
              },{
                fromField: 'distillate',
                toField: 'distillate'
              },{
                fromField: 'rooftop_solar',
                toField: 'rooftop_solar'
              }, {
                fromField: 'gas_steam',
                toField: 'gas_steam'
              }, {
                fromField: 'NETINTERCHANGE',
                toField: 'NETINTERCHANGE'
              }, {
                fromField: 'DEMAND_AND_NONSCHEDGEN',
                toField: 'DEMAND_AND_NONSCHEDGEN'
              }, {
                fromField: 'RRP',
                toField: 'RRP'
              }]
            },
            {
              dataProvider: chartData,
              categoryField: 'date',
              color: '#666',
              fieldMappings: [{
                fromField: 'RRP',
                toField: 'RRP'
              }]
            }
          ],
          panels: [{
            title: 'Generation',
            percentHeight: 60,
            valueAxes: [ {
              id: "v1",
              dashLength: 5,
              stackType: "regular"
            } ],
            stockGraphs: [
            {
              id: 'g1',
              valueField: 'NETINTERCHANGE',
              type: 'line',
              fillAlphas: 0.8,
              negativeFillAlphas: 0.5,
              negativeFillColors: '#44146F',
              lineAlpha: 0,
              lineColor: '#44146F',
              useDataSetColors: false
            },
            {
              id: 'g2',
              valueField: 'gas_steam',
              type: 'line',
              fillAlphas: 0.8,
              negativeFillAlphas: 0.5,
              negativeFillColors: '#F48E1B',
              lineAlpha: 0,
              lineColor: '#F48E1B',
              useDataSetColors: false
            }, {
              id: 'g3',
              valueField: 'gas_ccgt',
              type: 'line',
              fillAlphas: 0.8,
              negativeFillAlphas: 0.5,
              negativeFillColors: '#FDB462',
              lineAlpha: 0,
              lineColor: '#FDB462',
              useDataSetColors: false
            }, {
              id: 'g4',
              valueField: 'gas_ocgt',
              type: 'line',
              fillAlphas: 0.8,
              negativeFillAlphas: 0.5,
              negativeFillColors: '#FFCD96',
              lineAlpha: 0,
              lineColor: '#FFCD96',
              useDataSetColors: false
            }, {
              id: 'g5',
              valueField: 'wind',
              type: 'line',
              fillAlphas: 0.8,
              negativeFillAlphas: 0.5,
              negativeFillColors: '#417505',
              lineAlpha: 0,
              lineColor: '#417505',
              useDataSetColors: false
            }, {
              id: 'g6',
              valueField: 'distillate',
              type: 'line',
              fillAlphas: 0.8,
              negativeFillAlphas: 0.5,
              negativeFillColors: '#F35020',
              lineAlpha: 0,
              lineColor: '#F35020',
              useDataSetColors: false
            }, {
              id: 'g7',
              valueField: 'rooftop_solar',
              type: 'line',
              fillAlphas: 0.8,
              negativeFillAlphas: 0.5,
              negativeFillColors: '#F8E71C',
              lineAlpha: 0,
              lineColor: '#F8E71C',
              useDataSetColors: false
            }, {
              id: 'g8',
              valueField: 'DEMAND_AND_NONSCHEDGEN',
              type: 'line',
              fillAlphas: 0
            }],
            stockLegend: {
              // valueTextRegular: ' ',
              // markerType: 'none'
            }
          }, {
            title: 'Price',
            percentHeight: 30,
            valueAxes: [ {
              id: "v2"
            } ],
            stockGraphs: [{
              id: 'p1',
              valueAxis: 'v2',
              valueField: 'RRP',
              type: 'step',
              lineAlpha: 0.5,
              lineColor: '#000',
              useDataSetColors: false
            }], stockLegend: {
              // valueTextRegular: ' ',
              // markerType: 'none'
            }
          }],
          chartScrollbarSettings: {
            graph: 'g8',
            usePeriod: 'DD'
          }

        })
      }.bind(this)
    );
  }
}

function generatePriceData(data) {
  let chartData = []
  const rrp = data['RRP']
  const rrpKey = 'price'
  let startDate = rrp.start
  let interval = 30 // rrp.interval
  let rrpData = rrp.data

  const start = moment(startDate, moment.ISO_8601)

  chartData[0] = {
    date: moment(start).toDate()
  }
  chartData[0][rrpKey] = rrpData[0]

  for (let i=1; i<rrpData.length; i++) {
    const now = moment(start).add(interval*i, 'm')

    chartData[i] = {
      date: moment(now).toDate()
    }

    chartData[i][rrpKey] = rrpData[i]
  }
  console.log(chartData)

  return chartData
}

function generateChartData(data) {
  let chartData = []

  Object.keys(data).forEach(ftKey => {
    let ft = data[ftKey]
    let startDate = ft.start
    let interval = ftKey === 'RRP' ? 30 : 5 // ft.interval
    let ftData = ft.data

    const start = moment(startDate, moment.ISO_8601)

    if (chartData.length > 0) {
      if (ftKey === 'RRP') {

        for (let x=0; x<ftData.length; x++) {
          const now = moment(start).add(interval*x, 'm')

          const findDate = chartData.find(item => {
            return item.date.toString() === now.toDate().toString()
          })

          findDate[ftKey] = ftData[x]

          // console.log(now.toDate().toString())
          // if (now.toDate().toString() === chartData[i].date.toString()) {
          //   chartData[i][ftKey] = ftData[x]
          // } else {
          //   chartData[i][ftKey] = null
          // }
        }
        

        // if (start.toDate().toString() === chartData[i].date.toString()) {
        //   chartData[i][ftKey] = ftData[0]
        // } else {
          
        // }
      } else {
        for (let i=0; i<chartData.length; i++) {
          const d = ftKey === 'NETINTERCHANGE' ? -ftData[i] : ftData[i]
          chartData[i][ftKey] = d
        }
      }
      
    } else {

      // add the first data
      chartData[0] = {
        date: moment(start).toDate()
      }
      chartData[0][ftKey] = ftData[0]

      for (let i=1; i<ftData.length; i++) {
        const now = moment(start).add(interval*i, 'm')

        chartData[i] = {
          date: moment(now).toDate()
        }

        chartData[i][ftKey] = ftData[i]
      }
    }
  })

  console.log(chartData)

  // var firstDate = new Date(2012, 0, 1);
  // firstDate.setDate(firstDate.getDate() - 500);
  // firstDate.setHours(0, 0, 0, 0);

  // for (var i = 0; i < 50000; i++) {
  //   var newDate = new Date(firstDate);
  //   newDate.setDate(newDate.getDate() + i);

  //   var a = Math.round(Math.random() * (40 + i)) + 100 + i;
  //   var b = Math.round(Math.random() * 100000000);

  //   chartData.push({
  //     date: newDate,
  //     value: a,
  //     volume: b
  //   });
  // }

  return chartData
}
</script>

<style>
#chartdiv {
  width: 100%;
  height: 500px;
}
a[title='JavaScript charts'] {
  display: none !important;
}
.date-range {
  color: #666;
  position: absolute;
  right: 2rem;
  top: 2rem;
  margin-right: 1rem;
  margin-top: 1rem;
}
</style>
