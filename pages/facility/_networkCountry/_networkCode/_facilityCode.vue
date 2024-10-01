<template>
  <div class="facility-wrapper">
    <transition name="fade">
      <ReportIssue 
        v-if="showFields" 
        :name="facilityName" 
        :path="fullPath" />
    </transition>

    <section 
      :class="{ 'report-view': showFields }" 
      class="facility">
      <button
        v-if="!showFields"
        class="report-issue-btn button is-rounded"
        @click="handleReportIssueClick"
      >
        <i class="fal fa-fw fa-comment-alt-exclamation" />
        Report an Issue
      </button>

      <transition name="fade">
        <div
          v-if="!fetchingFacility && !facility"
          class="not-found-card card"
          style="height: 60vh; margin: 0 auto"
        >
          <i class="fal fa-industry-alt" />
          <div>
            <span v-if="selectedFacilityError">{{
              selectedFacilityErrorMessage
            }}</span>
            <span v-else>Facility not available</span>
            <button
              v-tooltip="'Try loading facility again'"
              class="button is-rounded try-again-button"
              @click="getFacility"
            >
              <i class="fal fa-redo" />
            </button>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <Loader
          v-if="fetchingFacility && !facility"
          class="facility-chart-loader"
        />
      </transition>

      <transition name="fade">
        <div 
          v-if="facility" 
          class="main">
          <header>
            <h2
              v-highlight="showFields"
              @click="() => handleFieldClick('Facility name', facilityName)"
            >
              {{ facilityName }}
            </h2>

            <div class="facility-details">
              <div
                v-highlight="showFields"
                class="facility-fuel-techs"
                @click="
                  () =>
                    handleFieldClick('Facility fuel tech', facilityFuelTechs)
                "
              >
                <div
                  v-for="(ft, index) in facilityFuelTechs"
                  :key="`ft-${index}`"
                  class="facility-fuel-tech"
                >
                  <span
                    :style="{
                      'background-color': ft.colour
                    }"
                    class="colour-square"
                  />
                  {{ ft.label }}
                </div>
              </div>

              <span
                v-highlight="showFields"
                v-if="facilityStatus"
                class="tag facility-status"
                @click="
                  () =>
                    handleFieldClick(
                      'Facility status and dates',
                      `${facilityStatus} ${facilityDates}`
                    )
                "
              >
                <strong>{{ getFacilityStatusLabel(facilityStatus) }}</strong>
                <em>{{ facilityDates }}</em>
              </span>
            </div>
          </header>

          <Summary
            v-if="hasDescription"
            :description="facilityDescription"
            :link-object="facilityWikiLink"
          />

          <transition name="fade">
            <PhotoMap
              v-if="facility && widthBreak"
              :facility-name="facilityName"
              :facility-photos="facilityPhotos"
              :facility-location="facilityLocation"
              :layout="'normal'"
            />
          </transition>

          <div style="position: relative; margin-bottom: 1rem">
            <DataOptionsBar
              :ranges="ranges"
              :intervals="intervals"
              :range="range"
              :interval="interval"
              :filter-period="filterPeriod"
              @rangeChange="handleRangeChange"
              @intervalChange="handleIntervalChange"
              @queryChange="handleQueryChange"
              @filterPeriodChange="handleFilterPeriodChange"
            />

            <!-- <Dropdown
          v-if="isEnergyType"
          :options="chartTypeOptions"
          class="dropdown chart-type-options"
          @change="handleChartDisplayChange"
        /> -->
          </div>

          <section class="facility-chart">
            <transition name="fade">
              <div
                v-if="!fetchingStats && stackedAreaDataset.length === 0"
                class="not-found-card card"
              >
                <i class="fal fa-chart-area" />
                <div>
                  <span v-if="selectedFacilityError">{{
                    selectedFacilityErrorMessage
                  }}</span>
                  <span v-else>Facility statistics data not available</span>
                  <button
                    v-tooltip="'Try loading facility statistics again'"
                    class="button is-rounded try-again-button"
                    @click="getFacilityStats"
                  >
                    <i class="fal fa-redo" />
                  </button>
                </div>
              </div>
            </transition>

            <transition name="fade">
              <Loader 
                v-if="fetchingStats" 
                class="facility-chart-loader" />
            </transition>

            <PowerEnergyChart
              v-if="!fetchingStats && powerEnergyChartDataset.length > 0"
              :power-energy-dataset="powerEnergyChartDataset"
              :domain-power-energy="powerEnergyDomains"
              :range="range"
              :interval="interval"
              :hover-on="isHovering"
              :hover-date="hoverDate"
              :zoom-extent="zoomExtent"
              :prop-name="'code'"
              :chart-height="250"
              :y-max="facilityRegisteredSourceCapacity"
              :y-min="-Math.abs(facilityRegisteredLoadCapacity)"
              :incomplete-intervals="incompleteIntervals"
              :is-energy-type="isEnergyType"
              :power-options="powerOptions"
              :energy-options="energyOptions"
              :filter-period="filterPeriod"
              @dateHover="handleDateHover"
              @isHovering="handleIsHovering"
              @zoomExtent="handleZoomExtent"
              @svgClick="handleSvgClick"
            />

            <EmissionsChart
              v-if="!fetchingStats && domainEmissions.length > 0"
              :emissions-dataset="selectedFacilityUnitsDataset"
              :domain-emissions="emissionsDomains"
              :range="range"
              :interval="interval"
              :hover-on="isHovering"
              :hover-date="hoverDate"
              :zoom-extent="zoomExtent"
              :prop-name="'code'"
              :show-x-axis="true"
              :average-emissions="averageEmissions"
              :vis-height="250"
              :incomplete-intervals="incompleteIntervals"
              :filter-period="filterPeriod"
              @dateHover="handleDateHover"
              @isHovering="handleIsHovering"
              @zoomExtent="handleZoomExtent"
              @svgClick="handleSvgClick"
            />

            <!-- <emission-intensity-chart
            v-if="!fetchingStats && domainEmissions.length > 0 && !isEnergyChartShown"
            :emission-intensity-dataset="emissionIntensityData"
            :range="range"
            :interval="interval"
            :hover-on="isHovering"
            :hover-date="hoverDate"
            :zoom-extent="zoomExtent"
            :average-emission-intensity="averageEmissionIntensity"
            @dateHover="handleDateHover"
            @isHovering="handleIsHovering"
            @zoomExtent="handleZoomExtent"
            @svgClick="handleSvgClick" /> -->

            <PriceChart
              v-if="!fetchingStats && domainMarketValue.length > 0"
              :price-dataset="selectedFacilityUnitsDataset"
              :domain-price="domainVolWeightedPrices"
              :range="range"
              :interval="interval"
              :hover-on="isHovering"
              :hover-date="hoverDate"
              :zoom-extent="zoomExtent"
              :average-value="averageVolWeightedPrice"
              :filter-period="filterPeriod"
              @dateHover="handleDateHover"
              @isHovering="handleIsHovering"
              @zoomExtent="handleZoomExtent"
              @svgClick="handleSvgClick"
            />

            <MarketValueChart
              v-if="!fetchingStats && domainMarketValue.length > 0"
              :market-value-dataset="selectedFacilityUnitsDataset"
              :domain-market-value="marketValueDomains"
              :range="range"
              :interval="interval"
              :hover-on="isHovering"
              :hover-date="hoverDate"
              :zoom-extent="zoomExtent"
              :prop-name="'code'"
              :filter-period="filterPeriod"
              @dateHover="handleDateHover"
              @isHovering="handleIsHovering"
              @zoomExtent="handleZoomExtent"
              @svgClick="handleSvgClick"
            />
          </section>

          <section class="facility-units">
            <UnitList
              :ready="!fetchingStats"
              :is-energy-type="isEnergyType"
              :power-energy-unit="` ${
                isEnergyType && !isYAxisAveragePower
                  ? chartEnergyCurrentUnit
                  : chartPowerCurrentUnit
              }`"
              :is-y-axis-average-power="isYAxisAveragePower"
              :units="unitsSummary"
              :hover-on="isHovering"
              :hover-date="hoverDate"
              :focus-on="isFocusing"
              :focus-date="focusDate"
              :dataset="datasetFilteredByZoomExtent"
              :average-power-dataset="averagePowerDataset"
              :hidden-codes="hiddenCodes"
              :range="range"
              :interval="interval"
              :has-market-value="domainMarketValue.length > 0"
              :convert-value="convertValue"
              :convert-market-value="convertMarketValue"
              :market-value-display-unit="marketValueDisplayPrefix"
              :has-emissions="facilityHasEmissions"
              class="unit-list"
              @codeHover="handleCodeHover"
              @codeClick="handleCodeClick"
              @codeShiftClick="handleCodeShiftClick"
            />
          </section>

          <!-- <EnergyBar
          :bar-width="400"
          :domains="powerEnergyDomains"
          :dataset="stackedAreaDatasetFilteredByZoomExtent"
          :hover-on="isHovering"
          :hover-date="hoverDate"
          :focus-on="isFocusing"
          :focus-date="focusDate"
          :highlight-domain="highlightDomain"
        /> -->

          <!-- :convert-value="convertValue" -->

          <!-- <FacilityProperties
          :facility="facility"
          class="facility-props" /> -->
        </div>
      </transition>

      <section 
        v-if="facility" 
        style="width: 30%; text-align: right">
        <PhotoMap
          v-if="facility && !widthBreak"
          :facility-name="facilityName"
          :facility-photos="facilityPhotos"
          :facility-location="facilityLocation"
        />

        <DonutVis
          v-if="!fetchingStats && powerEnergyDomains.length > 1"
          :unit="` ${
            isEnergyType && !isYAxisAveragePower
              ? chartEnergyCurrentUnit
              : chartPowerCurrentUnit
          }`"
          :domains="powerEnergyDomains"
          :dataset="stackedAreaDatasetFilteredByZoomExtent"
          :dynamic-extent="zoomExtent"
          :hover-on="isHovering"
          :hover-date="hoverDate"
          :focus-on="isFocusing"
          :focus-date="focusDate"
          :highlight-domain="highlightDomain"
          :convert-value="convertValue"
          :is-power-type="
            !isEnergyType || (isEnergyType && isYAxisAveragePower)
          "
          :is-touch-device="isTouchDevice"
          style="margin-top: 2rem; padding-top: 2rem"
        />
      </section>
    </section>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import _uniq from 'lodash.uniq'
import _includes from 'lodash.includes'
import _cloneDeep from 'lodash.clonedeep'

import isBefore from 'date-fns/isBefore'
import isAfter from 'date-fns/isAfter'
import addYears from 'date-fns/addYears'

import * as FT from '~/constants/energy-fuel-techs/group-detailed.js'
import * as SI from '@/constants/si'
import * as OPTIONS from '@/constants/chart-options.js'
import {
  FACILITY_RANGES,
  FACILITY_RANGE_INTERVALS,
  RANGE_ALL
} from '@/constants/ranges.js'
import { INTERVAL_MONTH } from '@/constants/interval-filters.js'
import {
  FACILITY_OPERATING,
  FACILITY_RETIRED,
  getFacilityStatusLabelById
} from '@/constants/facility-status.js'

import EnergyToAveragePower from '@/data/transform/energy-to-average-power.js'
import DateDisplay from '@/services/DateDisplay.js'
import GetIncompleteIntervals from '@/services/incompleteIntervals.js'

import DataOptionsBar from '@/components/Energy/DataOptionsBar.vue'
import PowerEnergyChart from '@/components/Charts/PowerEnergyChart'
import UnitList from '@/components/Facility/UnitList.vue'
import PhotoMap from '@/components/Facility/PhotoMap.vue'
import FacilityProperties from '@/components/Facility/Properties.vue'
import Summary from '@/components/Facility/Summary.vue'
import Loader from '@/components/ui/Loader'
import EmissionsChart from '@/components/Charts/EmissionsChart'
import MarketValueChart from '@/components/Charts/MarketValueChart'
import PriceChart from '@/components/Charts/PriceChart'
import EmissionIntensityChart from '@/components/Charts/EmissionIntensityChart'
import Dropdown from '@/components/ui/Dropdown'
import DonutVis from '~/components/Vis/Donut'
import EnergyBar from '~/components/Energy/Charts/EnergyBarChart'
import ReportIssue from '~/components/ui/ReportIssue'

const chartTypeOptions = [
  {
    label: 'Energy',
    value: 'energy'
  },
  {
    label: 'Emissions',
    value: 'emissions'
  }
]

const powerOptions = {
  type: [OPTIONS.CHART_HIDDEN, OPTIONS.CHART_STACKED],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: [OPTIONS.CHART_YAXIS_ABSOLUTE, OPTIONS.CHART_YAXIS_PERCENTAGE]
}
const energyOptions = {
  type: [
    OPTIONS.CHART_HIDDEN,
    OPTIONS.CHART_STACKED,
    OPTIONS.CHART_PROPORTION,
    OPTIONS.CHART_LINE
  ],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: [
    OPTIONS.CHART_YAXIS_ENERGY,
    OPTIONS.CHART_YAXIS_AVERAGE_POWER,
    OPTIONS.CHART_YAXIS_PERCENTAGE
  ]
}

export default {
  layout: 'facility',

  head() {
    return {
      title: ` Facility: ${this.facilityName}`,
      meta: [
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: `Open Electricity Facility: ${this.facilityName}`
        },
        {
          hid: 'twitter:image:src',
          name: 'twitter:image:src',
          content: this.cardFilename
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: `Open Electricity Facility: ${this.facilityName}`
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: this.cardFilename
        },
        {
          hid: 'og:image:width',
          property: 'og:image:width',
          content: '1447'
        },
        {
          hid: 'og:image:height',
          property: 'og:image:height',
          content: '932'
        }
      ]
    }
  },

  components: {
    DataOptionsBar,
    UnitList,
    PhotoMap,

    FacilityProperties,
    Summary,
    Loader,
    Dropdown,

    PowerEnergyChart,
    EmissionsChart,
    EmissionIntensityChart,
    MarketValueChart,
    PriceChart,
    DonutVis,
    EnergyBar,

    ReportIssue
  },

  data() {
    return {
      zoomExtent: [],
      isHovering: false,
      hoverDate: null,
      showChartType: chartTypeOptions[0].label,
      chartTypeOptions,
      hiddenCodes: [],
      powerOptions,
      energyOptions,
      ranges: FACILITY_RANGES,
      intervals: FACILITY_RANGE_INTERVALS,
      baseUrl: `${this.$config.url}/images/screens/`,
      useDev: this.$config.useDev
    }
  },

  computed: {
    ...mapGetters({
      widthBreak: 'app/widthBreak',
      isTouchDevice: 'app/isTouchDevice',

      fetchingFacility: 'facility/fetchingFacility',
      fetchingStats: 'facility/fetchingStats',
      facility: 'facility/selectedFacility',
      selectedFacilityUnitsDataset: 'facility/selectedFacilityUnitsDataset',
      dataType: 'facility/dataType',
      range: 'facility/range',
      interval: 'facility/interval',
      filterPeriod: 'facility/filterPeriod',
      domainPowerEnergy: 'facility/domainPowerEnergy',
      domainEmissions: 'facility/domainEmissions',
      domainMarketValue: 'facility/domainMarketValue',
      domainVolWeightedPrices: 'facility/domainVolWeightedPrices',
      selectedFacilityError: 'facility/selectedFacilityError',
      selectedFacilityErrorMessage: 'facility/selectedFacilityErrorMessage',
      facilityName: 'facility/facilityName',
      facilityLocation: 'facility/facilityLocation',
      facilityNetworkRegion: 'facility/facilityNetworkRegion',
      facilityDescription: 'facility/facilityDescription',
      facilityWikiLink: 'facility/facilityWikiLink',
      facilityFuelTechsColours: 'facility/facilityFuelTechsColours',
      unitsSummary: 'facility/unitsSummary',

      showFields: 'feedback/showFields',

      chartShown: 'chartOptionsPowerEnergy/chartShown',
      chartType: 'chartOptionsPowerEnergy/chartType',
      chartEnergyCurve: 'chartOptionsPowerEnergy/chartEnergyCurve',
      chartEnergyYAxis: 'chartOptionsPowerEnergy/chartEnergyYAxis',
      chartPowerCurve: 'chartOptionsPowerEnergy/chartPowerCurve',
      chartEnergyCurrentUnit: 'chartOptionsPowerEnergy/chartEnergyCurrentUnit',
      chartPowerCurrentUnit: 'chartOptionsPowerEnergy/chartPowerCurrentUnit',
      chartEnergyUnitPrefix: 'chartOptionsPowerEnergy/chartEnergyUnitPrefix',
      chartEnergyDisplayPrefix:
        'chartOptionsPowerEnergy/chartEnergyDisplayPrefix',
      chartEnergyCurrentUnit: 'chartOptionsPowerEnergy/chartEnergyCurrentUnit',
      chartPowerUnitPrefix: 'chartOptionsPowerEnergy/chartPowerUnitPrefix',
      chartPowerDisplayPrefix:
        'chartOptionsPowerEnergy/chartPowerDisplayPrefix',

      marketValueUnitPrefix: 'chartOptionsMarketValue/chartUnitPrefix',
      marketValueDisplayPrefix: 'chartOptionsMarketValue/chartDisplayPrefix',

      isFocusing: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      highlightDomain: 'visInteract/highlightDomain',

      averageEmissions: 'energy/emissions/averageEmissions'
    }),

    countryCode() {
      return this.$route.params.networkCountry
    },
    networkCode() {
      return this.$route.params.networkCode
    },
    queryRange() {
      return this.$route.query.range
    },
    fullPath() {
      return this.$route.fullPath
    },

    cardFilename() {
      return this.useDev
        ? `${this.baseUrl}opennem-facilities-dev.png`
        : `${this.baseUrl}opennem-facility-info.png`
    },

    isEnergyType() {
      return this.dataType === 'energy'
    },
    isEnergyChartShown() {
      return this.showChartType === chartTypeOptions[0].label
    },
    chartUnitPrefix() {
      return this.isEnergyType && !this.isYAxisAveragePower
        ? this.chartEnergyUnitPrefix
        : this.chartPowerUnitPrefix
    },
    chartDisplayPrefix() {
      return this.isEnergyType && !this.isYAxisAveragePower
        ? this.chartEnergyDisplayPrefix
        : this.chartPowerDisplayPrefix
    },
    facilityCode() {
      return this.$route.params.facilityCode
    },

    hasDescription() {
      return this.facilityDescription !== ''
    },

    facilityRegisteredSourceCapacity() {
      const domains = this.powerEnergyDomains.filter(d => !FT.isLoad(d.fuelTechLabel))
      return domains.length > 0
        ? domains.reduce(
            (acc, cur) => acc + (cur.registeredCapacity || 0),
            0
          )
        : 0
    },

    facilityRegisteredLoadCapacity() {
      const domains = this.powerEnergyDomains.filter(d => FT.isLoad(d.fuelTechLabel))
      return domains.length > 0
        ? domains.reduce(
            (acc, cur) => acc + (cur.registeredCapacity || 0),
            0
          )
        : 0
    },

    participant() {
      return this.facility ? this.facility.participant_id : ''
    },
    facilityPhotos() {
      return this.facility ? this.facility.photos : []
    },
    operatingDomains() {
      return this.unitsSummary.filter((d) => d.status === FACILITY_OPERATING)
    },
    powerEnergyDomains() {
      return this.unitsSummary
        .filter((d) => !_includes(this.hiddenCodes, d.code))
        .reverse()
    },

    facilityFuelTechs() {
      const fuelTechs = _uniq(
        this.unitsSummary.map((d) => d.fuelTechLabel)
      ).sort()

      const data = fuelTechs.map((ft) => {
        return {
          id: ft,
          colour: FT.DEFAULT_FUEL_TECH_COLOUR[ft],
          label: FT.FUEL_TECH_LABEL[ft]
        }
      })

      return data
    },

    facilityStatus() {
      const unitStatus = _uniq(this.unitsSummary.map((d) => d.status))
      if (_includes(unitStatus, FACILITY_OPERATING)) {
        // if at least one unit is operating, the facility is in operation
        return FACILITY_OPERATING
      } else if (_includes(unitStatus, FACILITY_RETIRED)) {
        return FACILITY_RETIRED
      }
      return null
    },

    isFacilityRetired() {
      return this.facilityStatus === FACILITY_RETIRED
    },

    isFacilityOperating() {
      return this.facilityStatus === FACILITY_OPERATING
    },

    facilityOperatingDataFirstSeen() {
      let date = null
      // earliest operating data first seen

      this.operatingDomains.forEach((d) => {
        if (!date) {
          date = d.dataFirstSeen
        } else if (isBefore(d.dataFirstSeen, date)) {
          date = d.dataFirstSeen
        }
      })

      return date
    },

    facilityDataLastSeen() {
      let date = null
      // most recent data last seen

      this.unitsSummary.forEach((d) => {
        if (!date) {
          date = d.dataLastSeen
        } else if (isAfter(d.dataLastSeen, date)) {
          date = d.dataLastSeen
        }
      })

      return date
    },

    facilityDates() {
      const formatLocalDate = (t) =>
        this.$options.filters.formatLocalDate(t, '%_d %b %Y')

      if (this.isFacilityOperating) {
        if (this.facilityOperatingDataFirstSeen) {
          return `since ${formatLocalDate(this.facilityOperatingDataFirstSeen)}`
        }
      } else if (this.isFacilityRetired) {
        return formatLocalDate(this.facilityDataLastSeen)
      } else if (this.facilityOperatingDataFirstSeen) {
        return `since ${formatLocalDate(this.facilityOperatingDataFirstSeen)}`
      }

      return ''
    },

    facilitySinceDate() {
      if (this.isFacilityOperating) {
        return this.facilityOperatingDataFirstSeen
      } else if (this.isFacilityRetired) {
        return this.facilityDataLastSeen
      }
      return null
    },

    emissionsDomains() {
      console.log(this.domainEmissions)
      return this.domainEmissions.filter(
        (d) => !_includes(this.hiddenCodes, d.code)
      )
    },
    marketValueDomains() {
      return this.domainMarketValue.filter(
        (d) => !_includes(this.hiddenCodes, d.code)
      )
    },

    datasetFilteredByZoomExtent() {
      if (this.zoomExtent.length === 2) {
        const start = this.zoomExtent[0]
        const end = this.zoomExtent[1]

        return this.selectedFacilityUnitsDataset.filter(
          (d) => d.date >= start && d.date < end
        )
      }
      return this.selectedFacilityUnitsDataset
    },

    stackedAreaDatasetFilteredByZoomExtent() {
      if (this.zoomExtent.length === 2) {
        const start = this.zoomExtent[0]
        const end = this.zoomExtent[1]

        return this.stackedAreaDataset.filter(
          (d) => d.date >= start && d.date < end
        )
      }
      return this.stackedAreaDataset
    },
    stackedAreaDataset() {
      if (this.isEnergyType) {
        if (this.isYAxisAveragePower) {
          return this.averagePowerDataset
        }
      }
      return this.selectedFacilityUnitsDataset
    },
    averagePowerDataset() {
      return EnergyToAveragePower({
        data: this.selectedFacilityUnitsDataset,
        domains: this.powerEnergyDomains,
        range: this.range,
        interval: this.interval,
        exponent: SI.MEGA
      })
    },
    emissionIntensityData() {
      const dataset = this.selectedFacilityUnitsDataset.map((d) => {
        const obj = {
          date: d.date,
          time: d.time,
          _isIncompleteBucket: d._isIncompleteBucket
        }
        let totalEmissions = 0,
          totalPowerEnergy = 0

        this.domainEmissions.forEach((domain) => {
          totalEmissions += d[domain.id] || 0
        })
        this.domainPowerEnergy.forEach((domain) => {
          totalPowerEnergy += d[domain.id] || 0
        })
        let ei = (totalEmissions / totalPowerEnergy) * 1000 // convert to kgCo2/MWh
        const isValidEI = Number.isFinite(ei)

        obj._totalEmissions = totalEmissions
        obj._totalPowerEnergy = totalPowerEnergy
        obj._emissionIntensity = isValidEI ? ei : null

        return obj
      })
      return dataset
    },

    averageEmissions() {
      const totalEmissions = this.selectedFacilityUnitsDataset.reduce(
        (prev, cur) => prev + cur._totalEmissions,
        0
      )

      return totalEmissions / this.selectedFacilityUnitsDataset.length
    },

    averageEmissionIntensity() {
      const totalEmissions = this.emissionIntensityData.reduce(
        (prev, cur) => prev + cur._totalEmissions,
        0
      )
      const totalPowerEnergy = this.emissionIntensityData.reduce(
        (prev, cur) => prev + cur._totalPowerEnergy,
        0
      )

      return (totalEmissions / totalPowerEnergy) * 1000
    },

    averageVolWeightedPrice() {
      const totalPowerEnergy = this.selectedFacilityUnitsDataset.reduce(
        (a, b) => a + b._total,
        0
      )
      const totalMarketValue = this.selectedFacilityUnitsDataset.reduce(
        (a, b) => a + b._totalMarketValue,
        0
      )

      return totalMarketValue / totalPowerEnergy
    },

    chartTitle() {
      if (this.isEnergyType) {
        if (this.isYAxisAveragePower) {
          return 'Average Power'
        }
      }
      return this.dataType
    },
    chartYAxis() {
      return this.chartEnergyYAxis
      // return this.isEnergyType ? this.chartEnergyYAxis : this.chartPowerYAxis
    },
    chartCurve() {
      return this.isEnergyType ? this.chartEnergyCurve : this.chartPowerCurve
    },
    isYAxisAveragePower() {
      return this.chartYAxis === OPTIONS.CHART_YAXIS_AVERAGE_POWER
    },
    displayUnit() {
      let unit = ''
      if (this.isEnergyType) {
        if (this.isYAxisAveragePower) {
          unit = this.chartPowerCurrentUnit
        } else {
          unit = `${this.chartEnergyCurrentUnit}/${this.getIntervalLabel(
            this.interval
          )}`
        }
      } else {
        unit = this.chartPowerCurrentUnit
      }

      // this.$emit('displayUnit', unit)
      return unit
    },

    incompleteIntervals() {
      return GetIncompleteIntervals({
        dataset: this.selectedFacilityUnitsDataset,
        range: this.range,
        interval: this.interval,
        filterPeriod: this.filterPeriod
      })
    },

    facilityHasEmissions() {
      let hasEmissionsFactor = false
      this.unitsSummary.forEach((d) => {
        if (!hasEmissionsFactor && d.hasEmissionsFactor) {
          hasEmissionsFactor = true
        }
      })

      return hasEmissionsFactor
    },

    powerEnergyChartDataset() {
      const ds = _cloneDeep(this.selectedFacilityUnitsDataset)

      this.unitsSummary.forEach(unit => {
        const ft = unit.fuelTechLabel

        if (FT.isLoad(ft)) {
          ds.forEach(d => {
            const id = unit.id
            const negValue = -d[id]
            d[id] = negValue
          })
        }
      })

      return ds
    }
  },

  watch: {
    facility(update) {
      if (update) {
        console.log('facility-watch')
        if (!this.queryRange && this.isFacilityRetired) {
          this.setRange(RANGE_ALL)
          this.setInterval(INTERVAL_MONTH)
        }
        this.getFacilityStats()
      }
    },
    selectedFacilityUnitsDataset(dataset) {
      if (dataset.length > 0) {
        this.doUpdateXGuides({
          interval: this.interval,
          start: dataset[0].time,
          end: dataset[dataset.length - 1].time
        })

        this.doUpdateXTicks({
          range: this.range,
          interval: this.interval,
          isZoomed: this.zoomExtent.length > 0,
          filterPeriod: this.filterPeriod
        })

        this.updateYGuides()
      }
      // clear dates
      this.setFocusDate(null)
    },

    chartEnergyYAxis() {
      this.updateYGuides()
    },

    facilityRegisteredSourceCapacity() {
      this.updateYGuides()
    },

    facilityRegisteredLoadCapacity() {
      this.updateYGuides()
    },

    range(curr) {
      this.doUpdateTickFormats({
        range: curr,
        interval: this.interval,
        filterPeriod: this.filterPeriod
      })
      this.getFacilityStats()
    },

    interval(val) {
      this.doUpdateTickFormats({
        range: this.range,
        interval: val,
        filterPeriod: this.filterPeriod
      })
      if (this.range === '30D') {
        this.getFacilityStats()
      } else {
        this.doUpdateDatasetByInterval(val)
      }
    },

    filterPeriod(period) {
      this.doUpdateDatasetByFilterPeriod({
        range: this.range,
        interval: this.interval,
        period
      })
    },

    isEnergyType(curr, prev) {
      if (curr !== prev) {
        if (!curr) {
          this.showChartType = chartTypeOptions[0].label
        }
      }
    },

    zoomExtent(dates) {
      this.doUpdateXTicks({
        range: this.range,
        interval: this.interval,
        isZoomed: dates.length > 0,
        filterPeriod: this.filterPeriod
      })
    }
  },

  created() {
    this.setAllowResize(false)
    this.getFacility()

    this.doUpdateTickFormats({
      range: this.range,
      interval: this.interval,
      filterPeriod: this.filterPeriod
    })
    this.doSetChartEnergyPrefixes(SI.MEGA)
    this.doHideEmissionsChart()
  },

  beforeDestroy() {
    this.doShowEmissionsChart()
  },

  methods: {
    ...mapMutations({
      setHighlightDomain: 'visInteract/highlightDomain',
      setFocusDate: 'visInteract/focusDate',
      setYGuides: 'visInteract/yGuides',
      setRange: 'facility/range',
      setInterval: 'facility/interval',
      setFilterPeriod: 'facility/filterPeriod',
      setShowFields: 'feedback/showFields',
      setQuery: 'app/query',
      setAllowResize: 'regionEnergy/allowResize'
    }),

    ...mapActions({
      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateXTicks: 'visInteract/doUpdateXTicks',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats',
      doGetFacilityByCode: 'facility/doGetFacilityByCode',
      doGetStationStats: 'facility/doGetStationStats',
      doUpdateDatasetByInterval: 'facility/doUpdateDatasetByInterval',
      doUpdateDatasetByFilterPeriod: 'facility/doUpdateDatasetByFilterPeriod',
      addField: 'feedback/addField',
      doSetChartEnergyPrefixes:
        'chartOptionsPowerEnergy/doSetChartEnergyPrefixes',
      doHideEmissionsChart: 'chartOptionsEmissionsVolume/doHideChart',
      doShowEmissionsChart: 'chartOptionsEmissionsVolume/doShowChart'
    }),

    handleFieldClick(key, value) {
      this.addField({ key, value })
    },

    convertValue(value) {
      return SI.convertValue(
        this.chartUnitPrefix,
        this.chartDisplayPrefix,
        value
      )
    },

    convertMarketValue(marketValue) {
      return SI.convertValue(
        this.marketValueUnitPrefix,
        this.marketValueDisplayPrefix,
        marketValue
      )
    },

    updateYGuides() {
      const sourceHidden = this.hiddenCodes.filter(c => this.unitsSummary.find(u => u.code === c && !FT.isLoad(u.fuelTechLabel)))
      const loadHidden = this.hiddenCodes.filter(c => this.unitsSummary.find(u => u.code === c && FT.isLoad(u.fuelTechLabel)))
      const regCapText = 'Registered Capacity'
      const sourcePartialText = sourceHidden.length > 0 ? ' (partial)' : ''
      const loadPartialText = loadHidden.length > 0 ? ' (partial)' : ''

      const yGuides = []

      if (this.dataType === 'power' || (this.dataType === 'energy' && this.isYAxisAveragePower)) {
        if (this.facilityRegisteredSourceCapacity && this.facilityRegisteredSourceCapacity > 0) {
          yGuides.push({
            value: this.facilityRegisteredSourceCapacity,
            text: `${regCapText}${sourcePartialText}`
          })
        }

        if (this.facilityRegisteredLoadCapacity && this.facilityRegisteredLoadCapacity > 0) {
          yGuides.push({
            value: -Math.abs(this.facilityRegisteredLoadCapacity),
            text: `${regCapText}${loadPartialText}`
          })
        }
      }

      this.setYGuides(yGuides)
    },

    getFacility() {
      this.doGetFacilityByCode({
        countryCode: this.countryCode,
        networkCode: this.networkCode,
        facilityCode: this.facilityCode
      })
    },

    getFacilityStats() {
      const networkRegion = this.facilityNetworkRegion
      const facilityCode = this.facilityCode
      const facilityFuelTechsColours = this.facilityFuelTechsColours
      this.doGetStationStats({
        networkRegion,
        facilityCode,
        facilityFuelTechsColours
      })
    },

    getFacilityStatusLabel(id) {
      return getFacilityStatusLabelById(id)
    },

    getIntervalLabel(interval) {
      if (interval === 'Fin Year') {
        return 'year'
      }
      return interval.toLowerCase()
    },

    handleZoomExtent(dateRange) {
      let filteredDates = []
      if (dateRange && dateRange.length > 0) {
        let startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        let endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )
        if (this.interval === 'Fin Year') {
          startTime = addYears(startTime, 2)
          endTime = addYears(endTime, 1)
        }

        filteredDates = [startTime, endTime]
      } else {
        filteredDates = []
      }

      this.zoomExtent = filteredDates
    },

    handleCodeHover(code) {
      this.setHighlightDomain(code)
    },
    handleCodeClick(code) {
      const index = this.hiddenCodes.indexOf(code)

      if (index === -1) {
        this.hiddenCodes.push(code)
      } else {
        this.hiddenCodes.splice(index, 1)
      }

      if (this.hiddenCodes.length === this.unitsSummary.length) {
        this.hiddenCodes = []
      }
    },
    handleCodeShiftClick(code) {
      const toBeHidden = this.unitsSummary.filter((d) => d.code !== code)
      const hiddenCodes = toBeHidden.map((d) => d.code)
      this.hiddenCodes = hiddenCodes
    },

    handleDateHover(date) {
      this.hoverDate = DateDisplay.getClosestDateByInterval(
        date,
        this.interval,
        this.filterPeriod
      )
    },
    handleIsHovering(hovering) {
      this.isHovering = hovering
    },
    handleRangeChange(range) {
      this.setRange(range)
    },
    handleIntervalChange(interval) {
      this.setInterval(interval)
    },
    handleFilterPeriodChange(period) {
      this.setFilterPeriod(period)
    },
    handleSvgClick() {
      if (
        this.focusDate &&
        this.focusDate.getTime() === this.hoverDate.getTime()
      ) {
        this.setFocusDate(null)
      } else {
        this.setFocusDate(this.hoverDate)
      }
    },
    handleQueryChange(query) {
      this.$router.push({
        query
      })

      this.setQuery(query)
    },

    handleChartDisplayChange(type) {
      this.showChartType = type
    },

    handleReportIssueClick() {
      this.setShowFields(!this.showFields)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

$radius: 0.5rem;

.facility {
  position: relative;
  transition: all 0.1s linear;

  &.report-view {
    transform-origin: top left;
    transform: scale(0.85);
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.55);
    border-radius: 10px;
  }

  @include tablet {
    margin: 1rem 1.5rem;
  }

  @include desktop {
    display: flex;
    margin: 1rem;
    .main {
      width: 70%;
      padding: 1rem 2rem 1rem 1rem;
    }
  }
}

header {
  margin-bottom: 1rem;
  padding: 0 $facility-tablet-padding;

  @include mobile {
    padding: 0 $facility-mobile-padding;
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
  }
  @include tablet {
    padding: 0;
  }

  h2 {
    font-family: $header-font-family;
    font-size: 1.8em;
    font-weight: 700;

    @include mobile {
      font-size: 1.6em;
    }
  }
}

:deep(h3) {
  font-family: $header-font-family;
  font-size: 1.4em;
  border-bottom: 1px solid #666;
}

.facility-chart {
  $chartHeight: 275px;
  width: 100%;
  min-height: $chartHeight;
  margin-bottom: 1rem;
  padding: 0 12px 0 11px;
  position: relative;

  @include tablet {
    padding: 0;
  }

  .not-found-card {
    height: $chartHeight;
  }
}

.facility-chart-loader {
  position: absolute;
  margin: 100px auto 0;
  left: 45%;
}

.facility-meta {
  margin: 0.5rem 0;
}

:deep(.not-found-card) {
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  box-shadow: none;
  color: #888;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  i {
    font-size: 1.3em;
    width: 100%;
    text-align: center;
  }
  span {
    font-size: 0.9em;
  }
}

:deep(.button-group) {
  padding-left: 0;
}

.facility-units {
  margin: 0.5rem;

  @include tablet {
    margin: 0;
  }
  @include mobile {
    margin: 1rem;
  }
}

.facility-props {
  margin-top: 3rem;
}

.chart-type-options {
  width: 150px;
  font-size: 12px;
  margin: 0.5rem 1rem;

  @media screen and (min-width: 1286px) {
    margin: 0;
    position: absolute;
    right: 0;
    top: 5px;
  }
}

.try-again-button {
  display: block;
  margin: 1rem auto 0;
  padding: 0;
  min-width: 36px;

  i {
    font-size: 1em;
    width: 20px;
  }
}

.facility-details {
  display: flex;
  margin-top: 1rem;
  justify-content: space-between;
}

.facility-fuel-techs {
  display: flex;

  .facility-fuel-tech {
    display: flex;
    align-items: center;
    padding: 0.1rem;
    margin-left: 1rem;

    &:first-child {
      margin-left: 0;
    }
  }
  .colour-square {
    display: inline-block;
    border: 1px solid transparent;
    width: 15px;
    height: 15px;
    margin-right: 0.5rem;
  }
}

.facility-status {
  strong {
    margin-right: 4px;
  }
  em {
    font-style: normal;
  }
}

.report-issue-btn {
  font-size: 12px;
  position: absolute;
  right: 0;

  i.fal {
    font-size: 14px;
    margin-right: 5px;
    position: relative;
    top: 1px;
  }
}
</style>
