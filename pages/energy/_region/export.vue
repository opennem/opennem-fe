<template>
  <div class="energy-region export-region">
    <export-header
      :summary="summary"
      :legend="legend"
      @exportClick="handleExportClick"
      @exportCancel="handleCancelClick"
      @tableToggle="handleTableToggle"
    />

    <transition name="fade">
      <div
        v-if="!ready"
        class="vis-table-container loading-containers">
        <div 
          class="vis-container" 
          style="width: 100%">
          <div
            class="loader-block"
            style="height: 30px" />
          <div
            class="loader-block"
            style="height: 400px" />
        </div>
      </div>
    </transition>

    <div id="export-container">
      <div 
        v-if="ready" 
        class="vis-legend-container" 
      >
        <export-image-header :exporting="exporting" />

        <div class="vis-table-container">
          <vis-section class="vis-container" />
          <summary-legend-section 
            :show-summary="summary" 
            :show-legend="legend" 
            class="table-container" />
        </div>

        <export-image-footer
          :show-bom-source="showBomSource"
          :exporting="exporting"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import { isPowerRange } from '@/constants/rangeInterval.js'
import REGIONS from '~/constants/regions.js'
import domToImage from '~/services/DomToImage.js'
import VisSection from '@/components/Energy/Export/VisSection.vue'
import SummaryLegendSection from '@/components/Energy/Export/SummaryLegendSection.vue'
import ExportHeader from '~/components/Energy/Export/Header.vue'
import ExportImageHeader from '~/components/Energy/ExportImageHeader.vue'
import ExportImageFooter from '~/components/Energy/ExportImageFooter.vue'

export default {
  layout: 'export',
  components: {
    ExportHeader,
    ExportImageHeader,
    ExportImageFooter,
    VisSection,
    SummaryLegendSection
  },

  data() {
    return {
      summary: false,
      legend: true,
      exporting: false
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      fuelTechGroupName: 'fuelTechGroupName',
      fuelTechGroup: 'fuelTechGroup',
      ready: 'regionEnergy/ready',
      currentDataset: 'regionEnergy/currentDataset',
      filteredCurrentDataset: 'regionEnergy/filteredCurrentDataset',
      filteredDates: 'regionEnergy/filteredDates',
      domainTemperature: 'regionEnergy/domainTemperature',
      showChartTemperature: 'chartOptionsTemperature/chartShown'
    }),
    showBomSource() {
      return this.domainTemperature.length > 0 && this.showChartTemperature
    },
    regionId() {
      return this.$route.params.region
    }
  },

  watch: {
    range(curr, prev) {
      this.setCompareDifference(false)
      this.doUpdateTickFormats({ range: curr, interval: this.interval })
      if (isPowerRange(curr) && isPowerRange(prev)) {
        this.doFilterRegionData({
          range: curr,
          interval: this.interval
        })
      } else {
        this.doGetRegionData({
          region: this.regionId,
          range: curr,
          interval: this.interval,
          groupName: this.fuelTechGroupName
        })
      }
    },
    interval(interval) {
      this.setCompareDifference(false)
      this.doUpdateTickFormats({ range: this.range, interval: interval })
      this.doUpdateDatasetByInterval({ range: this.range, interval })
    },
    filteredDates(dates) {
      this.doUpdateXTicks({
        range: this.range,
        interval: this.interval,
        isZoomed: dates.length > 0
      })
    },
    filterPeriod(period) {
      this.doUpdateDatasetByFilterPeriod({
        range: this.range,
        interval: this.interval,
        period
      })
    },
    fuelTechGroupName(groupName) {
      this.doUpdateDatasetByGroup({ groupName })
    },
    currentDataset(dataset) {
      if (dataset.length > 0) {
        this.doUpdateXGuides({
          interval: this.interval,
          start: dataset[0].time,
          end: dataset[dataset.length - 1].time
        })
      }
    }
  },

  created() {
    this.$store.dispatch('currentView', 'energy')
    this.doGetRegionData({
      region: this.regionId,
      range: this.range,
      interval: this.interval,
      groupName: this.fuelTechGroupName
    })
    this.doUpdateTickFormats({ range: this.range, interval: this.interval })
  },

  methods: {
    ...mapActions({
      doGetRegionData: 'regionEnergy/doGetRegionData',
      doUpdateDatasetByInterval: 'regionEnergy/doUpdateDatasetByInterval',
      doUpdateDatasetByGroup: 'regionEnergy/doUpdateDatasetByGroup',
      doFilterRegionData: 'regionEnergy/doFilterRegionData',
      doUpdateDatasetByFilterPeriod:
        'regionEnergy/doUpdateDatasetByFilterPeriod',
      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats',
      doUpdateXTicks: 'visInteract/doUpdateXTicks'
    }),
    ...mapMutations({
      setCompareDifference: 'compareDifference'
    }),

    handleTableToggle(widgetName) {
      this[widgetName] = !this[widgetName]
    },
    handleExportClick() {
      this.exporting = true
      let date = ''
      let region = REGIONS.find(r => r.id === this.regionId).label
      if (this.filteredCurrentDataset.length > 0) {
        date = d3TimeFormat('%Y%m%d')(this.filteredCurrentDataset[0].date)
      }
      if (this.regionId === 'nem') {
        region = 'OpenNEM'
      }
      domToImage
        .toBlob(document.getElementById('export-container'))
        .then(blob => {
          saveAs(blob, `${date} ${region}.png`)
          this.exporting = false
        })
    },
    handleCancelClick() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';
#export-container {
  background-color: $body-background-color;
  border-radius: 4px;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;

  .table-container {
    margin: 0.5rem;
  }
}

::v-deep .vis-chart {
  margin-right: 10px;
}
</style>
