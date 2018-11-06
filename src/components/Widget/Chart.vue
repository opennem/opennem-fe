<template>
  <div class="vis"></div>
</template>

<script>
import { mapGetters } from 'vuex';
import EventBus from '@/lib/event-bus';
import {
  getFieldMappings,
  getStockGraphs,
  getNemGuides,
  getChartConfig,
} from '@/lib/chart-helpers';
import {
  checkDateZoomLessThan1Day,
  getZoomDatesOnDateLabel,
  getKeys,
} from '@/lib/data-helpers';
import getPanels from './config';

export default {
  props: {
    chartData: Array,
  },
  data() {
    return {
      chart: null,
      keys: [],
      initialZoom: false,
    };
  },
  computed: {
    ...mapGetters({
      domains: 'getDomains',
      isChartZoomed: 'isChartZoomed',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
      dataEndDate: 'getDataEndDate',
      disabledSeries: 'disabledSeries',
    }),
  },
  watch: {
    chartData() {
      this.initialZoom = this.isChartZoomed;
      this.clearChart();
      this.setupChart();
      this.setupKeys();
      this.updateChart();
    },
  },
  created() {
    // throttle the resize event
    window.addEventListener('resize', this.handleResize);
  },
  mounted() {
    this.setupEventSubscribers();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    EventBus.$off('chart.zoomedOut.clicked');
    EventBus.$off('chart.series.toggle');
    EventBus.$off('chart.series.showOnly');
    EventBus.$off('chart.series.showAll');
    this.clearChart();
  },
  methods: {
    handleResize() {
      this.chart.invalidateSize();
    },

    setupEventSubscribers() {
      EventBus.$on('chart.zoomedOut.clicked', this.resetChartZoom);
      EventBus.$on('chart.series.toggle', this.seriesToggle);
      EventBus.$on('chart.series.showOnly', this.showOnlySeries);
      EventBus.$on('chart.series.showAll', this.showAllSeries);
    },

    setupChart() {
      const config = getChartConfig({
        dataSets: [],
        panels: getPanels(this.getPanelListeners()),
      }, true);

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

      this.chart.panels[0].stockGraphs =
        getStockGraphs(
          this.domains,
          this.keys,
          'line',
          'MW',
          this.disabledSeries,
        );
      this.chart.panels[0].guides = getNemGuides(this.chartData);
      this.chart.validateData();
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

    onPanelZoomed(e) {
      const start = e.startDate;
      const end = e.endDate;
      if (!this.initialZoom) {
        this.$store.dispatch('saveSelectedDates', {
          start,
          end,
        });

        this.$store.dispatch('generateRangeSummary', {
          data: this.chartData,
          start,
          end,
        });

        if (checkDateZoomLessThan1Day(start, end)) {
          this.chart.categoryAxesSettings.groupToPeriods = ['5mm'];
          this.zoomChart(start, end);
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
      const zoomDates = getZoomDatesOnDateLabel(e.value, this.dataEndDate);
      if (zoomDates) {
        this.zoomChart(zoomDates.start, zoomDates.end);
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

    onChartInit() {
      if (this.initialZoom) {
        this.zoomChart(this.startDate, this.endDate);
        this.initialZoom = false;
      }
    },

    onChartDrawn(e) {
      // prevent infinite loop
      if ('drawnManually' in e.chart) {
        delete e.chart.drawnManually;
        return;
      }

      // add zoomed listener to chartCursor
      e.chart.panels[0].chartCursor.addListener('zoomed', this.onChartCursorZoomed);

      // refresh chart to include "new" listener
      e.chart.drawnManually = true;
      // e.chart.validateNow();
    },

    onChartCursorZoomed() {
      this.$store.dispatch('setChartZoomed', true);
    },

    zoomChart(start, end) {
      if (checkDateZoomLessThan1Day(start, end)) {
        this.chart.categoryAxesSettings.groupToPeriods = ['5mm'];
      }
      this.chart.zoom(start, end);
      this.$store.dispatch('setChartZoomed', true);
    },

    resetChartZoom() {
      this.chart.categoryAxesSettings.groupToPeriods = ['5mm', '30mm'];
      this.chart.zoomOut();
      this.$store.dispatch('setChartZoomed', false);
    },

    showAllSeries() {
      const stockGraphs = this.chart.panels[0].stockGraphs;

      stockGraphs.forEach((stockGraph) => {
        this.chart.panels[0].showGraph(stockGraph);
      });
    },

    showOnlySeries(seriesId) {
      const stockGraphs = this.chart.panels[0].stockGraphs;

      stockGraphs.forEach((stockGraph) => {
        if (stockGraph.id === seriesId) {
          this.chart.panels[0].showGraph(stockGraph);
        } else {
          this.chart.panels[0].hideGraph(stockGraph);
        }
      });
    },

    seriesToggle(seriesId, show) {
      const stockGraphs = this.chart.panels[0].stockGraphs;
      const graph = stockGraphs.find(stockGraph => stockGraph.id === seriesId);

      if (graph) {
        if (show) {
          this.chart.panels[0].showGraph(graph);
        } else {
          this.chart.panels[0].hideGraph(graph);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.vis {
  height: 240px;

  @include desktop {
    height: 300px;
  }
}

</style>

