<template>
  <div class="demand-chart-wrapper">
    <div class="loader" v-if="!chartRendered"></div>
    <h3>Demand and Non-scheduled Generation from xxxx — xxxx</h3>
    <div id="demand-vis"></div>
  </div>
</template>

<script>
import * as moment from 'moment';
import { mapGetters } from 'vuex';

export default {
  created() {
    this.$store.dispatch('fetchDemand');
  },
  data() {
    return {
      chartRendered: false
    }
  },
  computed: {
    ...mapGetters({
      demand: 'getDemand'
    })
  },
  watch: {
    demand(newData) {
      console.log(newData);

      AmCharts.makeChart('demand-vis', {
        type: 'stock',
        categoryAxesSettings: {
          minPeriod: '5mm',
          groupToPeriods: ['5mm', '15mm', '30mm', 'hh'],
          gridAlpha: 0,
          axisAlpha: 0
        },
        chartScrollbarSettings: {
          enabled: false
        },
        chartCursorSettings: {
          pan: false,
          zoomable: false,
          enabled: true,
          valueBalloonsEnabled: true,
          oneBalloonOnly: true
          // categoryBalloonColor: '#000',
          // cursorColor: '#000',
          // showNextAvailable: true
        },
        dataSets: [
          {
            dataProvider: newData,
            categoryField: 'date',
            fieldMappings: [
              {
                fromField: 'nsw',
                toField: 'nsw'
              },
              {
                fromField: 'nswMid',
                toField: 'nswMid'
              },
              {
                fromField: 'nsw1',
                toField: 'nsw1'
              },
              {
                fromField: 'nsw2',
                toField: 'nsw2'
              },
              {
                fromField: 'nsw3',
                toField: 'nsw3'
              },
              {
                fromField: 'qld',
                toField: 'qld'
              },
              {
                fromField: 'qldMid',
                toField: 'qldMid'
              },
              {
                fromField: 'qld1',
                toField: 'qld1'
              },
              {
                fromField: 'qld2',
                toField: 'qld2'
              },
              {
                fromField: 'qld3',
                toField: 'qld3'
              },
              {
                fromField: 'sa',
                toField: 'sa'
              },
              {
                fromField: 'saMid',
                toField: 'saMid'
              },
              {
                fromField: 'sa1',
                toField: 'sa1'
              },
              {
                fromField: 'sa2',
                toField: 'sa2'
              },
              {
                fromField: 'sa3',
                toField: 'sa3'
              },
              {
                fromField: 'tas',
                toField: 'tas'
              },
              {
                fromField: 'tasMid',
                toField: 'tasMid'
              },
              {
                fromField: 'tas1',
                toField: 'tas1'
              },
              {
                fromField: 'tas2',
                toField: 'tas2'
              },
              {
                fromField: 'tas3',
                toField: 'tas3'
              },
              {
                fromField: 'vic',
                toField: 'vic'
              },
              {
                fromField: 'vicMid',
                toField: 'vicMid'
              },
              {
                fromField: 'vic1',
                toField: 'vic1'
              },
              {
                fromField: 'vic2',
                toField: 'vic2'
              },
              {
                fromField: 'vic3',
                toField: 'vic3'
              },
            ]
          }
        ],
        panels: [
          {
            percentHeight: 20,
            showCategoryAxis: false,
            allLabels: [{
              text: 'New South Wales',
              align: 'left',
              x: 20,
              y: 15,
              url: '/#/regions/nsw'
            }],
            valueAxes: [{
              minimum: 0,
              maximum: 1,
              strictMinMax: true,
              gridAlpha: 0,
              labelsEnabled: false
            }],
            stockGraphs: [{
              valueField: 'nsw1',
              type: 'line',
              fillAlphas: 0.1,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'nsw2',
              type: 'line',
              fillAlphas: 0.2,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'nsw3',
              type: 'line',
              fillAlphas: 0.3,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'nsw',
              openField: 'nswMid',
              type: 'line',
              fillAlphas: 0,
              lineAlpha: 0,
              showBalloon: true,
              showBalloonAt: 'open'
            }]
          },
          {
            percentHeight: 20,
            showCategoryAxis: false,
            allLabels: [{
              text: 'Queensland',
              align: 'left',
              x: 20,
              y: 15,
              url: '/#/regions/qld'
            }],
            valueAxes: [{
              minimum: 0,
              maximum: 1,
              strictMinMax: true,
              gridAlpha: 0,
              labelsEnabled: false
            }],
            stockGraphs: [{
              valueField: 'qld1',
              type: 'line',
              fillAlphas: 0.1,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'qld2',
              type: 'line',
              fillAlphas: 0.2,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'qld3',
              type: 'line',
              fillAlphas: 0.3,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'qld',
              openField: 'qldMid',
              type: 'line',
              fillAlphas: 0,
              lineAlpha: 0,
              showBalloon: true,
              showBalloonAt: 'open'
            }]
          },
          {
            percentHeight: 20,
            showCategoryAxis: false,
            allLabels: [{
              text: 'South Australia',
              align: 'left',
              x: 20,
              y: 15,
              url: '/#/regions/sa'
            }],
            valueAxes: [{
              minimum: 0,
              maximum: 1,
              strictMinMax: true,
              gridAlpha: 0,
              labelsEnabled: false
            }],
            stockGraphs: [{
              valueField: 'sa1',
              type: 'line',
              fillAlphas: 0.1,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'sa2',
              type: 'line',
              fillAlphas: 0.2,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'sa3',
              type: 'line',
              fillAlphas: 0.3,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'sa',
              openField: 'saMid',
              type: 'line',
              fillAlphas: 0,
              lineAlpha: 0,
              showBalloon: true,
              showBalloonAt: 'open'
            }]
          },
          {
            percentHeight: 20,
            showCategoryAxis: false,
            allLabels: [{
              text: 'Tasmania',
              align: 'left',
              x: 20,
              y: 15,
              url: '/#/regions/tas'
            }],
            valueAxes: [{
              minimum: 0,
              maximum: 1,
              strictMinMax: true,
              gridAlpha: 0,
              labelsEnabled: false
            }],
            stockGraphs: [{
              valueField: 'tas1',
              type: 'line',
              fillAlphas: 0.1,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'tas2',
              type: 'line',
              fillAlphas: 0.2,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'tas3',
              type: 'line',
              fillAlphas: 0.3,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'tas',
              openField: 'tasMid',
              type: 'line',
              fillAlphas: 0,
              lineAlpha: 0,
              showBalloon: true,
              showBalloonAt: 'open'
            }]
          },
          {
            percentHeight: 20,
            showCategoryAxis: false,
            allLabels: [{
              text: 'Victoria',
              align: 'left',
              x: 20,
              y: 15,
              url: '/#/regions/vic'
            }],
            valueAxes: [{
              minimum: 0,
              maximum: 1,
              strictMinMax: true,
              gridAlpha: 0,
              labelsEnabled: false
            }],
            stockGraphs: [{
              valueField: 'vic1',
              type: 'line',
              fillAlphas: 0.1,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'vic2',
              type: 'line',
              fillAlphas: 0.2,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'vic3',
              type: 'line',
              fillAlphas: 0.3,
              lineAlpha: 0,
              showBalloon: false,
            }, {
              valueField: 'vic',
              openField: 'vicMid',
              type: 'line',
              fillAlphas: 0,
              lineAlpha: 0,
              showBalloon: true,
              showBalloonAt: 'open'
            }]
          }
        ],
        panelsSettings: {
          fontFamily: 'Merriweather',
          panelSpacing: 1
        }
        // panels:
      });

      this.chartRendered = true
    }
  }
}

</script>

<style>
#demand-vis {
  width: 100%;
  height: 400px;
}
a[title='JavaScript charts'] {
  display: none !important;
}
</style>
