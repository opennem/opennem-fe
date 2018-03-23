<template>
  <div class="wrapper" style="padding: 0 1rem;" v-bind:class="{ 'export-overlay': showExport }">
    
    <a href="#" v-show="!showExport" v-on:click.stop.prevent="toggleExportOptions()"
      class="no-border"
      style="position: absolute; right: 15px; top: -33px; font-size: 1.3rem"
    >
      <i class="fa fa-arrow-alt-circle-down"></i>
    </a>

    <div v-if="showExport && !showPNGExport" class="export-options export-modal">
      <h4>Download</h4>

      <button class="button clear close-button" v-on:click="toggleExportOptions()">
        <img src="/icons/close-icon.png" alt="" style="height: 15px;">
      </button>

      <ul>
        <li>
          <a href="#" class="download-link" v-show="displayExport" v-on:click.stop.prevent="showChartExportOptions()">
            <div>PNG</div>
            <div class="export-icon"><i class="fa fa-fw fa-file-image"></i></div>
          </a>
        </li>
        <li>
          <JsonToCsv
            :data="chartData"
            :fields="csvHeaders"
            :name="this.getFilename() + '.csv'"
            >
              <a href="javascript:" class="download-link" v-on:click="toggleExportOptions()">
                <div>CSV</div>
                <div class="export-icon"><i class="fa fa-fw fa-file-alt"></i></div>
              </a>
          </JsonToCsv>
        </li>
      </ul>
    </div>

    <div class="vis" v-bind:class="{ export: showPNGExport }">

      <div class="chart" style="position: relative">
        <transition name="fade">
          <span class="tooltip" v-if="showTooltip">Zoom out</span>
        </transition>
        <a href="#" 
          v-show="!showExport && isZoomed" 
          v-on:click.stop.prevent="onZoomoutClicked()"
          class="zoom-out-btn no-border"
          @mouseover="onTooltipMouseover"
          @mouseout="onTooltipMouseout"
        >
          <i class="fas fa-search-minus"></i>
        </a>

        <div class="chart-export-buttons" v-show="showPNGExport" style="z-index: 99; top: 10px;">
          <button class="button clear close-button" v-on:click="toggleExportOptions()">
            <img src="/icons/close-icon.png" alt="" style="height: 15px;">
          </button>
        </div>   

        <div id="export-container" v-bind:class="{ 'export-modal': showExport }" v-show="(showExport && showPNGExport) || !showExport">
          <div class="export-annotations export-annotations-top" v-show="showPNGExport">
            <div class="annotation-buttons annotation-buttons-left">
              <button class="button" style="top: 0;" v-show="!showExportTitle"  v-on:click="showExportTitle = true">
                Add Title
              </button>
              <button class="button" style="top: 30px;" v-show="!showExportDescription" v-on:click="showExportDescription = true">
                Add Description
              </button> 
            </div>
            <section class="editable-section" v-if="showExportTitle">
              <h1 contenteditable="true" v-on:blur="onExportTitleBlur" style="margin-right: 20px;">{{getRegionLabel()}}</h1>
            </section>              
            <section class="editable-section" v-if="showExportDescription">
              <p contenteditable="true" v-on:blur="onExportDescriptionBlur">Description</p>
            </section>
          </div>

          <div id="ft-vis"></div>

          <div class="export-legend" v-show="showPNGExport">
            <div class="legend-graph" v-for="item in sourcesData" :key="item.id">
              <div class="colour-sq" v-bind:style="{backgroundColor: getColour(item.id, item.colour)}"></div>
              {{getLabel(item.id)}}
            </div>
          </div>

          <div class="export-annotations export-annotations-bottom" v-show="showPNGExport">
            <span>
              sources <strong>AEMO, BOM, OpenNEM</strong>
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

        <div class="chart-export-buttons" v-show="showPNGExport">
          <button class="button clear" v-on:click="downloadPNG()">
            <i class="fa fa-arrow-alt-circle-down"></i>
            Download
          </button>
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
          :dateFrom="gridDateFrom"
          :dateTo="gridDateTo"
          :showPrice="true"
          :hidePoint="hidePoint">
        </FtSummary>

        <min-max-table
          v-show="showRecords"
          :demand="demandExtent"
          :renewables="renewablesExtent"
          :temperature="temperatureExtent"
          :price="priceExtent" />
      </div>
    </div>
  </div>
</template>

<style scoped>
#ft-vis {
  height: 600px;
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
      height: 600px;
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

  }
}

.export-modal {
  position: relative;
  padding: 1em;
  box-shadow: 0 0 50px #ddd;
  background: #ece9e6;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 20px;
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

h4 {
  margin: 0;
  color: #4a4a4a;
  position: relative;
  padding: 0.3rem 0.5rem ;
}
.export-options {
  width: 200px; 
  height: 130px; 
  margin: 100px auto 0; 
  padding: 0.5rem;
}
.export-options ul {
  list-style-type: none;
  margin: 1rem 0 0;
  padding: 0;
}
.export-options li {
  border-bottom: 1px solid #ddd;
}
.export-options li:last-child {
  border-bottom: none;
}
.export-options .close-button {
  position: absolute;
  top: 0.3rem;
  right: 0.8rem;
  border: none;
}
.download-link {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  padding: 0.5rem;
  border: none;
}
.download-link:hover {
  background-color: rgba(255,255,255,0.4);
}
.export-icon {
  color: #666;
}
.zoom-out-btn {
  position: absolute; 
  right: 5px; 
  top: 5px; 
  font-size: 1rem; 
  z-index: 999; 
  opacity: 0.5;
}
.zoom-out-btn:hover {
  opacity: 1;
}

.tooltip {
  position: absolute;
  top: -15px;
  right: -10px;
  font-size: 0.6em;
  color: #333;
  padding: 3px 6px 2px;
  background: #fff;
  box-shadow: 2px 2px 2px rgba(0,0,0,.1);
  z-index: 9999;
}

@media only screen and (min-width: 960px) {
  #ft-vis {
    height: 650px;
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
import * as _ from 'lodash';
import * as moment from 'moment';
import { isChrome } from '../utils/browserDetect';
import domtoimage from '../utils/dom-to-image';
import FileSaver from 'file-saver';
import JsonToCsv from './JsonToCsv';

import {
  chartConfig,
  fieldMappings,
  stockGraphs,
  guides
} from '../utils/ChartHelpers'
import {
  generateChartData,
  generateSummaryData,
  formatNumber
} from '../utils/DataHelpers'
import FtSummary from './EnergyAverageValueTable'
import MinMaxTable from './MinMaxTable'
import { FUEL_TECH, REGIONS, CSV_HEADERS } from '../utils/FuelTechConfig'
import EventBus from '../utils/EventBus'

export default {
  components: {
    FtSummary,
    MinMaxTable,
    JsonToCsv
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
      demandExtent: [],
      renewablesExtent: [],
      temperatureExtent: [],
      priceExtent: [],
      totalAveragePrice: 0,
      pointData: {},
      hidePoint: true,
      region: this.$route.params.region,
      displayExport: isChrome(),
      showExport: false,
      showExportTitle: true,
      showExportDescription: true,
      showExportAttribution: true,
      showPNGExport: false,
      csvHeaders: CSV_HEADERS,
      currentPrice: null,
      currentGraph: null,
      gridDateFrom: null,
      gridDateTo: null,
      showTooltip: false,
      currentHovering: false,
      hasGenerateSummary: false,
      minMaxHover: false
    }
  },
  mounted() {
    EventBus.$on('row-hover', (name) => {
      this.showHoverSeries(name)
    });
    EventBus.$on('row-out', (name) => {
      this.showAllSeries()
    });

    EventBus.$on('stockEventRow-hover', (panelName, date, label, value) => {
      const dateValue = `${moment(date).valueOf()}`
      const dataProvider = _.find(this.chart.mainDataSet.agregatedDataProviders['5mm'], (d) => {
        return d.amCategoryIdField === dateValue
      })

      this.minMaxHover = true
      this.hidePoint = false

      this.chart.panels.forEach((p) => {
        p.chartCursor.showCursorAt(date)
      })

      this.pointDataSetup(date, dataProvider)
    });

    EventBus.$on('stockEventRow-out', (panelName, date, label, value) => {
      this.minMaxHover = false
      this.hidePoint = true
      this.chart.panels.forEach((p) => {
        p.chartCursor.hideCursor()
      })
    });    
  },
  computed: {
    isZoomed() {
      return this.$store.getters.isChartZoomed
    },
    start() {
      return this.$store.getters.getChartZoomedStartDate
    },
    end() {
      return this.$store.getters.getChartZoomedEndDate
    },
    showRecords() {
      return this.$route.query.records === 'true'
    }
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
      const startDate = event.startDate
      let endDate = event.endDate

      // each stock panel generates a zoom event, this is to stop the data from being re-calculated 
      let sameFromTo = (moment(this.gridDateFrom).isSame(startDate)) && (moment(this.gridDateTo).isSame(endDate))

      if (this.chartRendered) {
        // check dates zoom no less than 1 hour
        let dateCheck = moment(startDate).add(1, 'hours')
        if (!moment(dateCheck).isSameOrBefore(endDate)) {
          console.log('changed end date')
          endDate = dateCheck.toDate()
          this.zoomInChart(startDate, endDate)
        }

        this.$store.dispatch('setZoomedDates', {
          startDate,
          endDate
        });
      }

      // console.log(sameFromTo, this.hasGenerateSummary)
      if (!sameFromTo || !this.hasGenerateSummary) {
        this.summaryData = generateSummaryData(
          this.chartData,
          startDate,
          endDate
        )

        this.gridDateFrom = startDate
        this.gridDateTo = endDate

        this.tableData= this.summaryData.allData
        this.loadsData = this.summaryData.loadsData
        this.sourcesData = this.summaryData.sourcesData
        this.totalAveragePrice = this.summaryData.totalAveragePrice

        this.demandExtent = this.summaryData.demandExtent
        this.renewablesExtent = this.summaryData.renewablesExtent
        this.priceExtent = this.summaryData.priceExtent
        this.temperatureExtent = this.summaryData.temperatureExtent

        this.hasGenerateSummary = true
      }
      
    },
    onCursorHover (event) {
      if (event.index !== undefined) {
        const data = event.target.categoryLineAxis.data[event.index]
        this.pointDataSetup(data.category, data.dataContext)
        this.hidePoint = false  
      } else {
        this.hidePoint = true
      }
    },
    pointDataSetup (date, dataProvider) {
      const pointData = { date }

      Object.keys(FUEL_TECH).forEach(ft => {
        const context = ft === 'price' ? 'Close' : 'Average'
        pointData[ft] = dataProvider[`${ft}${context}`]

        if (ft === 'price') {
          this.currentPrice = dataProvider[`${ft}${context}`]
        }
      })

      this.pointData = pointData

      this.chart.panels.forEach(p => {
        const graphs = p.graphs

        graphs.forEach(g => {
          if (this.minMaxHover) {
            g.showBalloon = false
          } else {
            if (this.currentGraph !== g.valueField) {
              g.showBalloon = false

              // if (g.valueField === 'temperature') {
              //   g.showBalloon = true
              // }

              // if (g.valueField === 'price') {
              //   g.showBalloon = true
              // }

              // if (g.valueField === 'priceNeg') {
              //   g.showBalloon = true
              // }

              // if (this.currentPrice > 300 && g.valueField === 'pricePos') {
              //   g.showBalloon = true
              // }
            } else {
              g.showBalloon = true
            }
          }
        })
      })
    },
    onRollOverGraph(event) {
      const graphId = event.graph.id
      this.currentGraph = graphId      
    },
    showChartExportOptions() {
      this.showPNGExport = true;
    },
    getFilename() {
      const region = this.getRegionLabel(this.$route.params.region);
      const endDate = moment(this.gridDateTo).format('YYYYMMDD');
      return `${endDate} OpenNEM ${region}`;
    },
    toggleExportOptions() {
      const toggle = !this.showExport;
      this.showExport = toggle;
      this.chart.chartCursorSettings.enabled = !toggle;

      if (!toggle) {
        this.showPNGExport = false;
      }

      this.chart.validateNow();
    },
    downloadPNG() {
      const self = this;

      [].map.call(document.querySelectorAll('.annotation-buttons'), function(el) {
        el.classList.add('hide');
      })

      domtoimage.toBlob(document.getElementById('export-container'))
        .then(function(blob) {
          FileSaver.saveAs(blob, `${self.getFilename()}.png`);
          self.showExport = false;
          self.showPNGExport = false;
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
    onChartInit() {
      setTimeout(() => {
        if (this.isZoomed) {
          this.zoomInChart(this.start, this.end);
        }
      }, 1)
    },
    onChartRender() {
      this.chartRendered = true
    },
    zoomInChart(startDate, endDate) {
      this.chart.categoryAxesSettings.groupToPeriods = ['5mm']; // set to 5 min grouping
      this.chart.panels[4].graphs[0].bullet = 'round'; // show temperature bullets
      this.chart.zoom(startDate, endDate);
      this.$store.dispatch('setChartZoom', true);
    },
    onZoomoutClicked() {
      this.chart.categoryAxesSettings.groupToPeriods = ['5mm', '30mm']; // reset back to 5min and 30 min groupings
      this.chart.panels[4].graphs[0].bullet = 'none'; // hide temperature bullets
      this.chart.zoomOut();
      this.chart.validateData()
      this.$store.dispatch('setChartZoom', false);
    },
    onTooltipMouseover() {
      this.currentHovering = true
      setTimeout(() => {
        if (this.currentHovering) {
          this.showTooltip = true;
        }
      }, 500);
    },
    onTooltipMouseout() {      
      this.showTooltip = false;
      this.currentHovering = false
    }
  },

  watch: {
    genData (newData) {
      console.log('newData')
      this.hasGenerateSummary = false

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
        this.chartRendered = false
      }
      this.chart = makeChart(this.chartData, keys, this)
    }
  },
  beforeDestroy () {
    EventBus.$off('row-hover')
    EventBus.$off('row-out')
    EventBus.$off('stockEventRow-hover')
    EventBus.$off('stockEventRow-out')

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
    },
    {
      event: 'rollOverGraph',
      method: context.onRollOverGraph
    }
  ]

  const chartCursorListeners = [
    {
      event: 'zoomed',
      method: function() {
        context.$store.dispatch('setChartZoom', true);
      }
    }
  ];

  config.panels.forEach(panel => {
    panel.listeners = listeners;
    panel.chartCursor.listeners = chartCursorListeners;
  })

  config.panels[0].categoryAxis.listeners = [
    {
      event: 'clickItem',
      method: function(e) {
        const newVal = e.value.replace(/\n/g, ' ');
        const lastIndex = newVal.length;
        const startIndex = lastIndex-6;
        const clickedDate = newVal.substring(startIndex, lastIndex);
        const thisYear = moment().year();
        const today = moment();
        const re = new RegExp('(.*[a-z]){3}', 'i')

        if (re.test(clickedDate)) {
          // TODO (steven): this assumes it's this year. Check also when the year has changed
          let startDate = moment(clickedDate + ' ' + thisYear, 'D MMM YYYY');
          const endDate = moment(startDate).add(1, 'days');

          if (moment(startDate).isSame(today, 'day')) {
            startDate = moment(context.gridDateTo).subtract(24, 'hours');
          }

          context.zoomInChart(startDate.toDate(), endDate.toDate());
        }
      }
    }
  ]

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
        event: 'init',
        method: context.onChartInit
      },
      {
        event: 'rendered',
        method: context.onChartRender
      }
    ],
    dataSets: [
      {
        dataProvider: chartData,
        categoryField: 'date',
        fieldMappings,
        stockEvents: []
      }
    ],
    panels: [
      {
        title: 'Generation (MW)',
        percentHeight: 50,
        showCategoryAxis: true,
        chartCursor: {},
        categoryAxis: {},
        allLabels: [
          {
            text: "Generation",
            bold: true,
            x: 5,
            y: 0
          },
          {
            text: "MW",
            x: 70,
            y: 2,
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
        title: 'Price ($/MWh)',
        percentHeight: 7,
        showCategoryAxis: false,
        chartCursor: {},
        allLabels: [
          {
            text: "Price",
            bold: true,
            x: 5,
            y: 0
          },
          {
            text: "$/MWh",
            x: 35,
            y: 2,
            color: '#999',
            size: 9
          }
        ],
        valueAxes: [
          {
            id: 'v4',
            logarithmic: true,
            dashLength: 7,
            zeroGridAlpha: 0,
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
            id: 'p4',
            valueAxis: 'v4',
            valueField: 'pricePos',
            type: 'step',
            lineAlpha: 1,
            lineColor: '#C74523',
            dashLength: 1,
            useDataSetColors: false,
            showBalloon: false,
            balloonFunction: function (item, graph) {
              return `<strong>$${formatNumber(item.values.value, '0,0.00')}</strong>`
            }
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
        chartCursor: {},
        valueAxes: [
          {
            id: 'v3',
            logarithmic: false,
            dashLength: 7,
            zeroGridAlpha: 0,
            maximum: 300,
            minimum: 0,
            guides: [
              makePriceGuide(0, '', false, '#333'),
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
            useDataSetColors: false,
            showBalloon: false,
            balloonFunction: function (item, graph) {
              return `<strong>$${formatNumber(item.values.value, '0,0.00')}</strong>`
            }
          }
        ],
        guides,
        stockLegend: {
          enabled: false
        }
      },
      {
        title: 'Price ($/MWh)',
        percentHeight: 5,
        showCategoryAxis: false,
        chartCursor: {},         
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
              // makePriceGuide(1, '', false, '#000'),
              makePriceGuide(60, '', true),
              makePriceGuide(400, '', true),
              //makePriceGuide(800, '', true),
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
            useDataSetColors: false,
            showBalloon: false,
            balloonFunction: function (item, graph) {
              return `<strong>-$${formatNumber(item.values.value, '0,0.00')}</strong>`
            }
          }
        ],
        guides,
        stockLegend: {
          enabled: false
        }
      },
      {
        title: '',
        percentHeight: 15,
        showCategoryAxis: false,
        chartCursor: {},
        allLabels: [
          {
            text: "Temperature",
            bold: true,
            x: 5,
            y: 0
          },
          {
            text: "°C",
            x: 80,
            y: 2,
            color: '#999',
            size: 9
          }
        ],
        valueAxes: [
          {
            id: 'v5',
            dashLength: 7,
            zeroGridAlpha: 0,
            maximum: 50,
            minimum: 0,
            gridAlpha: 0,
            labelsEnabled: false,
            guides: [
              {
                includeGuidesInMinMax: false,
                value: 0,
                label: '0',
                dashLength: 0,
                lineColor: "#333",
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
                includeGuidesInMinMax: false,
                value: 40,
                label: '40',
                dashLength: 7,
                lineColor: "#bbb",
                lineThickness: 1,
                lineAlpha: 1
              },
              {
                fillAlpha: 0.3,
                fillColor: '#fff',
                value: 0,
                toValue: 40,
              }
            ]
          }
        ],
        stockGraphs: [
          {
            id: 'p6',
            valueAxis: 'v5',
            valueField: 'temperature',
            type: 'line',
            lineAlpha: 1,
            lineColor: '#C74523',
            // fillAlphas: 0.1,
            useDataSetColors: false,
            showBalloon: false,
            connect: false,
            bulletSize: 5,
            balloonFunction: function (item, graph) {
              return `<strong>${item.values.value}°C</strong>`
            }
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