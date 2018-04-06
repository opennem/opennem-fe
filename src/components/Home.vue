<template>
<div class="columns is-desktop is-variable is-1">
  <div class="zoom-out-btn">
    <transition name="fade">
      <button class="button is-small is-rounded is-danger is-inverted" 
        @click="handleZoomOutClicked" 
        v-if="isChartZoomed && !isFetching">Reset Zoom</button>
    </transition>
  </div>

  <div class="column" v-show="!isFetching">
    <all-regions-chart :chartData="chartData" />
  </div>
  <div class="column is-narrow" v-if="!isFetching">
    <all-regions-summary />

    <!-- <table class="summary-table table is-fullwidth is-narrow">
      <thead>
        <tr>
          <th></th>
          <th class="has-text-right">Lowest</th>
          <th class="has-text-right">Highest</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Demand MW</td>
          <td class="cell-value">
            <span>17,115</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
          <td class="cell-value">
            <span>17,115</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
        </tr>
        
        <tr>
          <td>Renewables %</td>
          <td class="cell-value">
            <span>11%</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
          <td class="cell-value">
            <span>31%</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
        </tr>

        <tr>
          <td>Price $/MWh</td>
          <td class="cell-value">
            <span>$10</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
          <td class="cell-value">
            <span>$300</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
        </tr>

        <tr>
          <td>Temperature</td>
          <td class="cell-value">
            <span>10C</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
          <td class="cell-value">
            <span>30C</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
        </tr>
      </tbody>
    </table> -->
  </div>
</div>

</template>

<script>
import { mapGetters } from 'vuex';
import EventBus from '@/lib/event-bus';
import getJSON from '@/lib/data-apis';
import dataTransform from '@/lib/data-transform';
import { getStartEndDates } from '@/lib/data-helpers';
import { GraphDomains } from '@/domains/graphs';
import AllRegionsChart from './AllRegions/Chart';
import AllRegionsSummary from './AllRegions/Summary';

export default {
  components: {
    AllRegionsChart,
    AllRegionsSummary,
  },
  created() {
    this.$store.dispatch('setDomains', GraphDomains);
    this.fetchNem();
  },
  mounted() {
    EventBus.$on('data.fetch.latest', this.fetchNem);
  },
  beforeDestroy() {
    EventBus.$off('data.fetch.latest');
  },
  data() {
    return {
      chartData: [],
    };
  },
  computed: {
    ...mapGetters({
      isFetching: 'isFetching',
      isChartZoomed: 'isChartZoomed',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
    }),
  },
  watch: {
    chartData(data) {
      let start = this.startDate;
      let end = this.endDate;

      if (!this.isChartZoomed) {
        const startEndDates = getStartEndDates(data);
        start = startEndDates.start;
        end = startEndDates.end;
        this.$store.dispatch('saveSelectedDates', startEndDates);
      }

      // Generate table data
      this.$store.dispatch('generateRangeSummary', {
        data,
        start,
        end,
      });
    },
  },
  methods: {
    handleZoomOutClicked() {
      EventBus.$emit('chart.zoomedOut.clicked');
    },
    fetchNem() {
      this.$store.dispatch('fetchingData', true);

      const url = 'data/power/nem.json';

      getJSON(url).then((response) => {
        const transformedData = dataTransform(GraphDomains, response.data);
        this.chartData = transformedData;
        this.$store.dispatch('setDataEndDate', transformedData[transformedData.length - 1].date);
        this.$store.dispatch('fetchingData', false);
        this.$store.dispatch('setExportData', {
          name: 'NEM',
          data: transformedData,
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.zoom-out-btn {
  position: absolute;
  z-index: 9;
  right: 0;
  left: 0;
  width: 94px;
  margin: -2px auto 0;
}
</style>