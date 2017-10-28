<template>
  <div>
    <header>
      <h2>Electricity Production</h2>
      <div class="date-range">
        <!-- <time>2 Mar '17</time> — <time>7 Mar '17</time>     -->
      </div>
    </header>

    <div id="chartdiv"></div>

    <Summary :fuelTechSeries="filteredData"></Summary>
  </div>
</template>

<script>
import * as moment from 'moment'
import axios from "axios"
import Summary from '../components/ElectricityProduction/Summary2'

export default {
  components: {
    Summary
  },
  data() {
    return {
      genData: null,
      chartData: [],
      filteredData: [],
    };
  },
  mounted() {
    axios.get("/samples/combined_sample.json").then(
      function(response) {
        this.chartData = generateChartData(response.data)

        var chart = AmCharts.makeChart('chartdiv', {
          type: 'stock',
          // mouseWheelScrollEnabled: true,
          mouseWheelZoomEnabled: true,
          categoryAxesSettings: {
            minPeriod: "5mm",
          },
          chartCursorSettings: {
            pan: true,
            categoryBalloonColor: '#000',
            cursorColor: '#000',
          },
          dataSets: [
            {
              dataProvider: this.chartData,
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
                fromField: 'RRP',
                toField: 'RRP'
              }]
            },
            {
              dataProvider: this.chartData,
              categoryField: 'date',
              color: '#666',
              fieldMappings: [{
                fromField: 'RRP',
                toField: 'RRP'
              }]
            }
          ],
          panels: [{
            title: 'Generation (MW)',
            percentHeight: 70,
            showCategoryAxis: false,
            listeners: [
              {
                event: 'zoomed',
                method: (event) => {
                  const start = event.startDate
                  const end = event.endDate

                  this.filteredData = this.chartData.filter((item) => {
                    return moment(item.date).isBetween(start, end)
                  })

                  let summaryDS = []

                  Object.keys(this.filteredData[0]).forEach(ft => {

                    if (ft !== 'date') {
                      const totalPower = this.filteredData.reduce((a, b) => {
                        return a + b[ft]
                      }, 0)

                      summaryDS.push({
                        id: ft,
                        range: {
                          totalPower,
                          energy: totalPower/12000
                        }
                      })
                    }
                  })

                  console.log(summaryDS)

                  // summary object

                  /**@argument
                   * id: 
                   * label: 
                   * 
                   * range: {
                   *  dateFrom:
                   *  dateTo:
                   *  totalPower:
                   *  energy:
                   *  contribution:
                   *  averageValue:
                   * }
                   * 
                   * point: {
                   *  date:
                   *  power:
                   *  conribution:
                   *  price:
                   * }
                   * 
                   */

                }
              }
            ],
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
            }],
            stockLegend: {
              valueTextRegular: ' ',
              markerType: 'none'
            }
          }, 
          // {
          //   title: 'Price',
          //   percentHeight: 30,
          //   valueAxes: [ {
          //     id: 'v2',
          //     logarithmic: true,
          //     minimum: 300,
          //     maximum: 15000,
          //     strictMinMax: true,
          //     includeGuidesInMinMax: false,
          //     guides: [{ value: 300 }, { value: 1000 }, { value: 5000 }]
          //   } ],
          //   stockGraphs: [{
          //     id: 'p1',
          //     valueAxis: 'v2',
          //     valueField: 'RRP',
          //     type: 'step',
          //     lineAlpha: 0.5,
          //     lineColor: '#000',
          //     useDataSetColors: false
          //   }], stockLegend: {
          //     // valueTextRegular: ' ',
          //     // markerType: 'none'
          //   }
          // }, 
          {
            title: 'Price ($)',
            percentHeight: 30,
            valueAxes: [ {
              id: 'v3',
              logarithmic: false,
              dashLength: 5,
              maximum: 300,
              minimum: 0
            } ],
            stockGraphs: [{
              id: 'p2',
              valueAxis: 'v3',
              valueField: 'RRP',
              type: 'step',
              lineAlpha: 0.5,
              lineColor: '#000',
              useDataSetColors: false
            }], stockLegend: {
              valueTextRegular: ' ',
              markerType: 'none'
            }
          }],
          chartScrollbarSettings: {
            graph: 'g7',
            usePeriod: 'DD',
            position: 'top',
            color: '#000',
            graphFillAlpha: 0,
            graphLineAlpha: 0,
            selectedGraphFillAlpha: 0,
            selectedGraphLineAlpha: 0,
            backgroundColor: '#eee',
            backgroundAlpha: 0.1,
            selectedBackgroundAlpha: 0.2,
            selectedBackgroundColor: 'steelblue',
            dragIcon: 'dragIconRectSmallBlack',
            dragIconHeight: 24,
            dragIconWidth: 24,
            scrollbarHeight: 50
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
    let hasChartData = chartData.length ? true : false
    // let ftDataSum

    console.log(ftKey)
    console.log(ftData.reduce((a, b) => a + b, 0)/12000)

    const start = moment(startDate, moment.ISO_8601)

    if (ftKey === 'RRP') {
      for (let x=0; x<ftData.length; x++) {
        const now = moment(start).add(interval*x, 'm')
        const findDate = chartData.find(item => {
          return item.date.toString() === now.toDate().toString()
        })
        /*** for RRP, any negative price cannot be logathrmic *****/
        // findDate[ftKey] = ftData[x] < 0 ? -ftData[x] : ftData[x]
        findDate[ftKey] = ftData[x]
      }
    } else {
      for (let i=0; i<ftData.length; i++) {
        const now = moment(start).add(interval*i, 'm')
        const d = ftKey === 'NETINTERCHANGE' ? -ftData[i] : ftData[i]

        if (!hasChartData) {
          chartData[i] = {
            date: now.toDate()
          }

        }
        chartData[i][ftKey] = d
      }
    }

    // if (chartData.length > 0) {
    //   if (ftKey === 'RRP') {
    //     for (let x=0; x<ftData.length; x++) {
    //       const now = moment(start).add(interval*x, 'm')
    //       const findDate = chartData.find(item => {
    //         return item.date.toString() === now.toDate().toString()
    //       })
    //       // findDate[ftKey] = ftData[x] < 0 ? -ftData[x] : ftData[x]
    //       findDate[ftKey] = ftData[x]
    //     }
    //   } else {
    //     for (let i=0; i<chartData.length; i++) {
    //       const d = ftKey === 'NETINTERCHANGE' ? -ftData[i] : ftData[i]
    //       chartData[i][ftKey] = d
    //     }
    //   }
    // } else {
    //   for (let i=0; i<ftData.length; i++) {
    //     const now = moment(start).add(interval*i, 'm')

    //     chartData[i] = {
    //       date: moment(now).toDate()
    //     }

    //     chartData[i][ftKey] = ftData[i]
    //   }
    // }

  })


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
