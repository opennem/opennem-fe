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
    <region-chart :chartData="chartData" />
  </div>
  <div class="column is-narrow" v-if="!isFetching">
    <region-summary />
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
import RegionChart from './Region/Chart';
import RegionSummary from './Region/Summary';

export default {
  components: {
    RegionChart,
    RegionSummary,
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
  props: {
    region: String,
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
    regionId() {
      return this.$route.params.region;
    },
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
    region() {
      this.fetchNem();
    },
  },
  methods: {
    handleZoomOutClicked() {
      EventBus.$emit('chart.zoomedOut.clicked');
    },
    fetchNem() {
      this.$store.dispatch('fetchingData', true);

      getJSON(`data/power/${this.region}1.json`).then((response) => {
        const transformedData = dataTransform(GraphDomains, response.data);
        this.$store.dispatch('setDataEndDate', transformedData[transformedData.length - 1].date);
        this.chartData = transformedData;
        this.$store.dispatch('setExportData', {
          name: 'Region',
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