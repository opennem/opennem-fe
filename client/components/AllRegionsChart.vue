<template>
  <div class="wrapper" v-bind:class="{ 'export-overlay': showExport }">
    <div class="loader" v-if="refreshing"></div>

    <a href="#" v-show="!showExport && !refreshing" v-on:click.stop.prevent="toggleExportOptions()"
      class="no-border"
      style="position: absolute; right: 0; top: -33px; font-size: 1.3rem"
    >
      <i class="fas fa-arrow-alt-circle-down"></i>
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
            :name="this.getFilename() + '.csv'">
              <a href="javascript:" class="download-link" v-on:click="toggleExportOptions()">
                <div>CSV</div>
                <div class="export-icon"><i class="fa fa-fw fa-file-alt"></i></div>
              </a>
          </JsonToCsv>
        </li>
      </ul>
    </div>

    <div class="vis" v-show="!refreshing" v-bind:class="{ export: showPNGExport }">           
      <div class="chart" style="position: relative">
        <a href="#" 
          v-show="!showExport && !refreshing && isZoomed" 
          v-on:click.stop.prevent="onZoomoutClicked()"
          class="zoom-out-btn no-border"
          title="Zoom out"
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
              <h1 contenteditable="true" v-on:blur="onExportTitleBlur" style="margin-right: 20px;">Title</h1>
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
          class="ft-summary"
          :tableData="tableData"
          :sourcesData="sourcesData"
          :loadsData="loadsData"
          :pointData="pointData"
          :dateFrom="gridDateFrom"
          :dateTo="gridDateTo"
          :showPrice="false"
          :hidePoint="hidePoint">
        </FtSummary>
      </div>

    </div>
  </div>
</template>

<script>
import numeral from "numeral";
import * as moment from "moment";
import { isChrome } from '../utils/browserDetect';
import domtoimage from '../utils/dom-to-image';
import FileSaver from 'file-saver';
import JsonToCsv from './JsonToCsv';

import {
  chartConfig,
  fieldMappings,
  stockGraphs,
  guides
} from "../utils/ChartHelpers"
import { generateSummaryData } from '../utils/DataHelpers'
import FtSummary from "./EnergyAverageValueTable";
import { FUEL_TECH, CSV_HEADERS } from "../utils/FuelTechConfig";
import EventBus from '../utils/EventBus';


export default {
  components: {
    FtSummary,
    JsonToCsv
  },
  mounted() {
    EventBus.$on('row-hover', (name) => {
      this.showHoverSeries(name)
    });
    EventBus.$on('row-out', (name) => {
      this.showAllSeries()
    });
  },
  props: {
    genData: Array,
    refreshing: Boolean,
    noGuides: Boolean,
    chartType: String,
    forceGridCount: Boolean
  },
  data() {
    return {
      chartRendered: false,
      chart: null,
      chartData: [],
      summaryData: {},
      tableData: [],
      sourcesData: [],
      loadsData: [],
      pointData: {},
      hidePoint: true,
      displayExport: isChrome(),
      showExport: false,
      showExportTitle: true,
      showExportDescription: true,
      showExportAttribution: true,
      showPNGExport: false,
      csvHeaders: CSV_HEADERS,
      gridDateFrom: null,
      gridDateTo: null

    };
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
    }
  },
  methods: {
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
    onZoom(event) {
      const startDate = event.startDate
      const endDate = event.endDate
      this.$store.dispatch('setZoomedDates', {
        startDate,
        endDate
      });

      this.gridDateFrom = startDate
      this.gridDateTo = endDate

      this.summaryData = generateSummaryData(this.chartData, startDate, endDate)
      this.tableData= this.summaryData.allData
      this.sourcesData = this.summaryData.sourcesData
      this.loadsData = this.summaryData.loadsData
    },
    onCursorHover(event) {
      if (event.index !== undefined) {
        const data = event.target.categoryLineAxis.data[event.index];
        const dataContext = data.dataContext;
        const pointData = {
          date: data.category
        };

        Object.keys(FUEL_TECH).forEach(ft => {
          pointData[ft] = dataContext[`${ft}Average`];
        });

        this.pointData = pointData;
        this.hidePoint = false;
      } else {
        this.hidePoint = true;
      }
    },
    onRollOverGraph(event) {
      const graphId = event.graph.id;
      const graphs = this.chart.panels[0].graphs

      graphs.forEach(g => {
        if (graphId !== g.valueField) {
          g.showBalloon = false
        } else {
          g.showBalloon = true
        }
      })
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
    showChartExportOptions() {
      this.showPNGExport = true;
    },
    getFilename() {
      const endDate = moment(this.end).format('YYYYMMDD');
      return `${endDate} OpenNEM`;
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
    onChartRendered() {
      this.chartRendered = true
    },
    onChartInit() {
      setTimeout(() => {
        if (this.isZoomed) {
          this.zoomInChart(this.start, this.end);
        }
      }, 1)
    },
    zoomInChart(startDate, endDate) {
      this.chart.categoryAxesSettings.groupToPeriods = ['5mm'];
      this.chart.zoom(startDate, endDate);
      this.$store.dispatch('setChartZoom', true);
    },
    onZoomoutClicked() {
      this.chart.categoryAxesSettings.groupToPeriods = ['5mm', '30mm'];
      this.chart.zoomOut();
      this.$store.dispatch('setChartZoom', false);
    }
  },
  watch: {
    genData(newData) {
      this.chartData = newData;
      if (this.chart) {
        this.chart.clear()
        this.chart = null
      }
      this.chart = makeChart(this.chartData, this.noGuides, this)
    }
  },
  beforeDestroy() {
    EventBus.$off('row-hover')
    EventBus.$off('row-out')
    if (this.chart) {
      this.chart.clear()
      this.chart = null
    }
  }
};

function makeChart(data, noGuides, context) {
  let firstObj = Object.assign({}, data[0]);
  const lastIndex = data.length - 1;
  const startDate = firstObj.date;
  const endDate = data[lastIndex].date;
  const chartGuides = noGuides ? [] : guides(startDate, endDate)

  delete firstObj.date;
  const keys = Object.keys(firstObj);

  const config = makeConfig(
    data,
    chartGuides,
    fieldMappings(keys),
    stockGraphs(keys, context.chartType),
    context
  );
  config.panels[0].listeners = [
    {
      event: "zoomed",
      method: context.onZoom
    },
    {
      event: "changed",
      method: context.onCursorHover
    },
    {
      event: 'rollOverGraph',
      method: context.onRollOverGraph
    }
  ];

  // onZoomInGraph
  config.panels[0].chartCursor.listeners = [
    {
      event: 'zoomed',
      method: function() {
        context.$store.dispatch('setChartZoom', true);
      }
    }
  ];

  config.panels[0].categoryAxis.listeners = [
    {
      event: 'clickItem',
      method: function(e) {
        const newVal = e.value.replace(/\n/g, ' ');
        const lastIndex = newVal.length;
        const startIndex = lastIndex-6;
        const clickedDate = newVal.substring(startIndex, lastIndex);
        const thisYear = moment().year();

        const startDate = moment(clickedDate + ' ' + thisYear, 'D MMM YYYY');
        const endDate = moment(startDate).add(1, 'days');

        context.zoomInChart(startDate.toDate(), endDate.toDate());
      }
    }
  ]

  return AmCharts.makeChart("ft-vis", config);
}

function makeConfig(
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
      },
      {
        event: 'init',
        method: context.onChartInit
      }
    ],
    dataSets: [
      {
        dataProvider: chartData,
        categoryField: "date",
        fieldMappings
      }
    ],
    panels: [
      {
        title: "Generation (MW)",
        showCategoryAxis: true,
        addClassNames: true,
        chartCursor: {},
        categoryAxis: {},
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
            id: "v1",
            dashLength: 6,
            zeroGridAlpha: 0,
            stackType: "regular",
            // minimum: 0,
            guides: [
              {
                includeGuidesInMinMax: false,
                value: 0,
                dashLength: 0,
                lineColor: "#000",
                lineThickness: 1,
                lineAlpha: 1
              }
            ]
          }
        ],
        stockGraphs,
        guides,
        stockLegend: { enabled: false }
      }
    ]
  }, context.forceGridCount);
}

function setOpacity(graph, opacity) {
  var container = graph.chart.div;
  var className = "amcharts-graph-" + graph.id;
  var items = container.getElementsByClassName(className);
  if (undefined === items)
    return;
  for (var x in items) {
    if ("object" !== typeof items[x])
      continue;
    var path = items[x].getElementsByTagName("path")[0];
    if (undefined !== path) {
      // set line opacity
      path.style.strokeOpacity = opacity;
      path.style.fillOpacity = opacity;
    }

    // set bullet opacity
    var bullets = items[x].getElementsByClassName("amcharts-graph-bullet");
    for (var y in bullets) {
      if ("object" !== typeof bullets[y])
        continue;
      bullets[y].style.fillOpacity = opacity;
    }

    // set label opacity
    var labels = items[x].getElementsByClassName("amcharts-graph-label");
    for (var y in labels) {
      if ("object" !== typeof labels[y])
        continue;
      labels[y].style.opacity = opacity == 1 ? 1 : 0;
    }

  }
}
</script>

<style scoped>
#ft-vis {
  height: 300px;
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
      height: 350px;
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

@media only screen and (min-width: 960px) {
  #ft-vis {
    height: 557px;
  }
  .vis {
    display: flex;
  }
  .datagrid {
    margin-left: 10px;
    min-width: 500px
  }
  .export-overlay {
    padding: 50px;
  }
  .export #ft-vis {
    height: 400px;
  }      
}
</style>
