<template>
<div class="columns is-desktop is-variable is-1">
  <div class="zoom-out-btn">
    <transition name="fade">
      <button class="button is-small is-rounded is-primary is-inverted" 
        @click="handleZoomOutClicked" 
        v-if="isChartZoomed && !isFetching">Reset Zoom</button>
    </transition>
  </div>


  <div class="column" v-show="!isFetching" :class="{ export: isExportPng }">
    <export-png-header v-if="isExportPng" />
    <region-chart :chartData="chartData" />
    <export-png-footer v-if="isExportPng" />
  </div>
  <div class="column is-narrow" v-if="!isFetching && !isExportPng">
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
import ExportPngHeader from './Export/PngHeader';
import ExportPngFooter from './Export/PngFooter';

export default {
  components: {
    RegionChart,
    RegionSummary,
    ExportPngHeader,
    ExportPngFooter,
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
      isExportPng: 'isExportPng',
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

.export {
  max-width: 650px;
  border-radius: 5px;
  border: 1px solid #ddd;
  box-shadow: 0 0 50px #ddd;
  padding: 1rem 0;
  margin: 1rem auto;

  .vis {
    margin: 0.5rem;
  }
}
.zoom-out-btn {
  position: absolute;
  z-index: 9;
  right: 0;
  left: 0;
  width: 94px;
  margin: -2px auto 0;
}
</style>