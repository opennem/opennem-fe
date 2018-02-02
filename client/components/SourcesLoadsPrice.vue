<template>
  <div class="wrapper" style="padding: 0 1rem;" v-bind:class="{ 'export-overlay': showExport }">
    <div class="vis" v-bind:class="{ export: showExport }">
      <div class="chart">
        <div class="chart-export-buttons" v-show="displayExport">
          <button class="button clear share-button" v-show="!showExport" v-on:click="toggleExportOptions()">
            <img src="/icons/share-icon.png" alt="" style="height: 15px;">
            Share
          </button>

          <button class="button clear" v-show="showExport" v-on:click="downloadPNG()">
            <img src="/icons/download-icon.png" alt="" style="height: 15px;">
            PNG
          </button>

          <button class="button clear close-button" v-show="showExport" v-on:click="toggleExportOptions()">
            <img src="/icons/close-icon.png" alt="" style="height: 15px;">
          </button>
        </div>

        <div id="export-container">
          <div class="export-annotations export-annotations-top" v-show="showExport">
            <div class="annotation-buttons annotation-buttons-left">
              <button class="button" style="top: 0;" v-show="!showExportTitle"  v-on:click="showExportTitle = true">
                Add Title
              </button>
              <button class="button" style="top: 30px;" v-show="!showExportDescription" v-on:click="showExportDescription = true">
                Add Description
              </button> 
            </div>
            <section class="editable-section" v-if="showExportTitle">
              <h1 contenteditable="true" v-on:blur="onExportTitleBlur">{{getRegionLabel()}}</h1>
            </section>              
            <section class="editable-section" v-if="showExportDescription">
              <p contenteditable="true" v-on:blur="onExportDescriptionBlur">Description</p>
            </section>
          </div>

          <!-- <div class="axis-title"><small>Generation (MW)</small></div> -->
          <div id="ft-vis"></div>

          <div class="export-legend" v-show="showExport">
            <div class="legend-graph" v-for="item in sourcesData" :key="item.id">
              <div class="colour-sq" v-bind:style="{backgroundColor: getColour(item.id, item.colour)}"></div>
              {{getLabel(item.id)}}
            </div>
          </div>

          <div class="export-annotations export-annotations-bottom" v-show="showExport">
            <span>
              sources <strong>AEMO, OpenNEM</strong>
            </span>

            <div class="annotation-buttons annotation-buttons-right">
              <button class="button" v-show="!showExportAttribution"  v-on:click="showExportAttribution = true">
                Add Attribution
              </button>
            </div>
            <section class="editable-section" v-if="showExportAttribution" style="float: right; text-align: right; margin-top: -15px; width: 200px">
              shared by <strong contenteditable="true" v-on:blur="onExportAttributionBlur">@name</strong>
            </section> 
          </div>
        </div>
      </div>

      <div class="datagrid" v-show="!showExport">
        <FtSummary
          v-show="chartRendered"
          :tableData="tableData"
          :sourcesData="sourcesData"
          :loadsData="loadsData"
          :totalAveragePrice="totalAveragePrice"
          :pointData="pointData"
          :dateFrom="start"
          :dateTo="end"
          :showPrice="true"
          :hidePoint="hidePoint">
        </FtSummary>
      </div>
    </div>
  </div>
</template>

<style scoped>
#ft-vis {
  height: 550px;
}

.axis-title {
  padding: 5px; 
  font-size: 0.9em;
}

.wrapper {
  position: relative;

  .chart {
    width: 100%;
  }

  .chart-export-buttons {
    position: relative;

    .share-button {
      position: absolute; 
      right: 0; 
      top: -30px; 
      border: 0;
    }

    .close-button {
      position: absolute; 
      right: 0; 
      border: 0; 
      padding: 10px;
    }
  }

  &.export-overlay {
    padding: 0;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 999;
    background-color: rgba(255,255,255,0.9);
    overflow: auto;
    transition: all 0.2s linear;

    .export .chart {
      max-width: 650px;
      margin: 0 auto;
    }

    #ft-vis {
      height: 550px;
    }

    .axis-title {
      position: absolute;
      font-size: 0.75em;
      color: #666;
    }

    .chart-export-buttons {
      text-align: center;
      max-width: 640px;
      margin: 10px auto;
    }

    #export-container {
      padding: 1em;
      box-shadow: 0 0 50px #ddd;
      background: #ece9e6;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
  }
}

.export-annotations {
  position: relative;
  font-size: 0.8em;

  h1,
  strong {
    color: #CB573A;
    margin: 0 0 10px;
  }

  p {
    font-weight: 600;
    margin-top: 0;
    padding: 3px;
  }

  .annotation-buttons {
    position: absolute; 

    &.annotation-buttons-left {
      left: -9.5em; 
      top: 0; 
      width: 110px; 
      height: 100px;

      .button {
        position: absolute; 
        right: 0; 
      }
    }

    &.annotation-buttons-right {
      right: -8.5em; 
      top: -4px;
    }

    &.hide {
      display: none;
    }
  }

  .editable-section {
    position: relative;

    [contenteditable] {
      padding: 0 3px;
      transition: all 0.2s ease-in;

      &:hover {
        background-color: #fff;
      }
      
      &:focus {
        outline: none;
      }
    }

    button {
      position: absolute;
      top: -2px;
      left: -3em;
      border: 0;
      padding: 0.2em 0.3em;

      &.right {
        left: auto;
        right: -3em;
      }
    }
  }

  &.export-annotations-bottom {
    font-size: 0.8em;
    margin-top: 20px;

    span {
      display: block;
    }
  }
}

.export-legend {
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  font-size: 0.7em;
  color: #333;
  padding-top: 5px;
  padding-bottom: 0;

  .legend-graph {
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 5px;
  }

  .colour-sq {
    width: 10px;
    height: 10px;
    background-color: #999;
    display: inline-block;
    margin-right: 5px;
  }

}

.button {
  padding: 6px 6px 5px;
  border-radius: 5px;
  border: 1px dashed #bbb;
  transition: all 0.2s ease-in-out;
  color: #CB573A;
  font-size: 0.85em;

  img {
    position: relative;
    top: 1px;
  }

  &:hover {
    border-style: solid;
    border-color: #999;
  }

  &.clear {
    background: none;

    &:hover {
      background-color: #fff;
    }
  }
}

.datagrid {
  margin: 0;
}

@media only screen and (min-width: 960px) {
  #ft-vis {
    height: 600px;
  }
  .vis {
    display: flex;
  }
  .datagrid {
    margin-left: 10px;
    min-width: 550px
  }
  .export-overlay {
    padding: 50px;
  }
  .export #ft-vis {
    height: 600px;
  }      
}
</style>

<script>
import * as moment from 'moment';
import { isChrome } from '../utils/browserDetect';
import domtoimage from '../utils/dom-to-image';
import FileSaver from 'file-saver';

import {
  chartConfig,
  fieldMappings,
  stockGraphs,
  guides
} from '../utils/ChartHelpers'
import {
  generateChartData,
  generateSummaryData
} from '../utils/DataHelpers'
import FtSummary from './EnergyAverageValueTable'
import { FUEL_TECH, REGIONS } from '../utils/FuelTechConfig'
import EventBus from '../utils/EventBus'

export default {
  components: {
    FtSummary
  },
  props: {
    genData: Array
  },
  data () {
    return {
      chartRendered: false,
      chart: null,
      chartData: [],
      summaryData: null,
      tableData: [],
      sourcesData: [],
      loadsData: [],
      totalAveragePrice: 0,
      pointData: {},
      start: null,
      end: null,
      hidePoint: true,
      region: this.$route.params.region,
      displayExport: isChrome(),
      showExport: false,
      showExportTitle: true,
      showExportDescription: true,
      showExportAttribution: true,
    }
  },
  mounted() {
    EventBus.$on('row-hover', (name) => {
      this.showHoverSeries(name)
    });
    EventBus.$on('row-out', (name) => {
      this.showAllSeries()
    });
  },
  methods: {
    getRegionLabel() {
      const id = this.$route.params.region
      const region = id === undefined ? REGIONS[0] : REGIONS.find(r => r.id === id)
      return region.label
    },
    getLabel(id) {
      const label = FUEL_TECH[id] ? FUEL_TECH[id].label : id;
      return label;
    },
    getColour(id, itemColour) {
      let colour = "#fff";
      if (itemColour !== undefined) {
        colour = itemColour;
      } else if (FUEL_TECH[id] !== undefined) {
        colour = FUEL_TECH[id].colour;
      }
      return colour;
    },
    showHoverSeries(name) {
      this.chart.panels[0].graphs.forEach((graph) => {
        if (graph.id === name) {
          graph.changeOpacity(1)
        } else {
          graph.changeOpacity(0.1)
        }
      })
    },
    showAllSeries() {
      this.chart.panels[0].graphs.forEach((graph) => {
        graph.changeOpacity(1)
      })
    },
    onZoom (event) {
      this.start = event.startDate
      this.end = event.endDate

      this.summaryData = generateSummaryData(
        this.chartData,
        event.startDate,
        event.endDate
      )

      this.tableData= this.summaryData.allData
      this.loadsData = this.summaryData.loadsData
      this.sourcesData = this.summaryData.sourcesData
      this.totalAveragePrice = this.summaryData.totalAveragePrice
    },
    onCursorHover (event) {
      if (event.index !== undefined) {
        const data = event.target.categoryLineAxis.data[event.index]
        const dataContext = data.dataContext
        const pointData = {
          date: data.category
        }

        Object.keys(FUEL_TECH).forEach(ft => {
          const context = ft === 'price' ? 'Close' : 'Average'
          pointData[ft] = dataContext[`${ft}${context}`]
        })

        this.pointData = pointData
        this.hidePoint = false
      } else {
        this.hidePoint = true
      }
    },
    toggleExportOptions() {
      const toggle = !this.showExport;
      this.showExport = toggle;
      this.chart.chartCursorSettings.enabled = !toggle;
      this.chart.validateNow();
    },
    downloadPNG() {
      const self = this;
      const region = this.getRegionLabel(this.$route.params.region);
      const endDate = moment(this.end).format('YYYYMMDD');

      [].map.call(document.querySelectorAll('.annotation-buttons'), function(el) {
        el.classList.add('hide');
      })

      // document.getElementById('export-container').style = 

      domtoimage.toBlob(document.getElementById('export-container'))
        .then(function(blob) {
          FileSaver.saveAs(blob, `${endDate} OpenNEM ${region}.png`);
          self.showExport = false;
          [].map.call(document.querySelectorAll('.annotation-buttons'), function(el) {
            el.classList.remove('hide');
          })
        })
    },
    onExportTitleBlur(e) {
      if (e.target.innerText.trim() === "") {
        this.showExportTitle = false
      }
    },
    onExportDescriptionBlur(e) {
      if (e.target.innerText.trim() === "") {
        this.showExportDescription = false
      }
    },
    onExportAttributionBlur(e) {
      if (e.target.innerText.trim() === "") {
        this.showExportAttribution = false
      }
    },
    onChartRendered() {
      this.chartRendered = true
    }
  },

  watch: {
    genData (newData) {
      const keys = []
      this.chartData = generateChartData(newData)

      if (this.chartData[0]) {
        Object.keys(this.chartData[0]).forEach(ftKey => {
          const find = Object.keys(FUEL_TECH).find(ft => ft === ftKey)
          if (find) {
            keys.push(ftKey)
          }
        })
      }

      if (this.chart) {
        this.chart.clear()
        this.chart = null
      }
      this.chart = makeChart(this.chartData, keys, this)
    }
  },
  beforeDestroy () {
    EventBus.$off('row-hover')
    EventBus.$off('row-out')

    if (this.chart) {
      this.chart.clear()
      this.chart = null
    }
  }
}

function makeChart (data, keys, context) {
  const firstObj = Object.assign({}, data[0])
  const lastIndex = data.length - 1
  const startDate = firstObj.date
  const endDate = data[lastIndex].date

  const mappings = [...fieldMappings(keys)]

  const config = makeConfig(
    data,
    guides(startDate, endDate),
    mappings,
    stockGraphs(keys),
    context
  )

  const listeners = [
    {
      event: 'zoomed',
      method: context.onZoom
    },
    {
      event: 'changed',
      method: context.onCursorHover
    }
  ]
  config.panels.forEach(panel => {
    panel.listeners = listeners
  })

  return AmCharts.makeChart('ft-vis', config)
}

function makeConfig (
  chartData,
  guides,
  fieldMappings,
  stockGraphs,
  context
) {
  return chartConfig({
    listeners: [
      {
        event: 'rendered',
        method: context.onChartRendered
      }
    ],
    dataSets: [
      {
        dataProvider: chartData,
        categoryField: 'date',
        fieldMappings
      }
    ],
    panels: [
      {
        title: 'Generation (MW)',
        percentHeight: 50,
        showCategoryAxis: true,
        allLabels: [
          {
            text: "Generation",
            bold: true,
            x: 5,
            y: 5
          },
          {
            text: "MW",
            x: 70,
            y: 7,
            color: '#999',
            size: 9
          }
        ],
        valueAxes: [
          {
            id: 'v1',
            dashLength: 7,
            zeroGridAlpha: 0,
            stackType: 'regular',
            guides: [
              {
                includeGuidesInMinMax: false,
                value: 0,
                dashLength: 0,
                lineColor: '#000',
                lineThickness: 1,
                lineAlpha: 1
              }
            ]
          }
        ],
        stockGraphs,
        guides,
        stockLegend: { enabled: false }
      },
      {
        title: 'Price ($)',
        percentHeight: 7,
        showCategoryAxis: false,
        allLabels: [
          {
            text: "Price",
            bold: true,
            x: 5,
            y: 5
          },
          {
            text: "$",
            x: 35,
            y: 5,
            color: '#999',
          }
        ],
        valueAxes: [
          {
            id: 'v4',
            logarithmic: true,
            dashLength: 7,
            zeroGridAlpha: 1,
            maximum: 20000,
            minimum: 300,
            labelsEnabled: false,
            gridAlpha: 0,
            guides: [
              makePriceGuide(300, '300', true, '#aaa'),
              makePriceGuide(2000, '', true),
              makePriceGuide(6000, '', true),
              // makePriceGuide(5000, '5k', false, '#aaa'),
              // makePriceGuide(6000, '', true),
              // makePriceGuide(8000, '', true),
              makePriceGuide(10000, '', true),
              // makePriceGuide(12000, '', true),
              makePriceGuide(14000, '', true),
              {
                fillAlpha: 1,
                fillColor: '#ece9e6',
                lineAlpha: 0,
                value: 1,
                toValue: 300,
                above: true
              }
            ]
          }
        ],
        stockGraphs: [
          {
            id: 'p3',
            valueAxis: 'v4',
            valueField: 'pricePos',
            type: 'step',
            lineAlpha: 1,
            lineColor: '#C74523',
            dashLength: 1,
            useDataSetColors: false
          }
        ],
        guides,
        stockLegend: {
          // valueTextRegular: ' ',
          // markerType: 'none'
          enabled: false
        }
      },
      {
        title: '',
        percentHeight: 10,
        showCategoryAxis: false,
        valueAxes: [
          {
            id: 'v3',
            logarithmic: false,
            dashLength: 7,
            zeroGridAlpha: 0,
            maximum: 300,
            minimum: 0,
            guides: [
              makePriceGuide(0, '', false, '#000'),
              makePriceGuide(300, '', true),
              {
                fillAlpha: 0.3,
                fillColor: '#fff',
                value: 0,
                toValue: 300,
              }
            ]
          }
        ],
        stockGraphs: [
          {
            id: 'p2',
            valueAxis: 'v3',
            valueField: 'price',
            type: 'step',
            lineAlpha: 0.9,
            lineColor: '#C74523',
            useDataSetColors: false
          }
        ],
        guides,
        stockLegend: {
          enabled: false
        }
      },
      {
        title: 'Price ($)',
        percentHeight: 5,
        showCategoryAxis: false,
        valueAxes: [
          {
            id: 'v4',
            reversed: true,
            logarithmic: true,
            dashLength: 7,
            zeroGridAlpha: 0,
            labelsEnabled: false,
            maximum: 1000,
            minimum: 1,
            gridAlpha: 0,
            guides: [
              makePriceGuide(1, '', false, '#000'),
              makePriceGuide(60, '', true),
              makePriceGuide(400, '', true),
              makePriceGuide(800, '', true),
            ]
          }
        ],
        stockGraphs: [
          {
            id: 'p3',
            valueAxis: 'v4',
            valueField: 'priceNeg',
            type: 'step',
            lineAlpha: 1,
            lineColor: '#C74523',
            dashLength: 1,
            useDataSetColors: false
          }
        ],
        guides,
        stockLegend: {
          enabled: false
        }
      },
      {
        title: '',
        percentHeight: 10,
        showCategoryAxis: false,
        allLabels: [
          {
            text: "Temperature",
            bold: true,
            x: 5,
            y: 5
          },
          {
            text: "°C",
            x: 80,
            y: 5,
            color: '#999',
          }
        ],
        valueAxes: [
          {
            id: 'v5',
            dashLength: 7,
            zeroGridAlpha: 0,
            maximum: 45,
            minimum: 0,
            gridAlpha: 0,
            labelsEnabled: false,
            guides: [
              {
                includeGuidesInMinMax: false,
                value: 0,
                label: '0',
                dashLength: 0,
                lineColor: "#000",
                lineThickness: 1,
                lineAlpha: 1
              },
              {
                includeGuidesInMinMax: false,
                value: 10,
                label: '10',
                dashLength: 7,
                lineColor: "#bbb",
                lineThickness: 1,
                lineAlpha: 1
              },
              {
                includeGuidesInMinMax: false,
                value: 20,
                label: '20',
                dashLength: 7,
                lineColor: "#bbb",
                lineThickness: 1,
                lineAlpha: 1
              },
              {
                includeGuidesInMinMax: false,
                value: 30,
                label: '30',
                dashLength: 7,
                lineColor: "#bbb",
                lineThickness: 1,
                lineAlpha: 1
              },
              {
                fillAlpha: 0.3,
                fillColor: '#fff',
                value: 0,
                toValue: 45,
              }
            ]
          }
        ],
        stockGraphs: [
          {
            id: 't1',
            valueAxis: 'v5',
            valueField: 'temperature',
            type: 'smoothedLine',
            lineAlpha: 1,
            lineColor: '#C74523',
            useDataSetColors: false
          }
        ],
        guides,
        stockLegend: {
          enabled: false
        }
      },
    ]
  })
}

function makePriceGuide (value, label, hasDash, lineColor) {
  return {
    label,    
    value,
    dashLength: hasDash ? 7 : 0,
    lineColor: lineColor ? lineColor : '#ccc',
    lineThickness: 1,
    lineAlpha: 1,
    includeGuidesInMinMax: false
  }
}
</script>