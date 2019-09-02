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
              <small>GWh/{{ interval }}</small>
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
              <small>tCO2e</small>
            </div>
            <stacked-area-vis
              :domains="emissionStackedAreaDomains"
              :dataset="dataset"
              :dynamic-extent="dateFilter"
              :range="range"
              :interval="interval"
              :curve="'step'"
              :vis-height="200"
              :show-x-axis="false"
              :show-zoom-out="false"
              :y-min="0"
              :y-max="emissionsMax"
              :x-guides="xGuides"
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
              :dataset="dataset"
              :dynamic-extent="dateFilter"
              :range="range"
              :interval="interval"
              :show-x-axis="false"
              :vis-height="80"
              :y-min="0"
              :curve="'smooth'"
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
              :domain-id="'price.above300'"
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
              :domain-id="'price.below0'"
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
            :domains="summaryDomains"
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

import REGIONS from '~/constants/regions.js'
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

  data() {
    return {
      ready: false,
      dataset: [],
      energyDomains: [],
      fuelTechEnergyOrder: [],
      emissionsOrder: [],
      marketValueDomains: [],
      temperatureDomains: [],
      temperatureMeanId: '',
      temperatureMinId: '',
      temperatureMaxId: '',
      priceDomains: [],
      emissionDomains: [],
      responses: [],
      filteredDataset: [],
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
      energyMin: 0,
      energyMax: 1000
    }
  },

  computed: {
    featureEmissions() {
      return this.$store.getters.featureEmissions
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
    groupDomains() {
      const dict = this.fuelTechGroup
      const domains = this.energyDomains
      return Domain.parseDomains(domains, dict, 'energy')
    },
    groupMarketValueDomains() {
      const dict = this.fuelTechGroup
      const domains = this.marketValueDomains
      return Domain.parseDomains(domains, dict, 'market_value')
    },

    groupEmissionDomains() {
      const dict = this.fuelTechGroup
      const domains = this.emissionDomains
      return Domain.parseDomains(domains, dict, 'emissions')
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
    stackedAreaDomains() {
      const hidden = this.hiddenFuelTechs
      let domains =
        this.groupDomains.length > 0 ? this.groupDomains : this.energyDomains
      return this.fuelTechGroup
        ? domains.filter(d => !_includes(hidden, d.id))
        : domains.filter(d => !_includes(hidden, d.fuelTech))
    },
    summaryDomains() {
      return this.groupDomains.length > 0
        ? this.groupDomains
        : this.energyDomains
    },
    emissionStackedAreaDomains() {
      return this.groupEmissionDomains.length > 0
        ? this.groupEmissionDomains
        : this.emissionDomains
    },
    emissionsMax() {
      return d3Max(this.dataset, d => d._totalEmissionsVol)
    },
    xGuides() {
      let dStart = this.dataset[0].date
      const dEnd = this.dataset[this.dataset.length - 1].date

      if (this.interval === 'Day') {
        return DateDisplay.weekendGuides(dStart, dEnd, this.interval)
      }
      if (this.interval === '5m' || this.interval === '30m') {
        return DateDisplay.nightGuides(dStart, dEnd)
      }
      return []
    }
  },

  watch: {
    groupDomains(domains) {
      if (domains) {
        this.updateDatasetGroups(this.dataset, domains)
      }
    },
    groupMarketValueDomains(domains) {
      if (domains) {
        this.updateDatasetGroups(this.dataset, domains)
      }
    },
    groupEmissionDomains(domains) {
      if (domains) {
        this.updateDatasetGroups(this.dataset, domains)
      }
    },
    hiddenFuelTechs() {
      this.updateEnergyMinMax()
    }
  },

  mounted() {
    this.fetchData(this.regionId, this.range)
  },

  methods: {
    fetchData(region, range) {
      const urls = Data.getEnergyUrls(region, range)

      if (urls.length > 0) {
        Http(urls)
          .then(responses => {
            this.handleResponses(responses)
          })
          .catch(e => {
            console.error(e)
          })
      } else {
        console.warn('fetchData', 'No urls provided')
      }
    },

    handleResponses(responses) {
      // !!! Removing Vol weighted Price after requesting ALL data
      // - due to incorrect data
      if (this.range === 'ALL') {
        responses.forEach(r => {
          const findIndex = r.data.findIndex(
            d => d.type === 'volume_weighted_price'
          )
          if (findIndex) {
            r.data.splice(findIndex, 1)
          }
        })
      }

      this.responses = responses
      this.updateDomains(responses)
      EnergyDataTransform.mergeResponses(
        responses,
        this.energyDomains,
        this.marketValueDomains,
        this.temperatureDomains,
        this.priceDomains,
        this.emissionDomains,
        this.range,
        this.interval
      ).then(dataset => {
        this.dataset = dataset
        // this.dateFilter = d3Extent(this.dataset, d => d.date)
        if (this.groupDomains.length > 0) {
          this.updateDatasetGroups(dataset, this.groupDomains)
        }
        if (this.groupMarketValueDomains.length > 0) {
          this.updateDatasetGroups(dataset, this.groupMarketValueDomains)
        }
        if (this.groupEmissionDomains.length > 0) {
          this.updateDatasetGroups(dataset, this.groupEmissionDomains)
        }
        this.updatedFilteredDataset(dataset)
        this.updateEnergyMinMax()
        this.ready = true
      })
    },

    updateDatasetGroups(dataset, groupDomains) {
      this.dataset = dataset.map(d => {
        // create new group domains (if not already there)
        groupDomains.forEach(g => {
          let groupValue = 0
          g.domainIds.forEach(dId => {
            groupValue += d[dId]
          })
          d[g.id] = groupValue
        })
        return d
      })
    },

    updateDomains(res) {
      // Find out about available domains first before flattening data
      this.updateEnergyDomains(res)
      this.updateEmissionDomains(res)
      this.updateMarketValueDomains(res)
      this.updateTemperatureDomains(res)
      this.updatePriceDomains(res)
    },

    updateEnergyDomains(res) {
      const energyDomains = Domain.getEnergyDomains(res)
      this.fuelTechEnergyOrder = Domain.getDomainObjsOrder(
        energyDomains,
        this.fuelTechOrder
      )
      this.energyDomains = Domain.getDomainObjs(
        this.regionId,
        this.fuelTechEnergyOrder,
        this.type
      )
    },

    updateMarketValueDomains(res) {
      this.marketValueDomains = Domain.getDomainObjs(
        this.regionId,
        this.fuelTechEnergyOrder,
        'market_value'
      )
    },

    updateEmissionDomains(res) {
      const emissionDomains = Domain.getEmissionsDomains(res)
      this.emissionsOrder = Domain.getDomainObjsOrder(
        emissionDomains,
        this.fuelTechOrder
      )
      this.emissionDomains = Domain.getDomainObjs(
        this.regionId,
        this.emissionsOrder,
        'emissions'
      )
    },

    updateTemperatureDomains(res) {
      const temperatureDomainsAndIds = Domain.getTemperatureDomainsAndIds(res)

      this.temperatureDomains = temperatureDomainsAndIds.domains
      this.temperatureMeanId = temperatureDomainsAndIds.meanId
      this.temperatureMinId = temperatureDomainsAndIds.minId
      this.temperatureMaxId = temperatureDomainsAndIds.maxId
    },

    updatePriceDomains(res) {
      this.priceDomains = Domain.getPriceDomains(res)
    },

    updatedFilteredDataset(dataset) {
      // This is to filter the dataset based on the chart zoom
      // - used by Summary table
      if (this.dateFilter.length > 0) {
        this.filteredDataset = EnergyDataTransform.filterDataByStartEndDates(
          dataset,
          this.dateFilter[0],
          this.dateFilter[1]
        )
      } else {
        this.filteredDataset = dataset
      }
    },

    handleWidgetToggle(widgetName) {
      this[widgetName] = !this[widgetName]
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
    },

    updateEnergyMinMax() {
      let energyMinAll = 0,
        energyMaxAll = 0
      this.dataset.forEach((d, i) => {
        let energyMin = 0,
          energyMax = 0

        this.stackedAreaDomains.forEach(domain => {
          const id = domain.id
          energyMax += d[id] || 0
          if (d[id] < 0) {
            energyMin += d[id] || 0
          }
        })

        if (energyMax > energyMaxAll) {
          energyMaxAll = energyMax
        }
        if (energyMin < energyMinAll) {
          energyMinAll = energyMin
        }
      })
      this.energyMin = energyMinAll
      this.energyMax = energyMaxAll
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
::v-deep .price-neg-vis .y-axis-guide-group .tick text {
  display: none;
}
::v-deep .price-neg-vis .line-group path,
::v-deep .price-pos-vis .line-group path {
  stroke-dasharray: 1;
}
</style>
