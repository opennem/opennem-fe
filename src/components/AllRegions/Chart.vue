<template>
  <div class="vis"></div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as moment from 'moment';
import * as Periods from '@/constants/periods';
import * as Intervals from '@/constants/intervals';
import * as VisTypes from '@/constants/vis-types';
import EventBus from '@/lib/event-bus';
import { getPeriodAxisLabel } from '@/domains/date-ranges';
import {
  getFieldMappings,
  getStockGraphs,
  getNemGuides,
  getChartConfig,
} from '@/lib/chart-helpers';
import {
  findDataContextByDate,
  checkDateZoomLessThan1Day,
  checkDateZoomLessThan14Days,
  getZoomDatesOnDateLabel,
  getKeys,
  getAllWeeksYearsBetween,
} from '@/lib/data-helpers';
import updateRouterStartEnd from '@/lib/app-router';
import {
  powerPanel,
  energyPanel,
} from './config';

export default {
  props: {
    chartData: Array,
  },
  data() {
    return {
      chart: null,
      keys: [],
      initialZoom: false,
      chartCursorEnabled: true,
    };
  },
  computed: {
    ...mapGetters({
      domains: 'getDomains',
      isChartZoomed: 'isChartZoomed',
      chartTypeTransition: 'chartTypeTransition',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
      dataEndDate: 'getDataEndDate',
      isExportPng: 'isExportPng',
      isPower: 'isPower',
      groupToPeriods: 'groupToPeriods',
      disabledSeries: 'disabledSeries',
      currentRange: 'currentRange',
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
    isExportPng(exporting) {
      this.chartCursorEnabled = !exporting;
    },
    chartCursorEnabled(enabled) {
      this.setChartCursorEnabled(enabled);
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
    this.clearEvents();
    this.clearChart();
  },
  methods: {
    setChartCursorEnabled(enabled) {
      this.chart.chartCursorSettings.enabled = enabled;
      this.chart.validateNow();
    },

    handleResize() {
      this.chart.invalidateSize();
    },

    setupEventSubscribers() {
      EventBus.$on('chart.zoomedOut.clicked', this.resetChartZoom);
      EventBus.$on('chart.series.toggle', this.seriesToggle);
      EventBus.$on('chart.series.showOnly', this.showOnlySeries);
      EventBus.$on('chart.series.showAll', this.showAllSeries);
      EventBus.$on('extent.event.hover', this.handleExtentEventHover);
      EventBus.$on('extent.event.out', this.handleExtentEventOut);
    },

    clearEvents() {
      EventBus.$off('chart.zoomedOut.clicked');
      EventBus.$off('chart.series.toggle');
      EventBus.$off('chart.series.showOnly');
      EventBus.$off('chart.series.showAll');
      EventBus.$off('extent.event.hover');
      EventBus.$off('extent.event.out');
    },

    setupChart() {
      const panels = this.isPower ?
        powerPanel(this.getPanelListeners()) :
        energyPanel(this.getPanelListeners(), getPeriodAxisLabel(this.currentRange));
      const config = getChartConfig({
        dataSets: [],
        panels,
      }, this.isPower, this.groupToPeriods.slice(0));

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
      // const showWeekends = !this.isPower;

      this.chart.panels[0].stockGraphs =
        getStockGraphs(
          this.domains,
          this.keys,
          graphType,
          unit,
          this.disabledSeries,
        );
      this.chart.panels[0].guides = this.isPower ? getNemGuides(this.chartData, false) : [];
      // this.chart.panels[0].guides = getNemGuides(this.chartData, showWeekends);
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

    transitionChartType(start, end) {
      const weeksYears = getAllWeeksYearsBetween(start, end);
      this.$store.dispatch('weeks', weeksYears.weeks);
      this.$store.dispatch('years', weeksYears.years);
      this.$store.dispatch('setVisType', VisTypes.VIS_TYPE_POWER);
      this.$store.dispatch('currentInterval', Intervals.INTERVAL_5_MIN);
      this.$store.dispatch('minPeriod', Periods.PERIOD_5_MINS);
      this.$store.dispatch('groupToPeriods', [Periods.PERIOD_5_MINS, Periods.PERIOD_30_MINS]);
      this.$store.dispatch('chartTypeTransition', true);
    },

    onPanelZoomed(e) {
      const start = e.startDate;
      const end = e.endDate;

      // check less than 14 days
      const isLessThan14days = checkDateZoomLessThan14Days(start, end);
      if (!this.isPower && isLessThan14days) {
        this.transitionChartType(start, end);
      }

      if (!this.initialZoom) {
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

        if (checkDateZoomLessThan1Day(start, end)) {
          if (this.isPower) {
            this.chart.categoryAxesSettings.groupToPeriods = [Periods.PERIOD_5_MINS];
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
      if (this.chartCursorEnabled) {
        e.chart.panels[0].chartCursor.addListener('zoomed', this.onChartCursorZoomed);
      }

      // refresh chart to include "new" listener
      e.chart.drawnManually = true;
      // e.chart.validateNow();
    },

    onChartCursorZoomed() {
      this.$store.dispatch('setChartZoomed', true);
    },

    zoomChart(start, end) {
      if (checkDateZoomLessThan1Day(start, end) && this.isPower) {
        this.chart.categoryAxesSettings.groupToPeriods = [Periods.PERIOD_5_MINS];
      }
      this.chart.zoom(start, end);
      this.$store.dispatch('setChartZoomed', true);
    },

    resetChartZoom() {
      if (this.isPower) {
        this.chart.categoryAxesSettings.groupToPeriods = this.groupToPeriods.slice(0);
      }
      if (this.chartTypeTransition) {
        this.$store.dispatch('chartTypeTransition', false);
      }
      this.chart.zoomOut();
      this.$store.dispatch('setChartZoomed', false);
    },

    handleExtentEventHover(date) {
      const period = this.isPower ? Periods.PERIOD_5_MINS : Periods.PERIOD_1_DAY;
      const searchDate = this.isPower ? date : moment(date).set({ hour: 0, minute: 0, second: 0 });
      const dataContext = findDataContextByDate(
        searchDate,
        this.chart.mainDataSet.agregatedDataProviders[period],
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
  height: 350px;

  @include desktop {
    height: 550px;
  }
}

</style>

