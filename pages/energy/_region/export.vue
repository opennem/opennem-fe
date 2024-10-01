<template>
  <div class="energy-region export-region">
    <export-header
      :summary="summary"
      :legend="legend"
      :percent-display="percentDisplay"
      @exportClick="handleExportClick"
      @exportCancel="handleCancelClick"
      @tableToggle="handleTableToggle"
      @percentDisplayToggle="handlePercentDisplayToggle"
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
        class="vis-legend-container">
        <export-image-header :exporting="exporting" />

        <div class="vis-table-container">
          <vis-section class="vis-container" />
          <summary-legend-section
            v-show="hasGenerationOrEmissionsVolumeSelected"
            :show-summary="summary"
            :show-legend="legend"
            :show-percent="percentDisplay"
            class="table-container"
          />
        </div>

        <export-image-footer
          :show-bom-source="showBomSource"
          :exporting="exporting"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { utcFormat } from 'd3-time-format'
import _includes from 'lodash.includes'

import { getEnergyRegions } from '@/constants/energy-regions.js'
import * as FT from '@/constants/energy-fuel-techs/group-detailed.js'
import domToImage from '~/services/DomToImage.js'
import { lsGet, lsSet } from '@/services/LocalStorage'
import VisSection from '@/components/Energy/Export/VisSection.vue'
import SummaryLegendSection from '@/components/Energy/Export/SummaryLegendSection.vue'
import ExportHeader from '~/components/Energy/Export/Header.vue'
import ExportImageHeader from '~/components/Energy/Export/ImageHeader.vue'
import ExportImageFooter from '~/components/Energy/Export/ImageFooter.vue'

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
      percentDisplay: false,
      exporting: false,
      regions: getEnergyRegions(),
      isWemOrAu: false
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      fuelTechGroupName: 'fuelTechGroupName',
      hiddenFuelTechs: 'hiddenFuelTechs',
      percentContributionTo: 'percentContributionTo',

      ready: 'regionEnergy/ready',
      currentDataset: 'regionEnergy/currentDataset',
      filteredCurrentDataset: 'regionEnergy/filteredCurrentDataset',
      filteredDates: 'regionEnergy/filteredDates',
      domainTemperature: 'regionEnergy/domainTemperature',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      domainPowerEnergy: 'regionEnergy/domainPowerEnergy',
      isEnergyType: 'regionEnergy/isEnergyType',

      showChartTemperature: 'chartOptionsTemperature/chartShown',

      hasGenerationOrEmissionsVolumeSelected: 'export/hasGenerationOrEmissionsVolumeSelected'
    }),
    showBomSource() {
      return this.domainTemperature.length > 0 && this.showChartTemperature
    },
    regionId() {
      return this.$route.params.region
    },
    property() {
      return this.fuelTechGroupName === FT.GROUP_LABEL ? 'fuelTech' : 'group'
    },
    calculateByGeneration() {
      return this.percentContributionTo === 'generation'
    },

    emissionsDomains() {
      const domains = this.currentDomainEmissions.filter(
        (d) => d.category !== FT.LOAD
      )
      const hidden = this.hiddenFuelTechs
      return domains
        ? domains.filter((d) => !_includes(hidden, d[this.property]))
        : []
    },
    powerEnergyDomains() {
      const domains = this.currentDomainPowerEnergy
      const hidden = this.hiddenFuelTechs
      return domains.filter((d) => !_includes(hidden, d[this.property]))
    }
  },

  watch: {
    filteredDates(dates) {
      this.doUpdateXTicks({
        range: this.range,
        interval: this.interval,
        isZoomed: dates.length > 0,
        filterPeriod: this.filterPeriod
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
        this.updateEmissionsData()
      }
    }
  },

  created() {
    this.setupSummaryLegendStates()

    this.setFocusDate(null)
    this.isWemOrAu = this.regionId === 'wem' || this.regionId === 'au'
    this.$store.dispatch('currentView', 'energy')
    this.doGetRegionDataByRangeInterval({
      region: this.regionId,
      range: this.range,
      interval: this.interval,
      period: this.filterPeriod,
      groupName: this.fuelTechGroupName
    })
    this.doUpdateTickFormats({
      range: this.range,
      interval: this.interval,
      filterPeriod: this.filterPeriod
    })
  },

  methods: {
    ...mapActions({
      doGetRegionDataByRangeInterval:
        'regionEnergy/doGetRegionDataByRangeInterval',
      doUpdateDatasetByGroup: 'regionEnergy/doUpdateDatasetByGroup',
      doUpdateDatasetByFilterPeriod:
        'regionEnergy/doUpdateDatasetByFilterPeriod',
      doUpdateEmissionIntensityDataset:
        'energy/emissions/doUpdateEmissionIntensityDataset',
      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats',
      doUpdateXTicks: 'visInteract/doUpdateXTicks'
    }),

    ...mapMutations({
      setFocusDate: 'visInteract/focusDate'
    }),

    setupSummaryLegendStates() {
      const exportTable = lsGet('exportTable')
      const percentDisplay = lsGet('percentDisplay')
      const isSummary = exportTable === 'summary'
      this.summary = isSummary
      this.legend = !isSummary
      this.percentDisplay = percentDisplay
    },

    updateEmissionsData() {
      this.doUpdateEmissionIntensityDataset({
        datasetAll: this.currentDataset,
        isCalculateByGeneration: this.calculateByGeneration,
        emissionsDomains: this.emissionsDomains,
        powerEnergyDomains: this.powerEnergyDomains,
        domainPowerEnergy: this.domainPowerEnergy,
        isEnergyType: this.isEnergyType,
        isWemOrAu: this.isWemOrAu,
        regionId: this.regionId,
        interval: this.interval
      })
    },

    handleTableToggle() {
      this.summary = !this.summary
      this.legend = !this.legend

      const exportTable = this.summary ? 'summary' : 'legend'
      lsSet('exportTable', exportTable)
    },

    handlePercentDisplayToggle() {
      this.percentDisplay = !this.percentDisplay
      lsSet('percentDisplay', this.percentDisplay)
    },

    handleExportClick() {
      this.exporting = true
      let date = ''
      let region = this.regions.find((r) => r.id === this.regionId).label
      if (this.filteredCurrentDataset.length > 0) {
        date = utcFormat('%Y%m%d')(this.filteredCurrentDataset[0].date)
      }
      if (this.regionId === 'nem') {
        region = 'Open Electricity'
      }
      domToImage
        .toBlob(document.getElementById('export-container'))
        .then((blob) => {
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

:deep(.vis-chart) {
  margin-right: 10px;
}
</style>
