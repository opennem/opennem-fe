<template>
  <div>
    <h1>National Electricity Market</h1>
    <h4>Demand & Non-Scheduled Generation Across NEM Regions</h4>
    <div id="chartdiv2"></div>
  </div>
</template>

<script>
import * as moment from "moment";
import { mapGetters } from "vuex";

export default {
  components: {},
  data() {
    return {};
  },
  created() {
    this.$store.dispatch("fetchDemand");
  },
  computed: {
    ...mapGetters({
      demand: "getDemand"
    })
  },
  watch: {
    demand(newData) {
      console.log(newData);

      AmCharts.makeChart("chartdiv2", {
        type: "stock",
        categoryAxesSettings: {
          minPeriod: "5mm",
          groupToPeriods: ["5mm", "15mm", "30mm", "hh"],
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
            categoryField: "date",
            fieldMappings: [
              {
                fromField: "nsw1",
                toField: "nsw1"
              },
              {
                fromField: "nsw2",
                toField: "nsw2"
              },
              {
                fromField: "nsw3",
                toField: "nsw3"
              },
              {
                fromField: "qld1",
                toField: "qld1"
              },
              {
                fromField: "qld2",
                toField: "qld2"
              },
              {
                fromField: "qld3",
                toField: "qld3"
              },
              {
                fromField: "sa1",
                toField: "sa1"
              },
              {
                fromField: "sa2",
                toField: "sa2"
              },
              {
                fromField: "sa3",
                toField: "sa3"
              },
              {
                fromField: "tas1",
                toField: "tas1"
              },
              {
                fromField: "tas2",
                toField: "tas2"
              },
              {
                fromField: "tas3",
                toField: "tas3"
              },
              {
                fromField: "vic1",
                toField: "vic1"
              },
              {
                fromField: "vic2",
                toField: "vic2"
              },
              {
                fromField: "vic3",
                toField: "vic3"
              },
            ]
          }
        ],
        panels: [
          {
            title: "NSW",
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
              lineAlpha: 0
            }, {
              valueField: 'nsw2',
              type: 'line',
              fillAlphas: 0.2,
              lineAlpha: 0
            }, {
              valueField: 'nsw3',
              type: 'line',
              fillAlphas: 0.3,
              lineAlpha: 0
            }]
          },
          {
            title: "QLD",
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
              lineAlpha: 0
            }, {
              valueField: 'qld2',
              type: 'line',
              fillAlphas: 0.2,
              lineAlpha: 0
            }, {
              valueField: 'qld3',
              type: 'line',
              fillAlphas: 0.3,
              lineAlpha: 0
            }]
          },
          {
            title: "SA",
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
              lineAlpha: 0
            }, {
              valueField: 'sa2',
              type: 'line',
              fillAlphas: 0.2,
              lineAlpha: 0
            }, {
              valueField: 'sa3',
              type: 'line',
              fillAlphas: 0.3,
              lineAlpha: 0
            }]
          },
          {
            title: "TAS",
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
              lineAlpha: 0
            }, {
              valueField: 'tas2',
              type: 'line',
              fillAlphas: 0.2,
              lineAlpha: 0
            }, {
              valueField: 'tas3',
              type: 'line',
              fillAlphas: 0.3,
              lineAlpha: 0
            }]
          },
          {
            title: "VIC",
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
              lineAlpha: 0
            }, {
              valueField: 'vic2',
              type: 'line',
              fillAlphas: 0.2,
              lineAlpha: 0
            }, {
              valueField: 'vic3',
              type: 'line',
              fillAlphas: 0.3,
              lineAlpha: 0
            }]
          }
        ],
        panelsSettings: {
          fontFamily: "Merriweather",
          panelSpacing: 1
        }
        // panels:
      });
    }
  }
};
</script>

<style>
#chartdiv2 {
  width: 100%;
  height: 400px;
}
a[title="JavaScript charts"] {
  display: none !important;
}
</style>
