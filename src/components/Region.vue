<template>
<div class="columns is-desktop is-variable is-1">
  <transition name="fade">
    <zoom-out-button v-if="isChartZoomed && !isFetching && !isExportPng" />
  </transition>

  <div class="column" v-show="!isFetching" :class="{ export: isExportPng }">
    <div class="panel-toggle-btns" v-if="isExportPng">
      <button class="price-btn button is-small is-rounded is-primary is-inverted"
        :class="{ 
          'on': showPricePanel,
          'off': !showPricePanel,
          'temperature-on': showTemperaturePanel,
          'temperature-off': !showTemperaturePanel,
        }"
        @click="togglePricePanel">
        <span v-if="showPricePanel"><font-awesome-icon class="fas" :icon="iconRemove" /></span>
        <span v-else>Show Price</span>
      </button>

      <button class="temperature-btn button is-small is-rounded is-primary is-inverted"
        :class="{
          'on': showTemperaturePanel,
          'off': !showTemperaturePanel,
          'price-on': showPricePanel,
          'price-off': !showPricePanel,
        }"
        @click="toggleTemperaturePanel">
        <span v-if="showTemperaturePanel"><font-awesome-icon class="fas" :icon="iconRemove" /></span>
        <span v-else>Show Temperature</span>
      </button>
    </div>

    <div id="export-container">
      <export-png-header v-if="isExportPng" />
      <region-chart :chartData="chartData" />
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
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import {
  faCheck,
  faTimesCircle,
} from '@fortawesome/fontawesome-free-solid';
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
    FontAwesomeIcon,
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
    iconOn() {
      return faCheck;
    },
    iconRemove() {
      return faTimesCircle;
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
    toggleTemperaturePanel() {
      this.$store.dispatch('setTemperaturePanel', !this.showTemperaturePanel);
    },
    togglePricePanel() {
      this.$store.dispatch('setPricePanel', !this.showPricePanel);
    },
  },
};
</script>

<style lang="scss" scoped>
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

  .panel-toggle-btns {
    position: absolute;
    top: 0;
    z-index: 9;

    button {
      float: right;
      clear: both;
      display: block;
      margin-bottom: 0.2rem;
      position: absolute;

      .fas {
        position: relative;
        top: 1px;
        font-size: 18px;
      }

      &.on {
        background: none;
        margin-left: -21px;
      }
      &.on:active,
      &.on:focus {
        outline: none;
        box-shadow: none;
      }
    }

    .price-btn {
      top: 422px;
      margin-left: -90px;

      &.on.temperature-off {
        top: 403px;
      }
      &.off {
        top: 380px;
      }
    }
    .temperature-btn {
      top: 583px;
      margin-left: -133px;

      &.on.price-off {
        top: 420px;
      }
      &.off.price-on {
        top: 540px;
      }
      &.off.price-off {
        top: 415px;
      }
    }
  }

  section {
    &.price-off.temperature-on {
      margin-top: 1.5rem;
    }
    &.price-off.temperature-off {
      margin-top: 1rem;
    }
    &.price-on.temperature-off {
      margin-top: -0.7rem;
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