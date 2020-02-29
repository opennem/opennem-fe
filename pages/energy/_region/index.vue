<template>
  <section class="region-section">
    <data-options-bar
      :range="range"
      :interval="interval"
      @onRangeChange="handleRangeChange"
      @onIntervalChange="handleIntervalChange"
    />

    <transition name="fade">
      <div
        v-if="!ready"
        class="vis-table-container loading-containers">
        <div class="vis-container">
          <div
            class="loader-block"
            style="height: 30px" />
          <div
            class="loader-block"
            style="height: 400px" />
        </div>
        <div class="table-container">
          <div
            class="loader-block"
            style="height: 30px" />
          <div
            class="loader-block"
            style="height: 400px" />
        </div>
      </div>
    </transition>

    <div class="vis-table-container">
      <div class="vis-container">
        <div
          v-if="ready"
          :class="{
            'is-hovered': hoverOn || focusOn,
            'has-border-bottom': !chartEnergy
          }"
          class="chart">
          <div
            v-if="step"
            class="chart-title"
            @click="toggleChart('chartEnergy')">
            <div class="chart-label">
              <i
                :class="{
                  'fa-caret-down': chartEnergy,
                  'fa-caret-right': !chartEnergy
                }"
                class="fal fa-fw" />
              <strong>Energy</strong>
              <small>{{ isYearInterval ? 'TWh' : 'GWh' }}/{{ interval | intervalLabel }}</small>
            </div>
            <div
              v-show="chartEnergy"
              class="hover-date-value">
              <div class="average-value">
                Av.
                <strong>{{ averageEnergy | formatValue }} {{ isYearInterval ? 'TWh' : 'GWh' }}/{{ interval | intervalLabel }}</strong>
              </div>
              <div class="hover-date">
                <time>
                  {{ hoverDisplayDate }}
                </time>
              </div>
              <div class="hover-values">
                <span
                  v-if="hoverValue"
                  class="ft-value">
                  <em
                    :style="{ 'background-color': hoverDomainColour }"
                    class="colour-square" />
                  {{ hoverDomainLabel }}
                  <strong>{{ hoverValue | formatValue }} {{ isYearInterval ? 'TWh' : 'GWh' }}</strong>
                </span>
                <span class="total-value">
                  Total
                  <strong>{{ hoverTotal | formatValue }} {{ isYearInterval ? 'TWh' : 'GWh' }}</strong>
                </span>
              </div>
            </div>
          </div>
          <div
            v-else
            class="chart-title"
            @click="toggleChart('chartEnergy')">
            <div class="chart-label">
              <i
                :class="{
                  'fa-caret-down': chartEnergy,
                  'fa-caret-right': !chartEnergy
                }"
                class="fal fa-fw" />
              <strong>Generation</strong>
              <small>MW</small>
            </div>
            <div
              v-show="chartEnergy"
              class="hover-date-value">
              <div class="average-value">
                Av.
                <strong>{{ averageEnergy | formatValue }} MW</strong>
              </div>
              <div class="hover-date">
                <time>
                  {{ hoverDisplayDate }}
                </time>
              </div>
              <div class="hover-values">
                <span
                  v-if="hoverValue"
                  class="ft-value">
                  <em
                    :style="{ 'background-color': hoverDomainColour }"
                    class="colour-square" />
                  {{ hoverDomainLabel }}
                  <strong>{{ hoverValue | formatValue }} MW</strong>
                </span>
                <span class="total-value">
                  Total
                  <strong>{{ hoverTotal | formatValue }} MW</strong>
                </span>
              </div>
            </div>
          </div>
          <stacked-area-vis
            v-if="chartEnergy"
            :domains="stackedAreaDomains"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :focus-date="focusDate"
            :focus-on="focusOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :curve="energyCurveType"
            :y-min="energyMin"
            :y-max="energyMax"
            :vis-height="stackedAreaHeight"
            :zoomed="zoomed"
            :x-guides="xGuides"
            :x-axis-dy="xAxisDy"
            :mobile-screen="tabletBreak"
            :incomplete-intervals="incompleteIntervals"
            :compare-dates="compareDates"
            class="vis-chart"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
            @domainOver="handleDomainOver"
            @svgClick="handleSvgClick"
          />
        </div>

        <div
          v-if="compareDifference && ready"
          class="chart">
          <div
            class="chart-title no-hover"
            style="justify-content: center;">
            <div class="chart-label">
              <strong>{{ firstDate | customFormatDate({ range, interval, showIntervalRange: true }) }}</strong>
              vs
              <strong>{{ secondDate | customFormatDate({ range, interval, showIntervalRange: true }) }}</strong>
            </div>
          </div>
          <energy-compare
            :domains="stackedAreaDomains"
            :compare-data="compareData"
          />
        </div>

        <div
          v-if="ready && hasEmissionData && featureEmissions"
          :class="{
            'is-hovered': hoverOn || focusOn,
            'has-border-bottom': !chartEmissionsVolume
          }"
          class="chart">
          <div
            class="chart-title"
            @click="toggleChart('chartEmissionsVolume')">
            <div class="chart-label">
              <i
                :class="{
                  'fa-caret-down': chartEmissionsVolume,
                  'fa-caret-right': !chartEmissionsVolume
                }"
                class="fal fa-fw" />
              <strong>Emissions Volume</strong>
              <small>{{ emissionsVolumeUnit }}/{{ interval | intervalLabel }}</small>
            </div>
            <div
              v-show="chartEmissionsVolume"
              class="hover-date-value">
              <div class="average-value">
                Av.
                <strong>
                  {{ averageEmissionsVolume | formatValue }}
                  {{ emissionsVolumeUnit }}/{{ interval | intervalLabel }}
                </strong>
              </div>
              <div class="hover-date">
                <time>
                  {{ hoverDisplayDate }}
                </time>
              </div>
              <div class="hover-values">
                <span
                  v-if="hoverEmissionVolumeValue"
                  class="ft-value">
                  <em
                    :style="{ 'background-color': hoverEmissionVolumeDomainColour }"
                    class="colour-square" />
                  {{ hoverEmissionVolumeDomainLabel }}
                  <strong>{{ hoverEmissionVolumeValue | formatValue2 }} {{ emissionsVolumeUnit }}</strong>
                </span>
                <span>
                  Total
                  <strong>{{ hoverEmissionVolumeTotal | formatValue2 }} {{ emissionsVolumeUnit }}</strong>
                </span>
              </div>
            </div>
          </div>
          <stacked-area-vis
            v-if="chartEmissionsVolume"
            :domains="emissionStackedAreaDomains"
            :dataset="emissionsVolumeDataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :focus-date="focusDate"
            :focus-on="focusOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :curve="'step'"
            :vis-height="200"
            :show-x-axis="false"
            :show-tooltip="false"
            :show-zoom-out="false"
            :y-min="emissionsMin"
            :y-max="emissionsMax"
            :zoomed="zoomed"
            :x-guides="xGuides"
            :incomplete-intervals="incompleteIntervals"
            class="emissions-volume-vis vis-chart"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
            @domainOver="handleEmissionsDomainOver"
            @svgClick="handleSvgClick"
          />
        </div>

        <div
          v-if="ready && hasEmissionData && featureEmissions"
          :class="{
            'is-hovered': hoverOn || focusOn,
            'has-border-bottom': !chartEmissionsIntensity
          }"
          class="chart">
          <div
            class="chart-title"
            @click="toggleChart('chartEmissionsIntensity')">
            <div class="chart-label">
              <i
                :class="{
                  'fa-caret-down': chartEmissionsIntensity,
                  'fa-caret-right': !chartEmissionsIntensity
                }"
                class="fal fa-fw" />
              <strong>Emissions Intensity</strong>
              <small>kgCO₂e/MWh</small>
            </div>
            <div
              v-show="chartEmissionsIntensity"
              class="hover-date-value">
              <div class="average-value">
                Av.
                <strong>{{ averageEmissionsIntensity | formatValue }} kgCO₂e/MWh</strong>
              </div>
              <div class="hover-date">
                <time>
                  {{ hoverDisplayDate }}
                </time>
              </div>
              <div class="hover-values">
                <span>
                  <strong>{{ hoverEmissionsIntensity | formatValue2 }} kgCO₂e/MWh</strong>
                </span>
              </div>
            </div>
          </div>
          <line-vis
            v-if="chartEmissionsIntensity"
            :domain-id="'_emissionsIntensity'"
            :domain-colour="lineColour"
            :dataset="emissionsIntensityDataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :focus-date="focusDate"
            :focus-on="focusOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :show-x-axis="false"
            :show-tooltip="false"
            :vis-height="120"
            :y-max="emissionsIntensityMax"
            :y-min="emissionsIntensityMin"
            :curve="'step'"
            :connect-zero="true"
            :show-zoom-out="false"
            :zoomed="zoomed"
            :x-guides="xGuides"
            class="emissions-intensity-vis vis-chart"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
            @svgClick="handleSvgClick"
          />
        </div>

        <div
          v-if="ready && hasPriceData"
          :class="{
            'is-hovered': hoverOn || focusOn,
            'has-border-bottom': !chartPrice
          }"
          class="chart">
          <div
            class="chart-title"
            @click="toggleChart('chartPrice')">
            <div class="chart-label">
              <i
                :class="{
                  'fa-caret-down': chartPrice,
                  'fa-caret-right': !chartPrice
                }"
                class="fal fa-fw" />
              <strong>Price</strong>
              <small>$/MWh</small>
            </div>
            <div
              v-show="chartPrice"
              class="hover-date-value">
              <div class="average-value">
                Av.
                <strong>{{ totalAverageValue | formatCurrency }}</strong>
              </div>
              <div class="hover-date">
                <time>
                  {{ hoverDisplayDate }}
                </time>
              </div>
              <div class="hover-values">
                <span>
                  <strong>{{ hoverPrice | formatCurrency }}</strong>
                </span>
              </div>
            </div>
          </div>
          <line-vis
            v-if="chartPrice"
            :domain-id="priceDomains[1].id"
            :domain-colour="lineColour"
            :value-domain-id="priceDomains[0].id"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :focus-date="focusDate"
            :focus-on="focusOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :show-tooltip="false"
            :curve="'step'"
            :show-y-axis="false"
            :y-axis-log="true"
            :y-min="300"
            :y-max="20000"
            :show-x-axis="false"
            :vis-height="50"
            :show-zoom-out="false"
            :connect-zero="false"
            :x-guides="xGuides"
            :y-guides="[300, 2000, 6000, 10000, 14000]"
            class="price-pos-vis vis-chart"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
            @svgClick="handleSvgClick"
          />
          <line-vis
            v-if="chartPrice"
            :domain-id="priceDomains[0].id"
            :domain-colour="lineColour"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :focus-date="focusDate"
            :focus-on="focusOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :show-tooltip="false"
            :curve="'step'"
            :show-y-axis="false"
            :y-axis-log="false"
            :y-min="0"
            :y-max="300"
            :show-x-axis="false"
            :vis-height="80"
            :show-zoom-out="false"
            :connect-zero="false"
            :x-guides="xGuides"
            :y-guides="[0, 100, 200, 300]"
            class="price-vis vis-chart"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
            @svgClick="handleSvgClick"
          />
          <line-vis
            v-if="chartPrice"
            :domain-id="priceDomains[2].id"
            :domain-colour="lineColour"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :focus-date="focusDate"
            :focus-on="focusOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :curve="'step'"
            :show-y-axis="false"
            :y-axis-log="true"
            :y-axis-invert="true"
            :y-min="-0.1"
            :y-max="-1100"
            :show-x-axis="false"
            :show-tooltip="false"
            :vis-height="35"
            :show-zoom-out="false"
            :connect-zero="false"
            :x-guides="xGuides"
            :y-guides="[-60, -400]"
            class="price-neg-vis vis-chart"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
            @svgClick="handleSvgClick"
          />
        </div>

        <div
          v-if="ready && hasTemperatureData"
          :class="{
            'is-hovered': hoverOn || focusOn,
            'has-border-bottom': !chartTemperature,
            'adjustment': chartPrice
          }"
          class="temperature-chart chart">
          <div
            class="chart-title"
            @click="toggleChart('chartTemperature')">
            <div class="chart-label">
              <i
                :class="{
                  'fa-caret-down': chartTemperature,
                  'fa-caret-right': !chartTemperature
                }"
                class="fal fa-fw" />
              <strong>Temperature</strong>
              <small>°C</small>
            </div>

            <div
              v-show="chartTemperature"
              class="hover-date-value">
              <div class="average-value">
                Av.
                <strong>{{ averageTemperature | formatValue }}°C</strong>
              </div>
              <div class="hover-date">
                <time>
                  {{ hoverDisplayDate }}
                </time>
              </div>
              <div class="hover-values">
                <span
                  v-if="hoverMinTemperature"
                  class="min-temp-value">
                  Min
                  <strong>{{ hoverMinTemperature | formatValue }}°C</strong>
                </span>
                <span class="mean-temp-value">
                  Av
                  <strong>{{ hoverMeanTemperature | formatValue }}°C</strong>
                </span>
                <span
                  v-if="hoverMaxTemperature"
                  class="min-temp-value">
                  Max
                  <strong>{{ hoverMaxTemperature | formatValue }}°C</strong>
                </span>
              </div>
            </div>
          </div>
          <line-vis
            v-if="chartTemperature"
            :domain-id="temperatureMeanId"
            :min-domain-id="temperatureMinId"
            :max-domain-id="temperatureMaxId"
            :domain-colour="lineColour"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :focus-date="focusDate"
            :focus-on="focusOn"
            :range="range"
            :interval="interval"
            :mouse-loc="mouseLoc"
            :curve="'smooth'"
            :y-axis-log="false"
            :y-min="0"
            :show-x-axis="false"
            :show-tooltip="false"
            :show-point-on-hover="true"
            :vis-height="100"
            :show-zoom-out="false"
            :zoomed="zoomed"
            :x-guides="xGuides"
            class="temperature-vis vis-chart"
            @eventChange="handleEventChange"
            @dateOver="handleDateOver"
            @svgClick="handleSvgClick"
          />
        </div>
      </div>

      <div class="table-container">
        <summary-table
          v-if="ready"
          id="summary-table"
          :energy-domains="energyDomains"
          :domains="summaryDomains"
          :stacked-area-domains="stackedAreaDomains"
          :emissions-domains="emissionStackedAreaDomains"
          :temperature-domains="temperatureDomains"
          :price-id="priceDomains.length > 0 ? priceDomains[0].id : null"
          :market-value-domains="mvDomains"
          :dataset="filteredDataset"
          :hover-date="hoverDate"
          :hover-on="hoverOn"
          :focus-date="focusDate"
          :focus-on="focusOn"
          :range="range"
          :interval="interval"
          :is-energy="step"
          :hidden-fuel-techs="hiddenFuelTechs"
          @fuelTechsHidden="handleFuelTechsHidden"
          @summary-update="handleSummaryUpdated"
        />

        <section
          v-show="ready"
          class="bar-donut-wrapper">
          <header>
            <div class="buttons has-addons">
              <button
                :class="{ 'is-selected': !chartSummaryPie }"
                class="button is-rounded"
                @click="handleChartSummaryClick('bar')">
                <i class="fal fa-chart-bar" />
              </button>
              <button
                :class="{ 'is-selected': chartSummaryPie }"
                class="button is-rounded"
                @click="handleChartSummaryClick('pie')">
                <i class="fal fa-chart-pie" />
              </button>
            </div>
          </header>

          <energy-bar
            v-show="!chartSummaryPie"
            :bar-width="barWidth"
            :domains="donutDomains"
            :dataset="filteredDataset"
            :hover-data="hoverData"
            :hover-on="hoverOn"
            :focus-data="focusData"
            :focus-on="focusOn" />

          <donut-vis
            v-show="chartSummaryPie"
            :unit="chartUnit"
            :domains="donutDomains"
            :dataset="filteredDataset"
            :dynamic-extent="dateFilter"
            :hover-data="hoverData"
            :hover-on="hoverOn"
            :focus-data="focusData"
            :focus-on="focusOn" />
        </section>

        <energy-records
          v-if="ready"
          :domains="summaryDomains"
          :dataset="filteredDataset"
          :range="range"
          :interval="interval"
          :price-id="priceDomains.length > 0 ? priceDomains[0].id : null"
          :temperature-id="temperatureMeanId"
          @recordSelect="handleRecordSelect"
          @recordDeselect="handleRecordDeselect"
          @recordMouseEnter="handleRecordMouseEnter"
          @recordMouseLeave="handleRecordMouseLeave" />
      </div>
    </div>
  </section>
</template>

<script>
import moment from 'moment'
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import { mouse as d3Mouse } from 'd3-selection'
import { extent as d3Extent, max as d3Max } from 'd3-array'
import _debounce from 'lodash.debounce'
import _includes from 'lodash.includes'
import _cloneDeep from 'lodash.clonedeep'
import Draggable from 'vuedraggable'
import { saveAs } from 'file-saver'

import PageEnergyMixin from '~/mixins/page-energy.js'
import REGIONS from '~/constants/regions.js'
import { EMISSIONS } from '~/constants/emissions.js'
import EventBus from '~/plugins/eventBus.js'
import Http from '~/services/Http.js'
import DateDisplay from '~/services/DateDisplay.js'
import Data from '~/services/Data.js'
import EnergyDataTransform from '~/services/dataTransform/Energy.js'
import Domain from '~/services/Domain.js'

import Loader from '~/components/ui/Loader'
import DataOptionsBar from '~/components/ui/DataOptionsBar'
import StackedAreaVis from '~/components/Vis/StackedArea.vue'
import LineVis from '~/components/Vis/Line.vue'
import DonutVis from '~/components/Vis/Donut.vue'
import EnergyBar from '~/components/Energy/EnergyBar.vue'
import SummaryTable from '~/components/SummaryTable'
import VisTooltip from '~/components/ui/Tooltip'
import EnergyRecords from '~/components/Energy/Records.vue'
import EnergyCompare from '~/components/Energy/Compare.vue'

export default {
  layout: 'main',

  head() {
    return {
      title: this.pageTitle,
      meta: [
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: this.pageTitle
        },
        {
          hid: 'twitter:image:src',
          name: 'twitter:image:src',
          content: this.pageImage
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.pageTitle
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: this.pageImage
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: this.pageUrl
        }
      ]
    }
  },

  components: {
    Loader,
    Draggable,
    DataOptionsBar,
    StackedAreaVis,
    LineVis,
    DonutVis,
    EnergyBar,
    SummaryTable,
    VisTooltip,
    EnergyRecords,
    EnergyCompare
  },

  mixins: [PageEnergyMixin],

  data() {
    return {
      mounted: false,
      ready: false,
      originalDataset: [],
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
      hoverDate: null,
      hoverDomain: null,
      hoverEmissionVolumeDomain: null,
      focusDate: null,
      mouseLoc: null,
      tooltipLeft: 0,
      filteredDataset: [],
      visHeight: 0,
      hoverOn: false,
      lineColour: '#e34a33',
      windowWidth: 0,
      energyMin: 0,
      energyMax: 1000,
      emissionsVolumeDataset: [],
      emissionsMin: 0,
      emissionsMax: 1000,
      emissionsIntensityDataset: [],
      emissionsIntensityMin: 0,
      emissionsIntensityMax: 1000,
      isTouchDevice: false,
      compareData: [],
      summary: null
    }
  },

  computed: {
    hostEnv() {
      return this.$store.getters.hostEnv
    },
    chartUnit() {
      return this.$store.getters.chartUnit
    },
    featureEmissions() {
      return this.$store.getters.featureEmissions
    },
    dateFilter() {
      return this.$store.getters.dateFilter
    },
    filterPeriod() {
      return this.$store.getters.filterPeriod
    },
    zoomed() {
      return this.$store.getters.dateFilter.length !== 0
    },
    type() {
      return this.$store.getters.energyChartType
    },
    isEnergyType() {
      return this.type === 'energy'
    },
    chartEnergy() {
      return this.$store.getters.chartEnergy
    },
    chartEmissionsVolume() {
      return this.$store.getters.chartEmissionsVolume
    },
    chartEmissionsIntensity() {
      return this.$store.getters.chartEmissionsIntensity
    },
    chartPrice() {
      return this.$store.getters.chartPrice
    },
    chartTemperature() {
      return this.$store.getters.chartTemperature
    },
    chartSummaryPie() {
      return this.$store.getters.chartSummaryPie
    },
    compareDifference() {
      return this.$store.getters.compareDifference
    },
    focusOn() {
      return this.$store.getters.focusOn
    },
    compareDates() {
      return this.$store.getters.compareDates
    },
    responsiveBreakWidth() {
      return this.$store.getters.responsiveBreakWidth
    },
    tabletBreak() {
      return this.windowWidth < 769
    },
    widthBreak() {
      return this.windowWidth < 1024
    },
    barWidth() {
      return this.widthBreak ? 250 : 130
    },
    xAxisDy() {
      return this.tabletBreak ? 8 : 12
    },
    regionId() {
      return this.$route.params.region
    },
    pageTitle() {
      let title = 'An Open Platform for National Electricity Market Data'
      const region = REGIONS.find(d => d.id === this.regionId)
      if (region && this.regionId !== 'nem') {
        title = region.label
      }
      return `OpenNEM: ${title}`
    },
    pageUrl() {
      return `https://opennem.org.au/energy/${this.regionId}/`
    },
    pageImage() {
      const url = 'https://opennem.org.au/images/energy/'
      return `${url}${this.regionId}.png`
    },
    range() {
      return this.$store.getters.range
    },
    interval() {
      return this.$store.getters.interval
    },
    fuelTechOrder() {
      return this.$store.getters.fuelTechOrder
    },
    fuelTechGroup() {
      return this.$store.getters.fuelTechGroup
    },
    hiddenFuelTechs() {
      return this.$store.getters.hiddenFuelTechs
    },
    percentContributionTo() {
      return this.$store.getters.percentContributionTo
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
    stackedAreaDomains() {
      const hidden = this.hiddenFuelTechs
      let domains =
        this.groupDomains.length > 0 ? this.groupDomains : this.energyDomains
      return this.fuelTechGroup
        ? domains.filter(d => !_includes(hidden, d.id))
        : domains.filter(d => !_includes(hidden, d.fuelTech))
    },
    donutDomains() {
      const hidden = this.hiddenFuelTechs
      let domains =
        this.groupDomains.length > 0 ? this.groupDomains : this.energyDomains
      domains = this.fuelTechGroup
        ? domains.filter(d => !_includes(hidden, d.id))
        : domains.filter(d => !_includes(hidden, d.fuelTech))
      return domains.filter(d => d.category === 'source')
    },
    summaryDomains() {
      return this.groupDomains.length > 0
        ? this.groupDomains
        : this.energyDomains
    },
    emissionStackedAreaDomains() {
      const hidden = this.fuelTechGroup
        ? this.hiddenFuelTechs.map(d => {
            return d.substring(0, d.lastIndexOf('.'))
          })
        : this.hiddenFuelTechs
      let domains =
        this.groupEmissionDomains.length > 0
          ? this.groupEmissionDomains
          : this.emissionDomains
      return this.fuelTechGroup
        ? domains.filter(d => !_includes(hidden, d.group))
        : domains.filter(d => !_includes(hidden, d.fuelTech))
    },
    stackedAreaHeight() {
      let height = 330
      if (this.regionId === 'nem' && !this.widthBreak) {
        height = 528
      }
      return height
    },
    xGuides() {
      if (this.dataset.length <= 0) {
        return []
      }
      let dStart = this.dataset[0].date
      const dEnd = this.dataset[this.dataset.length - 1].date

      if (this.interval === 'Day') {
        return DateDisplay.weekendGuides(dStart, dEnd)
      }
      if (this.interval === '5m' || this.interval === '30m') {
        return DateDisplay.nightGuides(dStart, dEnd)
      }
      return []
    },

    incompleteIntervals() {
      function getStartMonth(month) {
        switch (month) {
          case 11:
          case 0:
          case 1:
            return 11

          case 2:
          case 3:
          case 4:
            return 2

          case 5:
          case 6:
          case 7:
            return 5

          case 8:
          case 9:
          case 10:
            return 8

          default:
        }
        return null
      }

      function getSeasonLabel(month) {
        switch (month) {
          case 2:
            return 'Autumn'
          case 5:
            return 'Winter'
          case 8:
            return 'Spring'
          case 11:
            return 'Summer'
        }
      }

      let dStart = this.dataset[0].date
      const dEnd = this.dataset[this.dataset.length - 1].date
      const actualStartDate = this.dataset[0]._actualStartDate
      const aSD = new Date(actualStartDate).setHours(0)
      const actualLastDate = this.dataset[0]._actualLastDate
      let aLD = new Date(actualLastDate).setHours(0)

      if (this.interval === 'Week') {
        const incompletes = []
        if (aSD > dStart) {
          incompletes.push({
            start: dStart,
            end: dStart + 604800000
          })
        }
        if (aLD < dEnd) {
          incompletes.push({
            start: dEnd - 604800000,
            end: dEnd
          })
        }
        return incompletes
      }

      if (this.range === '1Y' && this.interval === 'Month') {
        const incompletes = []
        if (aSD > dStart) {
          incompletes.push({
            start: dStart,
            end: dStart + 2629800000
          })
        }
        if (aLD < dEnd) {
          incompletes.push({
            start: dEnd - 2629800000,
            end: dEnd
          })
        }
        return incompletes
      }

      if (this.interval === 'Season' || this.interval === 'Quarter') {
        const incompletes = []
        const isFilter = !this.filterPeriod || this.filterPeriod !== 'All'
        if (!isFilter) {
          aLD = moment(aLD).add(1, 'month')
          if (aSD > dStart) {
            incompletes.push({
              start: dStart,
              end: dStart + 7889400000
            })
          }
          if (aLD.valueOf() < dEnd) {
            incompletes.push({
              start: dEnd - 7889400000,
              end: dEnd
            })
          }
        } else {
          aLD = moment(aLD).add(1, 'year')
          const actualStartMonth = getStartMonth(new Date(aSD).getMonth())
          const actualStartSeason = getSeasonLabel(actualStartMonth)

          const actualEndMonth = getStartMonth(new Date(aLD).getMonth())
          const actualEndSeason = getSeasonLabel(actualEndMonth)

          if (actualStartSeason === this.filterPeriod) {
            if (aSD > dStart) {
              incompletes.push({
                start: dStart,
                end: dStart + 31557600000
              })
            }
          }
          if (actualEndSeason === this.filterPeriod) {
            const newDEnd = moment(dEnd).add(3, 'month')
            if (aLD.valueOf() < newDEnd.valueOf()) {
              incompletes.push({
                start: dEnd - 31557600000,
                end: dEnd
              })
            }
          }
        }
        return incompletes
      }

      if (this.interval === 'Half Year') {
        const incompletes = []
        if (aSD > dStart) {
          incompletes.push({
            start: dStart,
            end: dStart + 15552000000
          })
        }
        if (aLD < dEnd) {
          incompletes.push({
            start: dEnd - 15552000000,
            end: dEnd
          })
        }
        return incompletes
      }

      if (this.interval === 'Fin Year' || this.interval === 'Year') {
        const incompletes = []
        if (aSD > dStart) {
          incompletes.push({
            start: dStart,
            end: dStart + 31557600000
          })
        }
        if (aLD < dEnd) {
          incompletes.push({
            start: dEnd - 31557600000,
            end: dEnd
          })
        }
        return incompletes
      }
      return []
    },

    hoverDisplayDate() {
      let date = this.focusDate
      if (this.hoverOn) {
        date = this.hoverDate
      }
      return DateDisplay.specialDateFormats(
        new Date(date).getTime(),
        this.range,
        this.interval,
        false,
        false,
        false,
        true
      )
    },
    hoverData() {
      const time = new Date(this.hoverDate).getTime()
      return this.dataset.find(d => d.date === time)
    },
    focusData() {
      const time = new Date(this.focusDate).getTime()
      return this.dataset.find(d => d.date === time)
    },
    hoverOrFocusData() {
      if (this.hoverOn) {
        return this.hoverData
      } else if (this.focusOn) {
        return this.focusData
      }
      return null
    },
    hoverDomainLabel() {
      const find = this.stackedAreaDomains.find(d => d.id === this.hoverDomain)
      return find ? find.label : '—'
    },
    hoverEmissionVolumeDomainLabel() {
      const find = this.emissionStackedAreaDomains.find(
        d => d.id === this.hoverEmissionVolumeDomain
      )
      return find ? find.label : '—'
    },
    hoverValue() {
      return this.hoverOrFocusData
        ? this.hoverOrFocusData[this.hoverDomain]
        : null
    },
    hoverDomainColour() {
      const find = this.stackedAreaDomains.find(d => d.id === this.hoverDomain)
      if (find) return find.colour
      return null
    },
    hoverEmissionVolumeDomainColour() {
      const find = this.emissionStackedAreaDomains.find(
        d => d.id === this.hoverEmissionVolumeDomain
      )
      if (find) return find.colour
      return null
    },
    hoverTotal() {
      let total = 0
      if (this.hoverOrFocusData) {
        this.stackedAreaDomains.forEach(d => {
          total += this.hoverOrFocusData[d.id]
        })
      }
      return total
    },
    hoverEmissionVolumeValue() {
      return this.hoverOrFocusData
        ? Data.siCalculationFromBase(
            this.emissionsVolumePrefix,
            this.hoverOrFocusData[this.hoverEmissionVolumeDomain]
          )
        : null
    },
    hoverEmissionVolumeTotal() {
      let total = 0
      const isGeneration = this.percentContributionTo === 'generation'
      if (this.hoverOrFocusData) {
        this.emissionStackedAreaDomains.forEach(domain => {
          const id = domain.id
          if (
            !isGeneration ||
            (isGeneration &&
              domain.fuelTech !== 'imports' &&
              domain.fuelTech !== 'exports')
          ) {
            total += this.hoverOrFocusData[id]
          }
        })
      }
      return Data.siCalculationFromBase(this.emissionsVolumePrefix, total)
    },
    hoverEmissionsIntensity() {
      if (this.hoverOrFocusData) {
        const hoverDate = this.hoverOrFocusData.date
        const hoverEmissionsIntensity = this.emissionsIntensityDataset.find(
          d => {
            return d.date === hoverDate
          }
        )
        return hoverEmissionsIntensity
          ? hoverEmissionsIntensity._emissionsIntensity
          : '—'
      }
      return 0
    },
    hoverPrice() {
      if (this.hoverOrFocusData && this.priceDomains.length > 0) {
        return this.hoverOrFocusData[this.priceDomains[0].id]
      }
      return 0
    },
    hoverMeanTemperature() {
      if (this.hoverOrFocusData && this.temperatureDomains.length > 0) {
        return this.hoverOrFocusData[this.temperatureMeanId]
      }
      return 0
    },
    hoverMinTemperature() {
      if (this.hoverOrFocusData && this.temperatureDomains.length > 0) {
        return this.hoverOrFocusData[this.temperatureMinId]
      }
      return 0
    },
    hoverMaxTemperature() {
      if (this.hoverOrFocusData && this.temperatureDomains.length > 0) {
        return this.hoverOrFocusData[this.temperatureMaxId]
      }
      return 0
    },

    isYearInterval() {
      return this.interval === 'Fin Year' || this.interval === 'Year'
    },

    hasCompareDates() {
      return this.updatedCompareDates.length === 2
    },
    firstDate() {
      return this.hasCompareDates ? this.updatedCompareDates[0] : null
    },
    secondDate() {
      return this.hasCompareDates ? this.updatedCompareDates[1] : null
    },
    updatedCompareDates() {
      let latter = this.compareDates[0]
      let former = this.compareDates[1]
      if (this.compareDates[1] > latter) {
        latter = this.compareDates[1]
        former = this.compareDates[0]
      }
      return [former, latter]
    },

    averageEnergy() {
      return this.summary ? this.summary._averageEnergy : 0
    },
    averageEmissionsVolume() {
      return this.summary ? this.summary._averageEmissionsVolume : 0
    },
    averageEmissionsIntensity() {
      return this.summary ? this.summary._averageEmissionsIntensity : 0
    },
    averageTemperature() {
      return this.summary ? this.summary._averageTemperature : 0
    },
    totalAverageValue() {
      return this.summary ? this.summary._totalAverageValue : 0
    }
  },

  watch: {
    groupDomains(domains) {
      if (domains) {
        this.originalDataset = this.updateDatasetGroups(
          this.originalDataset,
          domains
        )
        this.updateDataset(this.filterPeriod)
        if (this.compareDates.length === 2) {
          const firstData = this.getDataByDate(
            this.dataset,
            this.compareDates[0]
          )
          const secondData = this.getDataByDate(
            this.dataset,
            this.compareDates[1]
          )
          if (firstData && secondData) {
            this.compareData = [firstData, secondData]
          }
        }
      }
    },
    groupMarketValueDomains(domains) {
      if (domains) {
        this.originalDataset = this.updateDatasetGroups(
          this.originalDataset,
          domains
        )
        this.updateDataset(this.filterPeriod)
      }
    },
    groupEmissionDomains(domains) {
      if (domains) {
        this.originalDataset = this.updateDatasetGroups(
          this.originalDataset,
          domains
        )
        this.updateDataset(this.filterPeriod)
      }
    },
    filteredDataset(updated) {
      this.$store.dispatch('exportData', updated)
    },
    hiddenFuelTechs() {
      this.updateYMinMax()
    },
    percentContributionTo() {
      this.updateYMinMax()
    },
    filterPeriod(compare) {
      this.updateDataset(compare)
      this.updateYMinMax()
    },
    stackedAreaDomains(updated) {
      this.$store.dispatch('export/stackedAreaDomains', updated)
    },
    summaryDomains(updated) {
      this.$store.dispatch('export/summaryDomains', updated)
    },
    dataset(updated) {
      this.$store.dispatch('export/dataset', updated)
      this.updateCompare(updated)
    },
    xGuides(updated) {
      this.$store.dispatch('export/xGuides', updated)
    },
    emissionDomains(updated) {
      this.$store.dispatch('export/emissionDomains', updated)
    },
    priceDomains(updated) {
      this.$store.dispatch('export/priceDomains', updated)
    },
    marketValueDomains(updated) {
      this.$store.dispatch('export/marketValueDomains', updated)
    },
    temperatureDomains(updated) {
      this.$store.dispatch('export/temperatureDomains', updated)
    },
    temperatureMeanId(updated) {
      this.$store.dispatch('export/temperatureMeanId', updated)
    },
    temperatureMinId(updated) {
      this.$store.dispatch('export/temperatureMinId', updated)
    },
    temperatureMaxId(updated) {
      this.$store.dispatch('export/temperatureMaxId', updated)
    },
    compareDifference(updated) {
      if (updated) {
        const compareDates = this.compareDates.slice()
        compareDates.push(this.focusDate.valueOf())
        this.$store.dispatch('compareDates', compareDates)
        this.$store.dispatch('focusOn', false)
        this.focusDate = null
      } else {
        this.compareData = []
        this.$store.dispatch('compareDates', [])
      }
    }
  },

  created() {
    this.$store.dispatch('currentView', 'energy')
    EventBus.$on('dataset.filter', this.handleDatasetFilter)
    EventBus.$on('vis.mousemove', this.handleVisMouseMove)
    EventBus.$on('vis.mouseenter', this.handleVisEnter)
    EventBus.$on('vis.mouseleave', this.handleVisLeave)
  },

  mounted() {
    function is_touch_device() {
      var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ')
      var mq = function(query) {
        return window.matchMedia(query).matches
      }

      if (
        'ontouchstart' in window ||
        (window.DocumentTouch && document instanceof DocumentTouch)
      ) {
        return true
      }

      // include the 'heartz' as a way to have a non matching MQ to help terminate the join
      // https://git.io/vznFH
      var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join(
        ''
      )
      return mq(query)
    }

    this.isTouchDevice = is_touch_device()
    this.windowWidth = window.innerWidth
    this.visHeight = this.widthBreak ? 578 : 350
    this.$nextTick(() => {
      window.addEventListener(
        'resize',
        _debounce(() => {
          this.windowWidth = window.innerWidth
          this.visHeight = this.widthBreak ? 578 : 350
        }, 200)
      )
    })
    this.fetchData(this.regionId, this.range)
    this.mounted = true
  },

  beforeDestroy() {
    EventBus.$off('dataset.filter')
    EventBus.$off('vis.mousemove')
    EventBus.$off('vis.mouseenter')
    EventBus.$off('vis.mouseleave')
  },

  methods: {
    updateDataset(compare) {
      if (!compare || compare === 'All') {
        this.dataset = this.originalDataset
      } else {
        const month = DateDisplay.getPeriodMonth(this.interval, compare)
        const returnedData = this.originalDataset.filter(d => {
          const dMonth = new Date(d.date).getMonth()
          return dMonth === month
        })

        // need to add an extra data point to show the final step
        const currentLastPoint = returnedData[returnedData.length - 1]
        // only add if it's a valid last point
        if (currentLastPoint && currentLastPoint._total) {
          const finalData = _cloneDeep(currentLastPoint)
          Object.keys(finalData).forEach(key => {
            const hasTemperature = this.temperatureDomains.find(
              d => d.id === key
            )
            if (key === 'date') {
              finalData.date = moment(currentLastPoint.date)
                .add(1, 'year')
                .valueOf()
            } else if (hasTemperature) {
              finalData[key] = currentLastPoint[key]
            } else {
              finalData[key] = null
            }
          })
          returnedData.push(finalData)
        }

        this.dataset = returnedData
      }
      this.updatedFilteredDataset(this.dataset)
    },

    fetchData(region, range) {
      const urls = Data.getEnergyUrls(region, range, this.hostEnv)

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
          if (findIndex !== -1) {
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
        this.readyDataset(dataset)
      })
    },

    readyDataset(dataset) {
      let updated = dataset
      if (this.groupDomains.length > 0) {
        updated = this.updateDatasetGroups(updated, this.groupDomains)
      }
      if (this.groupMarketValueDomains.length > 0) {
        updated = this.updateDatasetGroups(
          updated,
          this.groupMarketValueDomains
        )
      }
      if (this.groupEmissionDomains.length > 0) {
        updated = this.updateDatasetGroups(updated, this.groupEmissionDomains)
      }

      this.dataset = updated
      this.originalDataset = updated

      this.updatedFilteredDataset(updated)
      this.updateYMinMax()
      this.updateDataset(this.filterPeriod)
      this.ready = true
    },

    updateDatasetGroups(dataset, groupDomains) {
      return dataset.map(d => {
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
      this.$store.dispatch('energyDomains', this.energyDomains)
    },

    updateMarketValueDomains(res) {
      this.marketValueDomains = Domain.getDomainObjs(
        this.regionId,
        this.fuelTechEnergyOrder,
        'market_value'
      )
      this.$store.dispatch('marketValueDomains', this.marketValueDomains)
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
        EMISSIONS
      )
      this.$store.dispatch('emissionDomains', this.emissionDomains)
    },

    updateTemperatureDomains(res) {
      const temperatureDomainsAndIds = Domain.getTemperatureDomainsAndIds(res)

      this.temperatureDomains = temperatureDomainsAndIds.domains
      this.temperatureMeanId = temperatureDomainsAndIds.meanId
      this.temperatureMinId = temperatureDomainsAndIds.minId
      this.temperatureMaxId = temperatureDomainsAndIds.maxId

      this.$store.dispatch('temperatureDomains', this.temperatureDomains)
    },

    updatePriceDomains(res) {
      this.priceDomains = this.isEnergyType
        ? Domain.getVolWeightedDomains()
        : Domain.getPriceDomains(res)
      this.$store.dispatch('priceDomains', this.priceDomains)
    },

    updatedFilteredDataset(dataset) {
      // This is to filter the dataset based on the chart zoom
      // - used by Summary table
      if (this.dateFilter.length > 0) {
        let startX = this.dateFilter[0]
        let endX = this.dateFilter[1]
        const isFilter = !this.filterPeriod || this.filterPeriod !== 'All'
        if (
          isFilter &&
          (this.interval === 'Season' || this.interval === 'Quarter')
        ) {
          const periodMonth = DateDisplay.getPeriodMonth(
            this.interval,
            this.filterPeriod
          )
          const startXMonth = startX.getMonth()
          const endXMonth = endX.getMonth()
          startX.setMonth(periodMonth)
          endX.setMonth(periodMonth)
        }

        this.filteredDataset = EnergyDataTransform.filterDataByStartEndDates(
          dataset,
          startX,
          endX
        )
      } else {
        this.filteredDataset = dataset
      }
    },

    updateCompare(dataset) {
      if (this.compareDates.length === 2) {
        this.compareData = []
        const firstData = this.getDataByDate(dataset, this.compareDates[0])
        const secondData = this.getDataByDate(dataset, this.compareDates[1])
        if (firstData && secondData) {
          setTimeout(() => {
            this.compareData = [firstData, secondData]
          }, 100)
        }
      }
    },

    handleRangeChange(range) {
      this.$store.dispatch('compareDifference', false)
      this.$store.dispatch('focusOn', false)
      this.ready = false
      let interval = ''
      switch (range) {
        case '1D':
          interval = '5m'
          break
        case '3D':
        case '7D':
          interval = '30m'
          break
        case '30D':
          interval = 'Day'
          break
        case '1Y':
          interval = 'Week'
          break
        case 'ALL':
          interval = 'Month'
          break
        default:
          console.log('nothing yet')
      }
      this.setDateFilter([])
      this.compareData = []
      this.$store.dispatch('compareDates', [])
      this.$store.dispatch('interval', interval)
      this.$store.dispatch('range', range)
      this.fetchData(this.regionId, range)
    },

    handleIntervalChange(interval) {
      this.$store.dispatch('focusOn', false)
      this.$store.dispatch('compareDifference', false)
      this.compareData = []
      this.$store.dispatch('compareDates', [])
      this.$store.dispatch('interval', interval)
      EnergyDataTransform.mergeResponses(
        this.responses,
        this.energyDomains,
        this.marketValueDomains,
        this.temperatureDomains,
        this.priceDomains,
        this.emissionDomains,
        this.range,
        interval
      ).then(dataset => {
        this.readyDataset(dataset)
      })
    },

    handleDatasetFilter(dateRange) {
      if (dateRange && dateRange.length > 0) {
        const startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        const endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )
        this.filteredDataset = EnergyDataTransform.filterDataByStartEndDates(
          this.dataset,
          startTime,
          endTime
        )
        this.setDateFilter([startTime, endTime])
      } else {
        this.setDateFilter([])
        this.filteredDataset = this.dataset
      }
    },

    handleEventChange(evt) {
      this.mouseLoc = d3Mouse(evt)
      this.tooltipLeft = this.mouseLoc[0]
    },

    handleDateOver(evt, date) {
      const isFilter = !this.filterPeriod || this.filterPeriod !== 'All'
      if (this.interval === 'Fin Year') {
        if (date.getMonth() >= 6) {
          date.setFullYear(date.getFullYear() + 1)
        }
      }
      if (
        isFilter &&
        (this.interval === 'Season' || this.interval === 'Quarter')
      ) {
        const periodMonth = DateDisplay.getPeriodMonth(
          this.interval,
          this.filterPeriod
        )
        const month = date.getMonth()

        if (this.interval === 'Season') {
          date = DateDisplay.mutateSeasonDate(date, month, this.filterPeriod)
        } else if (this.interval === 'Quarter') {
          date = DateDisplay.mutateQuarterDate(date, month, this.filterPeriod)
        }
        date.setMonth(periodMonth + 1)
      }
      const closestDate = DateDisplay.snapToClosestInterval(this.interval, date)
      EventBus.$emit('vis.mousemove', evt, this.dataset, closestDate)
    },

    handleDomainOver(domain) {
      this.hoverDomain = domain
    },

    handleEmissionsDomainOver(domain) {
      this.hoverEmissionVolumeDomain = domain
    },

    handleVisMouseMove(evt, dataset, date) {
      this.hoverDate = date
    },

    handleVisEnter() {
      this.hoverOn = true
    },

    handleVisLeave() {
      this.hoverOn = false
    },

    toggleChart(chartName) {
      this.$store.dispatch(chartName, !this[chartName])
    },

    handleFuelTechsHidden(hidden) {
      this.$store.dispatch('hiddenFuelTechs', hidden)
    },

    setDateFilter(dates) {
      this.$store.dispatch('dateFilter', dates)
    },

    handleChartSummaryClick(chartType) {
      if (chartType === 'pie') {
        this.$store.dispatch('chartSummaryPie', true)
      } else {
        this.$store.dispatch('chartSummaryPie', false)
      }
    },

    handleRecordMouseEnter(date) {
      this.hoverOn = true
      this.hoverDate = new Date(date)
    },

    handleRecordMouseLeave() {
      this.hoverOn = false
      this.hoverDate = null
    },

    handleRecordSelect(date) {
      this.$store.dispatch('focusOn', true)
      this.focusDate = new Date(date)
    },

    handleRecordDeselect() {
      this.$store.dispatch('focusOn', false)
    },

    getDataByDate(dataset, date) {
      return dataset.find(d => d.date === date)
    },

    handleSvgClick(metaKey) {
      if (metaKey && this.focusOn && !this.compareDifference) {
        this.$store.dispatch('compareDifference', true)
        this.$store.dispatch('focusOn', false)
        const hoverTime = this.hoverDate.valueOf()
        const focusTime = this.focusDate.valueOf()
        const firstData = this.getDataByDate(this.dataset, focusTime)
        const secondData = this.getDataByDate(this.dataset, hoverTime)
        setTimeout(() => {
          this.$store.dispatch('compareDates', [focusTime, hoverTime])
          this.compareData = [firstData, secondData].slice()
        }, 10)
      } else {
        this.$store.dispatch('focusOn', false)
        if (this.compareDifference) {
          const hoverTime = this.hoverDate.valueOf()
          let newCompare = false
          let compareDates = this.compareDates.slice()

          if (compareDates.length === 2) {
            const newCompareDates = compareDates.filter(d => d !== hoverTime)
            if (newCompareDates.length === 1) {
              compareDates = newCompareDates
              newCompare = true
            } else {
              compareDates.pop()
            }
          }
          if (compareDates.length < 2 && !newCompare) {
            const newCompareDates = compareDates.filter(d => d !== hoverTime)
            if (newCompareDates.length === 0) {
              compareDates = newCompareDates
            } else {
              compareDates.push(hoverTime)
            }
          }

          if (compareDates.length === 2) {
            const firstData = this.getDataByDate(this.dataset, compareDates[0])
            const secondData = this.getDataByDate(this.dataset, compareDates[1])
            this.compareData = [firstData, secondData]
          }

          if (compareDates.length === 0) {
            this.$store.dispatch('compareDifference', false)
          }
          this.$store.dispatch('compareDates', compareDates)
        } else if (!this.isTouchDevice) {
          if (
            this.focusDate &&
            this.focusDate.valueOf() === this.hoverDate.valueOf()
          ) {
            this.focusDate = null
            this.$store.dispatch('focusOn', false)
          } else {
            this.focusDate = this.hoverDate
            this.$store.dispatch('focusOn', true)
          }
        }
      }
    },

    handleSummaryUpdated(summary) {
      this.summary = summary
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.loading {
  position: absolute;
  z-index: 999;
}
.region-section {
  max-width: 1600px;
  margin: 1rem auto 0;
  position: relative;
}
.vis-chart {
  margin-right: 10px;
}
.vis-table-container {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  margin-top: 1rem;

  .vis-container {
    width: 100%;
    padding: 1rem 0 0;
    @include desktop {
      width: 65%;
      padding: 0;
    }
  }
  .table-container {
    width: 100%;
    padding: 0 1rem 1rem;

    @include desktop {
      width: 35%;
      padding: 0 1rem 0 0;
    }
  }
  .chart {
    position: relative;

    .chart-title {
      font-size: 11px;
      cursor: pointer;
      user-select: none;

      @include tablet {
        display: flex;
        justify-content: space-between;
        padding: 0.2rem 1rem 0.2rem 1rem;
        height: 25px;
      }

      &:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }

      .chart-label {
        padding: 2px 0.5rem;
      }

      .hover-date-value {
        display: flex;
      }

      .hover-date,
      .hover-values {
        position: absolute;
        left: -9999em;
        opacity: 0;
        background: rgba(255, 255, 255, 0.5);
        padding: 3px 12px;
        white-space: nowrap;
      }

      .average-value {
        position: static;
        left: -9999em;
        // background: rgba(255, 255, 255, 0.5);
        padding: 3px 12px;
        white-space: nowrap;
        @include tablet {
          width: auto;
          border-radius: 20px;
        }
      }

      .hover-date {
        font-weight: 600;
        background-color: rgba(199, 69, 35, 0.1);
        color: #444;
        // font-size: 10px;
        // padding-top: 3px;
        width: 30%;

        @include tablet {
          width: auto;
          border-radius: 20px 0 0 20px;
        }
      }

      .hover-values {
        display: flex;
        align-items: center;
        // font-size: 9px;
        width: 70%;

        span {
          flex-grow: 1;
        }

        .ft-value {
          margin-right: 1rem;
        }
        .mean-temp-value {
          margin: 0 1rem;
        }
        strong {
          // font-size: 11px;
        }

        @include desktop {
          width: auto;
          border-radius: 0 20px 20px 0;
        }
      }

      .colour-square {
        display: inline-block;
        border: 1px solid transparent;
        width: 11px;
        height: 11px;
        border-radius: 1px;
        position: relative;
        top: 1px;
      }

      &.no-hover {
        cursor: auto;
        &:hover {
          background-color: transparent;
        }
      }
    }

    &.is-hovered {
      .hover-date,
      .hover-values {
        display: inline-block;
        position: static;
        opacity: 1;
        transition: all 0.2s ease-in-out;
      }
      .average-value {
        position: absolute;
      }
    }
    &.has-border-bottom {
      border-bottom: 1px dashed #ccc;
    }
  }
}

.loading-containers {
  position: absolute;
  width: 100%;
  flex-wrap: wrap;

  @include desktop {
    flex-wrap: nowrap;
  }

  .loader-block {
    background-color: #ddd;
    border-radius: 20px;
    height: 400px;
    margin: 0.5rem;
    -webkit-animation: pulse 1.4s ease-in-out infinite alternate;
    animation: pulse 1.4s ease-in-out infinite alternate;
  }
  .vis-container {
    padding: 1rem 0 1rem 0.5rem;
    @include desktop {
      width: 70%;
    }
  }
  .table-container {
    padding: 1rem 0.5rem 1rem 0;
    @include desktop {
      width: 30%;
    }
  }
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
::v-deep .price-vis .focus-top-rect,
::v-deep .price-vis .focus-bottom-rect,
::v-deep .price-pos-vis .focus-bottom-rect,
::v-deep .price-neg-vis .focus-top-rect {
  opacity: 0 !important;
}
.temperature-chart.adjustment {
  margin-top: -7px;
}

.bar-donut-wrapper {
  margin-bottom: 1rem;
  header {
    margin: 1rem 0;
    .buttons {
      justify-content: center;
    }
    button {
      font-size: 11px;
      min-width: 30px;
    }
    i.fa-chart-bar {
      -moz-transform: scaleY(-1) rotate(90deg);
      -o-transform: scaleY(-1) rotate(90deg);
      -webkit-transform: scaleY(-1) rotate(90deg);
      transform: scaleY(-1) rotate(90deg);
    }
  }
}
</style>
