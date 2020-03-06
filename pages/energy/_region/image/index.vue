<template>
  <section style="margin: 2rem;">
    <export-header
      :type="type"
      :charts="charts"
      :tables="tables"
      :feature-emissions="featureEmissions"
      :has-emissions="hasEmissionData"
      :has-price="hasPriceData"
      :has-temperature="hasTemperatureData"
      :chart-energy="chartEnergy"
      :chart-emissions-volume="chartEmissionsVolume"
      :chart-emissions-intensity="chartEmissionsIntensity"
      :chart-price="chartPrice"
      :chart-temperature="chartTemperature"
      :summary="summary"
      :legend="legend"
      @exportClick="handleExportClick"
      @exportCancel="handleCancelClick"
      @widgetToggle="handleWidgetToggle"
    />

    <div id="export-container">
      <div class="vis-legend-container">
        <export-image-header
          :exporting="exporting" />

        <div class="vis-container">
          <div
            v-if="ready && chartEnergy"
            class="chart">
            <div
              v-if="step"
              class="chart-title">
              <strong>Energy</strong>
              <small>GWh/{{ interval | intervalLabel }}</small>
            </div>
            <div
              v-else
              class="chart-title">
              <strong>Generation</strong>
              <small>MW</small>
            </div>
            <stacked-area-vis
              :domains="stackedAreaDomains"
              :dataset="dataset"
              :dynamic-extent="dateFilter"
              :range="range"
              :interval="interval"
              :curve="energyCurveType"
              :vis-height="stackedAreaHeight"
              :show-zoom-out="false"
              :brush="false"
              :x-guides="xGuides"
              :y-min="energyMin"
              :y-max="energyMax"
              class="vis-chart"
            />
          </div>

          <div
            v-if="ready && hasEmissionData && chartEmissionsVolume"
            class="chart">
            <div class="chart-title">
              <strong>Emissions Volume</strong>
              <small>{{ emissionsVolumeUnit }}</small>
            </div>
            <stacked-area-vis
              :domains="emissionStackedAreaDomains"
              :dataset="emissionsVolumeDataset"
              :dynamic-extent="dateFilter"
              :range="range"
              :interval="interval"
              :curve="'step'"
              :vis-height="200"
              :show-x-axis="false"
              :show-zoom-out="false"
              :x-guides="xGuides"
              :y-min="emissionsMin"
              :y-max="emissionsMax"
              :y-axis-ticks="5"
              class="emissions-volume-vis vis-chart"
            />
          </div>

          <div
            v-if="ready && hasEmissionData && chartEmissionsIntensity"
            class="chart">
            <div class="chart-title">
              <strong>Emissions Intensity</strong>
              <small>kgCO₂e/MWh</small>
            </div>
            <line-vis
              :domain-id="'_emissionsIntensity'"
              :domain-colour="lineColour"
              :dataset="emissionsIntensityDataset"
              :dynamic-extent="dateFilter"
              :range="range"
              :interval="interval"
              :show-x-axis="false"
              :vis-height="80"
              :y-max="emissionsIntensityMax"
              :y-min="emissionsIntensityMin"
              :curve="'step'"
              :connect-zero="true"
              :show-zoom-out="false"
              :x-guides="xGuides"
              class="emissions-intensity-vis vis-chart"
            />
          </div>

          <div
            v-if="ready && hasPriceData && chartPrice"
            class="chart">
            <div class="chart-title">
              <strong>Price</strong>
              <small>$/MWh</small>
            </div>
            <line-vis
              :domain-id="priceDomains[1].id"
              :domain-colour="lineColour"
              :value-domain-id="priceDomains[0].id"
              :dataset="dataset"
              :dynamic-extent="dateFilter"
              :range="range"
              :interval="interval"
              :show-tooltip="false"
              :curve="'step'"
              :show-y-axis="false"
              :y-axis-log="true"
              :y-min="300"
              :y-max="20000"
              :show-x-axis="false"
              :vis-height="30"
              :show-zoom-out="false"
              :x-guides="xGuides"
              :y-guides="[300, 2000, 6000, 10000, 14000]"
              class="price-pos-vis vis-chart"
            />
            <line-vis
              :domain-id="priceDomains[0].id"
              :domain-colour="lineColour"
              :dataset="dataset"
              :dynamic-extent="dateFilter"
              :range="range"
              :interval="interval"
              :show-tooltip="false"
              :curve="'step'"
              :show-y-axis="false"
              :y-axis-log="false"
              :y-min="0"
              :y-max="300"
              :show-x-axis="false"
              :vis-height="80"
              :show-zoom-out="false"
              :x-guides="xGuides"
              :y-guides="[0, 100, 200, 300]"
              class="price-vis vis-chart"
            />
            <line-vis
              :domain-id="priceDomains[2].id"
              :domain-colour="lineColour"
              :dataset="dataset"
              :dynamic-extent="dateFilter"
              :range="range"
              :interval="interval"
              :curve="'step'"
              :show-y-axis="false"
              :y-axis-log="true"
              :y-axis-invert="true"
              :y-min="-0.1"
              :y-max="-1000"
              :show-x-axis="false"
              :vis-height="30"
              :show-zoom-out="false"
              :x-guides="xGuides"
              :y-guides="[-50, -800]"
              class="price-neg-vis vis-chart"
            />
          </div>

          <div
            v-if="ready && hasTemperatureData && chartTemperature"
            class="chart">
            <div class="chart-title">
              <strong>Temperature</strong>
              <small>°C</small>
            </div>
            <line-vis
              :domain-id="temperatureMeanId"
              :min-domain-id="temperatureMinId"
              :max-domain-id="temperatureMaxId"
              :domain-colour="lineColour"
              :dataset="dataset"
              :dynamic-extent="dateFilter"
              :range="range"
              :interval="interval"
              :curve="'smooth'"
              :y-axis-log="false"
              :y-min="0"
              :show-x-axis="false"
              :vis-height="100"
              :show-zoom-out="false"
              :x-guides="xGuides"
              class="temperature-vis vis-chart"
            />
          </div>
        </div>

        <div class="legend-container">
          <summary-table
            v-if="ready && summary"
            :energy-domains="energyDomains"
            :domains="summaryDomains"
            :stacked-area-domains="stackedAreaDomains"
            :emissions-domains="emissionStackedAreaDomains"
            :temperature-domains="temperatureDomains"
            :price-id="priceDomains.length > 0 ? priceDomains[0].id : null"
            :market-value-domains="mvDomains"
            :dataset="filteredDataset"
            :range="range"
            :interval="interval"
            :is-energy="step"
            :domain-toggleable="false"
            :group-selection="false"
            :hidden-fuel-techs="hiddenFuelTechs"
            class="export-summary"
          />

          <energy-legend
            v-if="ready && legend"
            :domains="summaryDomains"
            :dataset="filteredDataset"
            :hidden-fuel-techs="hiddenFuelTechs"
          />
        </div>

        <export-image-footer
          :show-bom-source="chartTemperature"
          :exporting="exporting"/>
      </div>
    </div>
  </section>
</template>

<script>
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import { max as d3Max } from 'd3-array'
import _includes from 'lodash.includes'
import { saveAs } from 'file-saver'

import PageEnergyMixin from '~/mixins/page-energy.js'
import REGIONS from '~/constants/regions.js'
import { EMISSIONS } from '~/constants/emissions.js'
import Http from '~/services/Http.js'
import DateDisplay from '~/services/DateDisplay.js'
import Data from '~/services/Data.js'
import EnergyDataTransform from '~/services/dataTransform/Energy.js'
import Domain from '~/services/Domain.js'
import domToImage from '~/services/DomToImage.js'

import ExportHeader from '~/components/Energy/ExportHeader.vue'
import ExportImageHeader from '~/components/Energy/ExportImageHeader.vue'
import ExportImageFooter from '~/components/Energy/ExportImageFooter.vue'
import StackedAreaVis from '~/components/Vis/StackedArea.vue'
import LineVis from '~/components/Vis/Line.vue'
import SummaryTable from '~/components/SummaryTable'
import EnergyLegend from '~/components/Energy/Legend'

const charts = [
  {
    name: 'chartEnergy',
    label: 'Energy'
  },
  {
    name: 'chartEmissionsVolume',
    label: 'Emissions Volume'
  },
  {
    name: 'chartEmissionsIntensity',
    label: 'Emissions Intensity'
  },
  {
    name: 'chartPrice',
    label: 'Price'
  },
  {
    name: 'chartTemperature',
    label: 'Temperature'
  }
]
const tables = [
  {
    name: 'legend',
    label: 'Legend'
  },
  {
    name: 'summary',
    label: 'Summary'
  }
]

export default {
  layout: 'export',

  components: {
    ExportHeader,
    ExportImageHeader,
    ExportImageFooter,
    StackedAreaVis,
    LineVis,
    SummaryTable,
    EnergyLegend
  },

  mixins: [PageEnergyMixin],

  data() {
    return {
      ready: false,
      lineColour: '#e34a33',
      windowWidth: 0,
      stackedAreaHeight: 280,
      charts,
      tables,
      chartEnergy: true,
      chartEmissionsVolume: false,
      chartEmissionsIntensity: false,
      chartPrice: false,
      chartTemperature: false,
      summary: false,
      legend: true,
      exporting: false,
      energyDomains: [],
      energyMin: 0,
      energyMax: 1000,
      emissionsVolumeDataset: [],
      emissionsMin: 0,
      emissionsMax: 1000,
      emissionsIntensityDataset: [],
      emissionsIntensityMin: 0,
      emissionsIntensityMax: 1000
    }
  },

  computed: {
    featureEmissions() {
      return this.$store.getters.featureEmissions
    },

    exportChartEnergy() {
      return this.$store.getters['export/chartEnergy']
    },
    exportChartEmissionsVolume() {
      return this.$store.getters['export/chartEmissionsVolume']
    },
    exportChartEmissionsIntensity() {
      return this.$store.getters['export/chartEmissionsIntensity']
    },
    exportChartPrice() {
      return this.$store.getters['export/chartPrice']
    },
    exportChartTemperature() {
      return this.$store.getters['export/chartTemperature']
    },
    exportSummary() {
      return this.$store.getters['export/summary']
    },
    exportLegend() {
      return this.$store.getters['export/legend']
    },
    filteredDataset() {
      return this.$store.getters['exportData']
    },
    dataset() {
      return this.$store.getters['export/dataset']
    },
    stackedAreaDomains() {
      return this.$store.getters['export/stackedAreaDomains']
    },
    summaryDomains() {
      return this.$store.getters['export/summaryDomains']
    },
    xGuides() {
      return this.$store.getters['export/xGuides']
    },
    emissionDomains() {
      return this.$store.getters['export/emissionDomains']
    },
    priceDomains() {
      return this.$store.getters['export/priceDomains']
    },
    marketValueDomains() {
      return this.$store.getters['export/marketValueDomains']
    },
    temperatureDomains() {
      return this.$store.getters['export/temperatureDomains']
    },
    temperatureMeanId() {
      return this.$store.getters['export/temperatureMeanId']
    },
    temperatureMinId() {
      return this.$store.getters['export/temperatureMinId']
    },
    temperatureMaxId() {
      return this.$store.getters['export/temperatureMaxId']
    },

    hiddenFuelTechs() {
      return this.$store.getters.hiddenFuelTechs
    },
    type() {
      return this.$store.getters.energyChartType
    },
    regionId() {
      return this.$route.params.region
    },
    range() {
      return this.$route.query.range || '7D'
    },
    interval() {
      return this.$route.query.interval || '30m'
    },
    dateFilter() {
      const start = this.$route.query.start
      const end = this.$route.query.end
      if (start && end) {
        return [start, end]
      }
      return []
    },
    fuelTechOrder() {
      return this.$store.getters.fuelTechOrder
    },
    fuelTechGroup() {
      return this.$store.getters.fuelTechGroup
    },
    groupMarketValueDomains() {
      const dict = this.fuelTechGroup
      const domains = this.marketValueDomains
      return Domain.parseDomains(domains, dict, 'market_value')
    },

    groupEmissionDomains() {
      const dict = this.fuelTechGroup
      const domains = this.emissionDomains
      return Domain.parseDomains(domains, dict, EMISSIONS)
    },

    hasTemperatureData() {
      return this.temperatureDomains.length > 0
    },
    hasPriceData() {
      return this.priceDomains.length > 0
    },
    hasEmissionData() {
      return this.emissionDomains.length > 0
    },
    energyCurveType() {
      return this.$store.getters.energyCurveType
    },
    step() {
      return this.$store.getters.step
    },
    mvDomains() {
      return this.groupMarketValueDomains.length > 0
        ? this.groupMarketValueDomains
        : this.marketValueDomains
    },
    emissionStackedAreaDomains() {
      return this.groupEmissionDomains.length > 0
        ? this.groupEmissionDomains
        : this.emissionDomains
    }
  },

  watch: {
    hiddenFuelTechs() {
      this.updateYMinMax()
    },
    filteredDataset() {
      this.updateYMinMax()
    }
  },

  mounted() {
    this.chartEnergy = this.exportChartEnergy
    this.chartEmissionsVolume = this.exportChartEmissionsVolume
    this.chartEmissionsIntensity = this.exportChartEmissionsIntensity
    this.chartPrice = this.exportChartPrice
    this.chartTemperature = this.exportChartTemperature
    this.summary = this.exportSummary
    this.legend = this.exportLegend
    this.updateYMinMax()
    this.ready = true
  },

  methods: {
    handleWidgetToggle(widgetName) {
      this[widgetName] = !this[widgetName]
      this.$store.dispatch(`export/${widgetName}`, this[widgetName])
    },

    handleExportClick() {
      this.exporting = true
      let date = ''
      let region = REGIONS.find(r => r.id === this.regionId).label
      if (this.dataset.length > 0) {
        date = d3TimeFormat('%Y%m%d')(this.dataset[0].date)
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
}
.vis-legend-container {
  .vis-container {
    width: 100%;
  }
  .legend-container {
    width: 100%;

    .export-summary {
      margin: 0.5rem;
    }
  }
  .chart {
    position: relative;

    .chart-title {
      font-size: 0.8em;
      padding: 0.2rem 1rem 0.2rem 1rem;
      user-select: none;
    }
  }
}
.vis-chart {
  margin-right: 10px;
}

// Chart style adjustments
.price-vis {
  position: relative;
  top: -7px;
}
.price-neg-vis {
  position: relative;
  top: -14px;
}
::v-deep .price-vis .y-axis-guide-group .domain,
::v-deep .temperature-vis .y-axis .domain {
  fill: rgba(255, 255, 255, 0.1);
}
::v-deep .temperature-vis .y-axis .tick:last-of-type text,
::v-deep .temperature-vis .y-axis-tick .tick:last-of-type text,
::v-deep .price-pos-vis .y-axis-guide-group .tick:not(:first-of-type) text,
::v-deep .price-neg-vis .y-axis-guide-group .tick text,
::v-deep .emissions-intensity-vis .y-axis-tick .tick:last-of-type text {
  display: none;
}
::v-deep .price-neg-vis .line-group path,
::v-deep .price-pos-vis .line-group path {
  stroke-dasharray: 1;
}
</style>
