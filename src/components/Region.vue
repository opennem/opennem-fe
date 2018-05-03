<template>
<div class="columns is-desktop is-variable is-1">
  <transition name="fade">
    <zoom-out-button v-if="isChartZoomed && !isFetching && !isExportPng" />
  </transition>

  <div class="column" v-show="!isFetching" :class="{ export: isExportPng }">
    <div id="export-container">
      <export-png-header v-if="isExportPng" />
      <div style="position: relative;">
        <panel-buttons />
        <region-chart :chartData="chartData" />
      </div>
      <export-legend v-if="isExportPng"
        :class="{
          'price-on': showPricePanel,
          'price-off': !showPricePanel,
          'temperature-on': showTemperaturePanel,
          'temperature-off': !showTemperaturePanel,
        }" />
      <export-png-footer v-if="isExportPng" />
    </div>
  </div>

  <div class="column is-narrow" v-if="!isFetching && !isExportPng">
    <region-summary />
    <region-extent :showTemperature="true" :showPrice="true" v-if="records" />
  </div>
</div>

</template>

<script>
import { mapGetters } from 'vuex';
import domtoimage from '@/lib/dom-to-image';
import FileSaver from 'file-saver';
import EventBus from '@/lib/event-bus';
import getJSON from '@/lib/data-apis';
import updateRouterStartEnd from '@/lib/app-router';
import dataTransform from '@/lib/data-transform';
import { getStartEndDates } from '@/lib/data-helpers';
import { GraphDomains } from '@/domains/graphs';
import { getRegionLabel } from '@/domains/regions';
import RegionChart from './Region/Chart';
import RegionSummary from './Region/Summary';
import RegionExtent from './ui/Extent';
import ExportPngHeader from './Export/PngHeader';
import ExportPngFooter from './Export/PngFooter';
import PanelButtons from './Export/PanelShowHideButtons';
import ExportLegend from './Export/Legend';
import ZoomOutButton from './ui/ZoomOutButton';

export default {
  components: {
    RegionChart,
    RegionSummary,
    RegionExtent,
    ExportPngHeader,
    ExportPngFooter,
    ExportLegend,
    ZoomOutButton,
    PanelButtons,
  },
  created() {
    this.$store.dispatch('setDomains', GraphDomains);
    this.fetchNem();
  },
  mounted() {
    EventBus.$on('data.fetch.latest', this.fetchNem);
    EventBus.$on('download.png', this.downloadPng);
  },
  beforeDestroy() {
    EventBus.$off('data.fetch.latest');
    EventBus.$off('download.png');
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
      exportName: 'getExportName',
      showPricePanel: 'showPricePanel',
      showTemperaturePanel: 'showTemperaturePanel',
    }),
    regionId() {
      return this.$route.params.region;
    },
    records() {
      return this.$route.query.records;
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
        updateRouterStartEnd(this.$router, start, end);
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
    isExportPng(value) {
      if (!value) {
        this.$store.dispatch('resetPanels');
      }
    },
  },
  methods: {
    downloadPng() {
      // a slight delay to allow some conditional statements to flow through by other listeners
      setTimeout(() => {
        domtoimage.toBlob(document.getElementById('export-container'))
          .then((blob) => {
            FileSaver.saveAs(blob, `${this.exportName}.png`);
          });
      }, 5);
    },
    fetchNem() {
      this.$store.dispatch('fetchingData', true);

      getJSON(`data/power/${this.region}1.json`).then((response) => {
        const transformedData = dataTransform(GraphDomains, response.data);
        this.$store.dispatch('setDataEndDate', transformedData[transformedData.length - 1].date);
        this.chartData = transformedData;
        this.$store.dispatch('setExportData', transformedData);
        this.$store.dispatch('setExportRegion', getRegionLabel(this.regionId));
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../styles/variables.scss";

.export {
  max-width: 650px;
  margin: 0.5rem auto;
  position: relative;

  .vis {
    margin: 0.5rem;
    height: 590px;

    &.one-panel {
      height: 300px;
    }

    &.two-panels {
      height: 450px;
    }

    &.four-panels {
      height: 450px;
    }
  }

  section {
    &.price-on.temperature-on {
      margin-top: -1.5rem;
    }
    &.price-off.temperature-on {
      margin-top: -1.5rem;
    }
    &.price-off.temperature-off {
      margin-top: -2rem;
    }
    &.price-on.temperature-off {
      margin-top: -2rem;
    }
  }

  // Workaround for overlaying panels in export view
  /deep/ .amcharts-stock-panel-div-stockPanel2 {
    position: relative;
    top: -2px;

    @include desktop {
      top: 0;
    }
  }

  #export-container {
    padding: 1rem;
    background-color: $background;
    position: relative;
    border-radius: 5px;
    border: 1px solid #ddd;
    box-shadow: 0 0 50px #ddd;
    padding: 1rem 0.5rem;
  }
}

</style>