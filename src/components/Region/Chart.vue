<template>
  <div class="vis" :class="visClass"></div>
</template>

<script>
import * as _ from 'lodash';
import { mapGetters } from 'vuex';
import * as moment from 'moment';
import EventBus from '@/lib/event-bus';
import {
  getFieldMappings,
  getStockGraphs,
  getNemGuides,
  getChartConfig,
} from '@/lib/chart-helpers';
import {
  dataFilter,
  findDataContextByDate,
  checkDateZoomLessThan1Day,
  getZoomDatesOnDateLabel,
  getKeys,
} from '@/lib/data-helpers';
import updateRouterStartEnd from '@/lib/app-router';
import {
  getAllPanelsGeneration,
  getAllPanelsEnergy,
  getGenerationAndPricePanels,
  getGenerationAndTemperaturePanels,
  generationPanel,
  energyPanel,
  getAllPanelsPercentHeight,
  getGenerationOnlyPanelPercentHeight,
  getGenerationPricePanelPercentHeight,
  getGenerationTemperaturePanelPercentHeight,
} from './config';

export default {
  props: {
    chartData: Array,
  },
  data() {
    return {
      chart: null,
      chartRendered: false,
      keys: [],
      panelStart: null,
      panelEnd: null,
      initialZoom: false,
      panelNum: 0,
      chartCursorEnabled: true,
    };
  },
  computed: {
    ...mapGetters({
      domains: 'getDomains',
      isChartZoomed: 'isChartZoomed',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
      dataEndDate: 'getDataEndDate',
      showPricePanel: 'showPricePanel',
      showTemperaturePanel: 'showTemperaturePanel',
      isExportPng: 'isExportPng',
      isPower: 'isPower',
    }),
    visClass() {
      return {
        'one-panel': !this.showPricePanel && !this.showTemperaturePanel,
        'two-panels': !this.showPricePanel && this.showTemperaturePanel,
        'four-panels': this.showPricePanel && !this.showTemperaturePanel,
      };
    },
  },
  watch: {
    chartData() {
      this.initialZoom = this.isChartZoomed;
      if (this.chartRendered) {
        this.chartRendered = false;
        this.clearChart();
        this.setupChart();
      }
      this.setupKeys();
      this.updateChart();
    },
    showPricePanel(show) {
      if (show) {
        if (this.showTemperaturePanel) {
          this.setChartPanelHeights(getAllPanelsPercentHeight());
        } else {
          this.setChartPanelHeights(getGenerationPricePanelPercentHeight());
        }
      } else if (this.showTemperaturePanel) {
        this.setChartPanelHeights(getGenerationTemperaturePanelPercentHeight());
      } else {
        this.setChartPanelHeights(getGenerationOnlyPanelPercentHeight());
      }
      this.chart.validateNow();
    },
    showTemperaturePanel(show) {
      if (show) {
        if (this.showPricePanel) {
          this.setChartPanelHeights(getAllPanelsPercentHeight());
        } else {
          this.setChartPanelHeights(getGenerationTemperaturePanelPercentHeight());
        }
      } else if (this.showPricePanel) {
        this.setChartPanelHeights(getGenerationPricePanelPercentHeight());
      } else {
        this.setChartPanelHeights(getGenerationOnlyPanelPercentHeight());
      }
      this.chart.validateNow();
    },
    isExportPng(exporting) {
      this.chartCursorEnabled = !exporting;
    },
    chartCursorEnabled(enabled) {
      this.setChartCursorEnabled(enabled);
    },
  },
  created() {
    // debounce the resize event
    window.addEventListener('resize', _.debounce(() => {
      this.handleResize();
    }, 300));
  },
  mounted() {
    this.setupEventSubscribers();
    this.setupChart();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.clearEvents();
    this.clearChart();
  },
  methods: {
    setChartCursorEnabled(enabled) {
      this.chart.chartCursorSettings.enabled = enabled;
      this.chart.validateNow();
    },

    setChartPanelHeights(heightArr) {
      for (let i = 0; i < this.panelNum; i += 1) {
        this.chart.panels[i].percentHeight = heightArr[i];
      }
    },

    handleResize() {
      if (this.chart && this.chartRendered) {
        this.chart.invalidateSize();
      }
    },

    setupEventSubscribers() {
      EventBus.$on('chart.zoomedOut.clicked', this.resetChartZoom);
      EventBus.$on('extent.event.hover', this.handleExtentEventHover);
      EventBus.$on('extent.event.out', this.handleExtentEventOut);
    },

    clearEvents() {
      EventBus.$off('chart.zoomedOut.clicked');
      EventBus.$off('extent.event.hover');
      EventBus.$off('extent.event.out');
    },

    setupPanels() {
      let panels = [];
      const temperatureField = this.isPower ? 'temperature' : 'temperature_mean';
      const priceField = this.isPower ? 'price' : 'volume_weighted_price';
      const hasMinMax = !this.isPower;

      if (this.showPricePanel && this.showTemperaturePanel) {
        panels = this.isPower ?
          getAllPanelsGeneration(
            this.getPanelListeners(),
            priceField,
            temperatureField,
            hasMinMax,
          ) :
          getAllPanelsEnergy(
            this.getPanelListeners(),
            priceField,
            temperatureField,
            hasMinMax,
          );
      } else if (this.showPricePanel) {
        panels = getGenerationAndPricePanels(this.getPanelListeners());
      } else if (this.showTemperaturePanel) {
        panels = getGenerationAndTemperaturePanels(this.getPanelListeners());
      } else {
        panels = this.isPower ?
          generationPanel(this.getPanelListeners()) :
          energyPanel(this.getPanelListeners());
      }

      return panels;
    },

    setupChart() {
      const panels = this.setupPanels();
      const panelNum = panels.length;
      this.panelNum = panelNum;
      const config = getChartConfig({
        dataSets: [],
        panels,
      }, this.isPower);

      // manually adjust individual panel percentage heights
      switch (panelNum) {
        case 1:
          config.panels[0].percentHeight = 100;
          break;
        case 2:
          config.panels[0].percentHeight = 70;
          config.panels[1].percentHeight = 30;
          break;
        case 4:
          config.panels[0].percentHeight = 65;
          config.panels[1].percentHeight = 10;
          config.panels[2].percentHeight = 13;
          config.panels[3].percentHeight = 7;
          break;
        case 5:
        default:
          config.panels[0].percentHeight = 50;
          config.panels[1].percentHeight = 7;
          config.panels[2].percentHeight = 13;
          config.panels[3].percentHeight = 5;
          config.panels[4].percentHeight = 15;
      }

      config.panels[0].categoryAxis.listeners = this.getCategoryAxisListeners();
      this.chart = window.AmCharts.makeChart(this.$el, config);

      this.chart.addListener('init', this.onChartInit);
      /**
       * workaround for chart.invalidateSize bug
       * - re-add panel zoomed listener every time chart is redrawn
       */
      this.chart.addListener('drawn', this.onChartDrawn);
    },

    setupKeys() {
      this.keys = getKeys(this.chartData);
    },

    clearChart() {
      if (this.chart) {
        this.chart.clear();
        this.chart = null;
      }
    },

    updateChart() {
      this.chart.dataSets = [{
        dataProvider: this.chartData,
        categoryField: 'date',
        fieldMappings: getFieldMappings(this.keys),
      }];

      const unit = this.isPower ? 'MW' : 'GWh';
      const graphType = this.isPower ? 'line' : 'step';

      this.chart.panels[0].stockGraphs = getStockGraphs(this.domains, this.keys, graphType, unit);

      // add Guides
      const showWeekends = !this.isPower;
      const guides = getNemGuides(this.chartData, showWeekends);
      const panelNum = this.chart.panels.length;

      for (let i = 0; i < panelNum; i += 1) {
        this.chart.panels[i].guides = guides;
      }

      this.chart.validateData();
      this.chartRendered = true;
    },

    getPanelListeners() {
      return [
        { event: 'zoomed', method: this.onPanelZoomed },
        { event: 'changed', method: this.onPanelChanged },
        { event: 'rollOverGraph', method: this.onPanelHover },
      ];
    },

    getCategoryAxisListeners() {
      return [
        { event: 'clickItem', method: this.onCategoryAxisItemClicked },
      ];
    },

    getPanelChartCursorListeners() {
      return [{ event: 'zoomed', method: this.onChartCursorZoomed }];
    },

    getTemperaturePanelIndex() {
      let index = 4;
      if (this.showTemperaturePanel && !this.showPricePanel) {
        index = 1;
      }
      return index;
    },

    onPanelZoomed(e) {
      const start = e.startDate;
      const end = e.endDate;

      // each stock panel generates a zoom event, this is to stop the data from being re-calculated
      const datesChanged = (moment(this.panelStart).isSame(start)) &&
        (moment(this.panelEnd).isSame(end));

      if (!datesChanged) {
        this.panelStart = start;
        this.panelEnd = end;

        this.$store.dispatch('saveSelectedDates', {
          start,
          end,
        });

        updateRouterStartEnd(this.$router, start, end);

        this.$store.dispatch('generateRangeSummary', {
          data: this.chartData,
          start,
          end,
        });

        this.$store.dispatch('setExportData', dataFilter(this.chartData, start, end));

        if (checkDateZoomLessThan1Day(start, end) && this.isPower) {
          this.chart.categoryAxesSettings.groupToPeriods = ['5mm'];
          const temperaturePanelIndex = this.getTemperaturePanelIndex();

          if (this.showTemperaturePanel) {
            this.chart.panels[temperaturePanelIndex].graphs[0].bullet = 'round'; // show temperature bullets
          }
        }
      }
    },

    onPanelChanged(e) {
      if (e.index !== undefined) {
        const data = e.target.categoryLineAxis.data[e.index];
        this.$store.dispatch('generatePointSummary', {
          date: data.category,
          dataContext: data.dataContext,
        });
        this.$store.dispatch('showInstantaneousData', true);
      } else {
        this.$store.dispatch('showInstantaneousData', false);
      }
    },

    onPanelHover(e) {
      const graphId = e.graph.id;
      const graphs = this.chart.panels[0].graphs;

      graphs.forEach((g) => {
        this.toggleSeriesBalloon(g, graphId);
      });
    },

    onCategoryAxisItemClicked(e) {
      if (this.chartCursorEnabled) {
        const zoomDates = getZoomDatesOnDateLabel(e.value, this.dataEndDate);
        if (zoomDates) {
          this.zoomChart(zoomDates.start, zoomDates.end);
        }
      }
    },

    toggleSeriesBalloon(graph, selectedGraphId) {
      if (selectedGraphId !== graph.valueField) {
        // eslint-disable-next-line
        graph.showBalloon = false;
      } else {
        // eslint-disable-next-line
        graph.showBalloon = true;
      }
    },

    // Get the correct start/end times based on the chart categoryAxis
    onChartInit() {
      if (this.initialZoom) {
        this.zoomChart(this.startDate, this.endDate);
        this.initialZoom = false;
      }

      this.$store.dispatch('fetchingData', false);
    },

    onChartDrawn(e) {
      // prevent infinite loop
      if ('drawnManually' in e.chart) {
        delete e.chart.drawnManually;
        return;
      }

      // add zoomed listener to chartCursor
      const panelNum = e.chart.panels.length;
      if (this.chartCursorEnabled) {
        for (let i = 0; i < panelNum; i += 1) {
          e.chart.panels[i].chartCursor.addListener('zoomed', this.onChartCursorZoomed);
        }
      }

      // refresh chart to include "new" listener
      e.chart.drawnManually = true;
      e.chart.validateNow();
    },

    onChartCursorZoomed() {
      this.$store.dispatch('setChartZoomed', true);
    },

    zoomChart(start, end) {
      if (checkDateZoomLessThan1Day(start, end) && this.isPower) {
        this.chart.categoryAxesSettings.groupToPeriods = ['5mm'];
        const temperaturePanelIndex = this.getTemperaturePanelIndex();

        if (this.showTemperaturePanel) {
          this.chart.panels[temperaturePanelIndex].graphs[0].bullet = 'round'; // show temperature bullets
        }
      }

      this.chart.zoom(start, end);
      this.$store.dispatch('setChartZoomed', true);
    },

    resetChartZoom() {
      if (this.isPower) {
        this.chart.categoryAxesSettings.groupToPeriods = ['5mm', '30mm'];
        const temperaturePanelIndex = this.getTemperaturePanelIndex();

        if (this.showTemperaturePanel) {
          this.chart.panels[temperaturePanelIndex].graphs[0].bullet = 'none'; // hide temperature bullets
        }
      }
      this.chart.zoomOut();
      this.$store.dispatch('setChartZoomed', false);
    },

    handleExtentEventHover(date) {
      const interval = this.isPower ? '5mm' : 'DD';
      const searchDate = this.isPower ? date : moment(date).set({ hour: 0, minute: 0, second: 0 });
      const dataContext = findDataContextByDate(
        searchDate,
        this.chart.mainDataSet.agregatedDataProviders[interval],
      );

      this.$store.dispatch('generatePointSummary', {
        date,
        dataContext,
      });
      this.$store.dispatch('showInstantaneousData', true);

      this.chart.panels.forEach((p) => {
        p.chartCursor.showCursorAt(date);
      });
    },

    handleExtentEventOut() {
      this.chart.panels.forEach((p) => {
        p.chartCursor.hideCursor();
      });
      this.$store.dispatch('showInstantaneousData', false);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.vis {
  height: 450px;

  @include desktop {
    height: 620px;
  }

  &.one-panel {
    height: 350px;

    @include desktop {
      height: 450px;
    }
  }

  &.two-panels {
    height: 380px;

    @include desktop {
      height: 480px;
    }
  }

  &.four-panels {
    height: 400px;

    @include desktop {
      height: 500px;
    }
  }

  // Price Pos Panel
  /deep/ .amcharts-stock-panel-div-stockPanel1 {
    margin-top: 10px !important;

    // remove the 0 axis line
    .amcharts-category-axis .amcharts-axis-line {
      stroke-opacity: 0;
    }
  }

  // Price Panel
  /deep/ .amcharts-stock-panel-div-stockPanel2 {
    margin-top: -8px !important;

    @include desktop {
      margin-top: -10px !important;
    }

    .amcharts-category-axis .amcharts-axis-line {
      stroke: #666;
    }
  }

  // Price Neg Panel
  /deep/ .amcharts-stock-panel-div-stockPanel3 {
    margin-top: -1px !important;

    @include desktop {
      margin-top: -1px !important;
    }

    // remove the 0 axis line
    .amcharts-category-axis .amcharts-axis-line {
      stroke-opacity: 0;
    }
  }

  // Temperature Panel
  /deep/ .amcharts-stock-panel-div-stockPanel4 {
    margin-top: 10px !important;

    .amcharts-category-axis .amcharts-axis-line {
      stroke: #666;
    }
  }
}

</style>

