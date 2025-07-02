<template>
  <div class="summary-table">
    <export-legend
      v-if="displayAsLegend"
      :domains="legendDomains"
      :show-percent="showPercentInLegend"
    />

    <div v-else>
      
      <dates-display
        :is-hovering="hoverOn"
        :hovered-date="hoveredDate"
        :focus-on="focusOn"
        :focus-date="focusDate ? focusDate.getTime() : null"
        :start-date="startDate"
        :end-date="endDate"
        :range="range"
        :interval="interval"
        :timezone-string="isEnergyType ? '' : regionTimezoneString"
      />

      <div 
        class="chart-border" 
        style="padding: 6px;">
        <div class="summary-column-headers">
          <div 
            class="summary-row" 
            style="border-bottom: 0;">
            <div 
              class="summary-col-label" 
              style="padding-top: 3px">
              <group-selector v-if="groupSelection" />
            </div>

            <div 
              class="summary-col-external-link-icon" 
              style="width: 35px" />

            <div
              class="summary-col-energy cell-toggle"
              style="width: 40%"
              @click="handleUnitCellClicked"
            >
              <span v-if="isTypeChangeSinceLine">
                Change since <small>{{ displayUnit }}</small>
              </span>
              <span v-else>
                Capacity <small>{{ chartCurrentUnit }}</small>
              </span>
            </div>
            

            <!-- <div
              class="summary-col-contribution cell-toggle"
              @click="handlePercentContributionToClick"
            >
              Contribution <small>to {{ percentContributionTo }}</small>
            </div>
            <div class="summary-col-av-value">
              <column-selector />
            </div> -->
          </div>

          <div class="summary-row summary-heading-row">
            <div class="summary-col-label">Sources</div>
          </div>
        </div>

        <div style="margin-left: 8px; border-top: 1px solid #ddd">
          <items
            :group="'ft-sources'"
            :hidden-fuel-techs="hiddenSources"
            :original-order="sourcesOrder"
            :market-value-order="sourcesMarketValueOrder"
            :show-point-summary="hoverOn || focusOn"
            :point-summary="pointSummary"
            :summary="summary"
            :domain-toggleable="domainToggleable"
            :energy-domains="capacityDomains"
            :emissions-domains="emissionsDomains"
            :is-year-interval="isYearInterval"
            @update="handleSourcesOrderUpdate"
            @fuelTechsHidden="handleSourceFuelTechsHidden"
            @mouse-enter="handleMouseEnter"
            @mouse-leave="handleMouseLeave"
            @domain-click="handleDomainClick"
          />
        </div>

        <!-- <div 
          v-if="loadsOrder.length > 0" 
          class="summary-column-headers">
          <div class="summary-row summary-heading-row">
            <div class="summary-col-label">Loads</div>

            <div 
              class="summary-col-external-link-icon" 
              style="width: 35px" />

            <div 
              v-if="isEnergy" 
              class="summary-col-energy cell-value">
              <div v-if="isTypeChangeSinceLine">–</div>
              <div v-else>
                <span v-if="hoverOn || focusOn">
                  {{
                    pointSummaryLoads._total
                      | convertValue(chartUnitPrefix, chartDisplayPrefix)
                      | formatValue
                  }}
                </span>
                <span v-else>
                  {{
                    summaryLoads._totalEnergy
                      | convertValue(chartUnitPrefix, chartDisplayPrefix)
                      | formatValue
                  }}
                </span>
              </div>
            </div>
            <div 
              v-else 
              class="summary-col-energy cell-value">
              <span v-if="hoverOn || focusOn">
                {{
                  pointSummaryLoads._total
                    | convertValue(chartUnitPrefix, chartDisplayPrefix)
                    | formatValue
                }}
              </span>
              <span v-else>
                {{ summaryLoads._totalEnergy | formatValue }}
              </span>
            </div>

            <div class="summary-col-contribution cell-value" />
            <div class="summary-col-av-value cell-value" />
          </div>
        </div> -->

        <!-- <div style="margin-left: 8px; border-top: 1px solid #ddd">
          <items
            :group="'ft-loads'"
            :hidden-fuel-techs="hiddenLoads"
            :original-order="loadsOrder"
            :market-value-order="loadsMarketValueOrder"
            :show-point-summary="hoverOn || focusOn"
            :point-summary="pointSummaryLoads"
            :point-summary-total="pointSummary._totalEnergyForPercentageCalculation"
            :summary="summaryLoads"
            :summary-total="summary._totalEnergyForPercentageCalculation"
            :is-year-interval="isYearInterval"
            :energy-domains="energyDomains"
            :emissions-domains="emissionsDomains"
            @update="handleLoadsOrderUpdate"
            @fuelTechsHidden="handleLoadFuelTechsHidden"
            @mouse-enter="handleMouseEnter"
            @mouse-leave="handleMouseLeave"
          />
        </div> -->

        <div style="padding-left: 8px; padding-top: 8px; border-top: 1px solid #333; margin-top: 8px;">
          <div 
            class="summary-column-headers"
          >
            <div class="summary-row last-row">
              <div class="summary-col-label">
                <div
                  :class="{
                    on: chartEnergyNetLine
                  }"
                  class="line-icon net"
                />
                Total
              </div>

              
              <div 
                class="summary-col-energy cell-value">
                <span v-if="hoverOn || focusOn">
                  {{
                    pointSummary._total
                      | convertValue(chartCapacityUnitPrefix, chartCapacityDisplayPrefix)
                      | formatCapacityValue(chartCapacityDisplayPrefix)
                  }}
                </span>
                <span v-else-if="isTypeChangeSinceLine"> – </span>
                <span v-else>
                  {{ 
                    summary._total 
                      | convertValue(chartCapacityUnitPrefix, chartCapacityDisplayPrefix) 
                      | formatCapacityValue(chartCapacityDisplayPrefix) 
                  }}
                </span>
              </div>

            </div>
          </div>

          <!-- <div
            class="summary-column-headers line-row"
            @touchstart="() => handleTouchstart(chartEnergyRenewablesLine)"
            @touchend="handleTouchend"
            @click.exact="() => handleTotalLineRowClicked('chartEnergyRenewablesLine')"
            @click.shift.exact="() => handleLineRowShiftClicked('chartEnergyRenewablesLine')"
          >
            <div class="summary-row last-row hoverable">
              <div class="summary-col-label">
                <div
                  :class="{
                    on: chartEnergyRenewablesLine,
                    'alt-colour': useAltRenewablesLineColour
                  }"
                  class="line-icon"
                />
                Renewables
              </div>

              <div 
                class="summary-col-external-link-icon" 
                style="width: 20px" />

              <div 
                v-if="isEnergy" 
                class="summary-col-energy cell-value">
                <span v-if="hoverOn || focusOn">
                  {{
                    renewablesValue
                      | convertValue(chartUnitPrefix, chartDisplayPrefix)
                      | formatValue
                  }}
                </span>
                <span v-else-if="isTypeChangeSinceLine"> – </span>
                <span v-else>
                  {{
                    renewablesValue
                      | convertValue(chartUnitPrefix, chartDisplayPrefix)
                      | formatValue
                  }}
                </span>
              </div>
              <div 
                v-else 
                class="summary-col-energy cell-value">
                <span v-if="hoverOn || focusOn">
                  {{
                    renewablesValue
                      | convertValue(chartUnitPrefix, chartDisplayPrefix)
                      | formatValue
                  }}
                </span>
                <span v-else-if="isTypeChangeSinceLine"> – </span>
                <span v-else>
                  {{ renewablesValue | formatValue }}
                </span>
              </div>

              <button
                v-if="!hoverOn && !focusOn"
                class="value-btn summary-col-contribution cell-value"
                @click.stop="handleValueButtonClicked"
              >
                {{ renewablesPercentage | percentageFormatNumber(renewablesCustomFString) }}
              </button>
              <button
                v-if="hoverOn || focusOn"
                class="value-btn summary-col-contribution cell-value"
                @click.stop="handleValueButtonClicked"
              >
                {{ pointRenewablesPercentage | percentageFormatNumber(renewablesCustomFString) }}
              </button>
              <div class="summary-col-av-value cell-value" />
            </div>
          </div> -->
        </div>
        
      </div>
      
    </div>
  </div>
</template>

<script>
import _isEmpty from 'lodash.isempty'
import _cloneDeep from 'lodash.clonedeep'
import _includes from 'lodash.includes'
import { mapGetters } from 'vuex'
import { format as d3Format } from 'd3-format'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import { energy_sum } from '@opennem/energy-tools'

import * as OPTIONS from '@/constants/chart-options.js'
import { GROUP_DETAILED } from '@/constants/capacity-fuel-techs'
import EventBus from '@/plugins/eventBus'
import { getTimeLabel } from '@/data/transform/time-of-day' 
import groupDataset from '@/data/parse/region-energy/group'
import Domain from '~/services/Domain.js'
import GroupSelector from '~/components/ui/CapacityFuelTechGroupSelector'
import ColumnSelector from '~/components/ui/SummaryColumnSelector'
import ExportLegend from '@/components/Energy/Export/Legend'
import Items from './Items'
import DatesDisplay from './DatesDisplay'

export default {
  components: {
    GroupSelector,
    ColumnSelector,
    Items,
    DatesDisplay,
    ExportLegend
  },

  props: {
    displayAsLegend: {
      type: Boolean,
      default: () => false
    },
    showPercentInLegend: {
      type: Boolean,
      default: () => false
    },
    energyDomains: {
      type: Array,
      default: () => []
    },
    capacityDomains: {
      type: Array,
      default: () => []
    },
    emissionsDomains: {
      type: Array,
      default: () => []
    },
    marketValueDomains: {
      type: Array,
      default: () => []
    },
    demandPriceDomains: {
      type: Array,
      default: () => []
    },
    demandEnergyDomains: {
      type: Array,
      default: () => []
    },
    demandPowerDomains: {
      type: Array,
      default: () => []
    },
    demandMarketValueDomains: {
      type: Array,
      default: () => []
    },
    priceId: {
      type: String,
      default: () => ''
    },
    temperatureDomains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    hiddenFuelTechs: {
      type: Array,
      default: () => []
    },
    hoverDate: {
      type: Date,
      default: () => null
    },
    hoverOn: {
      type: Boolean,
      default: () => false
    },
    focusDate: {
      type: Date,
      default: () => null
    },
    focusOn: {
      type: Boolean,
      default: () => false
    },
    temperatureId: {
      type: String,
      default: () => ''
    },
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    },
    isEnergy: {
      type: Boolean,
      default: () => false
    },
    domainToggleable: {
      type: Boolean,
      default: () => true
    },
    groupSelection: {
      type: Boolean,
      default: () => true
    }
  },

  data() {
    return {
      summary: {},
      summarySources: {},
      summaryLoads: {},
      pointSummary: {},
      pointSummarySources: {},
      pointSummaryLoads: {},
      hiddenSources: [],
      hiddenLoads: [],
      hoveredTemperature: 0,
      mousedownDelay: null,
      longPress: 500,
      renewablesCustomFString: ',.1f', // ',.3f'
    }
  },

  computed: {
    ...mapGetters({
      datasetFlat: 'regionEnergy/datasetFlat',
      changeSinceDataset: 'regionEnergy/changeSinceDataset',
      domainPowerEnergy: 'regionEnergy/domainPowerEnergy',
      domainPowerEnergyGrouped: 'regionEnergy/domainPowerEnergyGrouped',
      domainEmissionsGrouped: 'regionEnergy/domainEmissionsGrouped',
      domainMarketValueGrouped: 'regionEnergy/domainMarketValueGrouped',
      regionTimezoneString: 'regionEnergy/regionTimezoneString',
      isEnergyType: 'regionEnergy/isEnergyType',

      chartEnergyRenewablesLine:
        'chartOptionsPowerEnergy/chartEnergyRenewablesLine',
      chartEnergyNetLine:
        'chartOptionsPowerEnergy/chartEnergyNetLine',

      chartType: 'chartOptionsPowerEnergy/chartType',
      chartEnergyYAxis: 'chartOptionsPowerEnergy/chartEnergyYAxis',
      chartEnergyUnit: 'chartOptionsPowerEnergy/chartEnergyUnit',
      chartEnergyUnitPrefix: 'chartOptionsPowerEnergy/chartEnergyUnitPrefix',
      chartEnergyDisplayPrefix:
        'chartOptionsPowerEnergy/chartEnergyDisplayPrefix',
      chartEnergyCurrentUnit: 'chartOptionsPowerEnergy/chartEnergyCurrentUnit',

      chartPowerUnit: 'chartOptionsPowerEnergy/chartPowerUnit',
      chartPowerYAxis: 'chartOptionsPowerEnergy/chartPowerYAxis',
      chartPowerUnitPrefix: 'chartOptionsPowerEnergy/chartPowerUnitPrefix',
      chartPowerDisplayPrefix:
        'chartOptionsPowerEnergy/chartPowerDisplayPrefix',
      chartPowerCurrentUnit: 'chartOptionsPowerEnergy/chartPowerCurrentUnit',

      chartCapacityUnitPrefix: 'chartOptionsCapacity/chartUnitPrefix',
      chartCapacityDisplayPrefix: 'chartOptionsCapacity/chartDisplayPrefix',
      chartCapacityCurrentUnit: 'chartOptionsCapacity/chartCurrentUnit',
      chartCapacityYAxis: 'chartOptionsCapacity/chartCapacityYAxis',

      isTypeChangeSinceLine: 'chartOptionsPowerEnergy/isTypeChangeSinceLine',
      displayUnit: 'chartOptionsPowerEnergy/displayUnit',

      chartEmissionsVolumeUnitPrefix:
        'chartOptionsEmissionsVolume/chartUnitPrefix',
      chartEmissionsVolumeDisplayPrefix:
        'chartOptionsEmissionsVolume/chartDisplayPrefix',

      emissionIntensityData: 'energy/emissions/emissionIntensityData',
      averageEmissionIntensity: 'energy/emissions/averageEmissionIntensity',
      sumEmissionsMinusLoads: 'energy/emissions/sumEmissionsMinusLoads',

      dashboardView: 'app/dashboardView',
      averagesDataset: 'timeOfDay/averagesDataset'
    }),

    isTimeOfDayView() {
      return this.dashboardView === 'time-of-day'
    },

    timeOfDayHoverTime() {
      return getTimeLabel(this.hoverDate)
    },

    chartUnit() {
      return this.isEnergy ? this.chartEnergyUnit : this.chartPowerUnit
    },
    chartUnitPrefix() {
      return this.isEnergy
        ? this.chartEnergyUnitPrefix
        : this.chartPowerUnitPrefix
    },
    chartDisplayPrefix() {
      return this.isEnergy
        ? this.chartEnergyDisplayPrefix
        : this.chartPowerDisplayPrefix
    },
    chartCurrentUnit() {
      return this.chartCapacityCurrentUnit
    },

    chartYAxis() {
      return this.isEnergyType ? this.chartEnergyYAxis : this.chartPowerYAxis
    },

    isYAxisAbsolute() {
      return (
        this.chartYAxis === OPTIONS.CHART_YAXIS_ENERGY ||
        this.chartYAxis === OPTIONS.CHART_YAXIS_ABSOLUTE
      )
    },

    fuelTechGroupName() {
      return this.$store.getters.fuelTechGroupName
    },

    propRef() {
      return this.fuelTechGroupName === GROUP_DETAILED ? 'fuelTech' : 'group'
    },

    percentContributionTo() {
      return this.$store.getters.percentContributionTo
    },

    showSummaryColumn() {
      return this.$store.getters.showSummaryColumn
    },

    isAvValueColumn() {
      return this.showSummaryColumn === 'av-value'
    },

    isEmissionsVolumeColumn() {
      return this.showSummaryColumn === 'emissions-volume'
    },

    isEmissionsIntensityColumn() {
      return this.showSummaryColumn === 'emissions-intensity'
    },

    emissionHoverData() {
      let date = this.focusDate
      if (this.hoverOn) {
        date = this.hoverDate
      }

      if (date) {
        const time = date.getTime()
        const find = this.emissionIntensityData.find((d) => d.time === time)
        return find ? find : null
      }

      return null
    },

    emissionsHoverValue() {
      return this.emissionHoverData
        ? this.emissionHoverData._totalEmissionsMinusLoads
        : null
    },

    emissionIntensityHoverValue() {
      return this.emissionHoverData
        ? this.emissionHoverData._emissionIntensity
        : null
    },

    sourcesOrderLength() {
      return this.capacityDomains.filter(
        (d) => d.category === 'source' || d.category === 'load'
      ).length
    },

    sourcesOrder() {
      return this.capacityDomains.filter((d) => d.category === 'source')
    },

    loadsOrder() {
      return this.capacityDomains.filter((d) => d.category === 'load')
    },

    sourcesMarketValueOrder() {
      return this.marketValueDomains.filter((d) => d.category === 'source')
    },

    loadsMarketValueOrder() {
      return this.marketValueDomains.filter((d) => d.category === 'load')
    },

    legendDomains() {
      const hidden = this.hiddenFuelTechs
      const domains = this.capacityDomains.filter(
        (d) => !_includes(hidden, d[this.propRef])
      )
      domains.forEach((d) => {
        d.contribution = this.getContribution(d.id)
      })
      return domains
    },

    renewablesValue() {
      const isSummary = !this.hoverOn && !this.focusOn
      const totalRenewables = isSummary
        ? this.dataset.reduce((a, b) => a + b._totalRenewables, 0)
        : this.pointSummary._totalRenewables
      const mins = this.interval === '30m' ? 30 : 5

      return this.isEnergy || !isSummary
        ? totalRenewables
        : (totalRenewables * mins) / 60 / 1000
    },

    renewablesPercentage() {
      const key =
        this.percentContributionTo === 'demand'
          ? '_totalEnergyForPercentageCalculation'
          : '_totalGeneration'
      let totalRenewables = this.dataset.reduce(
        (a, b) => a + b._totalRenewables,
        0
      )
      let total = this.dataset.reduce((a, b) => a + b[key], 0)

      const r = (totalRenewables / total) * 100
      const f = d3Format(',.3f')
      if (!isNaN(r)) {
        console.log(`***** Renewables: ${f(r)}%`)
      }
      return r
    },

    pointRenewablesPercentage() {
      const key =
        this.percentContributionTo === 'demand'
          ? '_totalEnergyForPercentageCalculation'
          : '_totalGeneration'
      const totalRenewables = this.pointSummary._totalRenewables
      const total = this.pointSummary[key]
      return (totalRenewables / total) * 100
    },


    intervalMins() {
      const interval = this.interval
      if (interval === '30m') {
        return 30
      } else if (interval === 'Day') {
        return 60 * 24
      }
      // default 5 mins
      return 5
    },

    hoveredDate() {
      const item = this.pointSummary
      return item ? item.time : null
    },

    hoveredDateTime() {
      const item = this.pointSummary
      const date = item ? item.date : null
      return date ? new Date(date).toISOString() : ''
    },

    startDate() {
      const dataLength = this.dataset.length
      return dataLength > 0 ? this.dataset[0].time : null
    },

    endDate() {
      const dataLength = this.dataset.length
      return dataLength > 0 ? this.dataset[dataLength - 1].time : null
    },

    startDateTime() {
      // const dataLength = this.dataset.length
      // const startDate = dataLength > 0 ? this.dataset[0].date : null
      return this.startDate ? new Date(this.startDate).toISOString() : ''
    },

    endDateTime() {
      // const dataLength = this.dataset.length
      // const endDate = dataLength > 0 ? this.dataset[dataLength - 1].date : null
      return this.endDate ? new Date(this.endDate).toISOString() : ''
    },

    isYearInterval() {
      return this.interval === 'Fin Year' || this.interval === 'Year'
    },

    useAltRenewablesLineColour() {
      return (
        this.fuelTechGroupName === 'Renewable/Fossil' ||
        this.fuelTechGroupName === 'Flexibility'
      )
    }
  },

  watch: {
    fuelTechGroupName() {
      // clear hidden fuel techs when grouping is changed
      this.hiddenSources = []
      this.hiddenLoads = []
      this.emitHiddenFuelTechs()

      if (this.focusOn) {
        this.updatePointSummary(this.focusDate)
      }
    },
    dataset(updated) {
      this.calculateSummary(updated)
    },
    capacityDomains(updated) {
      this.calculateSummary(this.dataset)
    },
    marketValueDomains(updated) {
      this.calculateSummary(this.dataset)
    },
    hoverDate(date) {
      this.updatePointSummary(date)
    },
    hoverOn(on) {
      if (on) {
        this.updatePointSummary(this.hoverDate)
      } else if (this.focusOn) {
        this.updatePointSummary(this.focusDate)
      }
    },
    focusOn(on) {
      if (on) {
        this.updatePointSummary(this.focusDate)
      }
    },
    focusDate() {
      this.handlePointCopy()
    },
    hiddenFuelTechs(updated) {
      this.calculateSummary(this.dataset)
    },
    percentContributionTo(updated) {
      this.calculateSummary(this.dataset)
    }
  },

  mounted() {
    let hiddenFuelTechs = this.hiddenFuelTechs

    // if all is hidden, then unhide all
    let hiddenLength = 0
    this.capacityDomains.forEach((d) => {
      if (_includes(hiddenFuelTechs, d[this.propRef])) {
        hiddenLength += 1
      }
    })

    if (this.capacityDomains.length === hiddenLength) {
      this.hiddenSources = []
      this.hiddenLoads = []
      hiddenFuelTechs = []
    }

    this.$emit('fuelTechsHidden', hiddenFuelTechs)

    hiddenFuelTechs.forEach((fuelTech) => {
      const find = this.capacityDomains.find(
        (domain) => domain[this.propRef] === fuelTech
      )
      if (find) {
        if (find.category === 'source') {
          this.hiddenSources.push(fuelTech)
        } else {
          this.hiddenLoads.push(fuelTech)
        }
      }
    })
    this.calculateSummary(this.dataset)
  },

  methods: {
    handleValueButtonClicked() {
      if (this.renewablesCustomFString === ',.1f') {
        this.renewablesCustomFString = ',.3f'
      } else {
        this.renewablesCustomFString = ',.1f'
      }  
    },

    calculateSummary(data) {
      if (data.length > 0) {
        // use latest data
        const latestData = data[data.length - 1]
        const latestSummary = _cloneDeep(latestData)

        let total = 0
        this.capacityDomains.forEach((d) => {
          total += latestSummary[d.id]
        })
        latestSummary._total = total
        this.summary = latestSummary

        this.$emit('summary-update', this.summary)
      }
    },

    calculatePointSummary({ data }) {
      if (data) {
        const latestPointSummary = _cloneDeep(data)

        let total = 0
        this.capacityDomains.forEach((d) => {
          total += latestPointSummary[d.id]
        })
        latestPointSummary._total = total

        this.pointSummary = latestPointSummary
      }
    },

    updatePointSummary(date) {
      if (!date) return

      // const dataFound = this.dataset.find((d) => d.time === date.getTime())
      // const todDataFound = this.averagesDataset.find((d) => d.time === date.getTime())

      const dataFound = this.dataset.find((d) => d.time === date.getTime())
      let point = _cloneDeep(dataFound)

      if (this.isTypeChangeSinceLine) {
        const changeSinceData = this.changeSinceDataset.find(
          (d) => d.time === date.getTime()
        )

        point = _cloneDeep(changeSinceData)
      }

      this.calculatePointSummary({
        data: point
      })
    },

    handleSourcesOrderUpdate(newSourceOrder) {
      this.setFuelTechOrder(newSourceOrder, this.loadsOrder)
    },

    handleLoadsOrderUpdate(newLoadsOrder) {
      this.setFuelTechOrder(this.sourcesOrder, newLoadsOrder)
    },

    setFuelTechOrder(sources, loads) {
      const loadsOrder = loads.map((d) => d.fuelTech)
      const sourcesOrder = sources.map((d) => d.fuelTech)
      const order = [...sourcesOrder, ...loadsOrder]
      this.$store.dispatch('fuelTechOrder', order.reverse())
    },

    emitHiddenFuelTechs() {
      let hiddenFuelTechs = [...this.hiddenSources, ...this.hiddenLoads]
      // if all is hidden, then unhide all
      let sourcesHiddenLength = 0
      this.sourcesOrder.forEach((d) => {
        if (_includes(this.hiddenSources, d[this.propRef])) {
          sourcesHiddenLength += 1
        }
      })
      let loadsHiddenLength = 0
      this.loadsOrder.forEach((d) => {
        if (_includes(this.hiddenLoads, d[this.propRef])) {
          loadsHiddenLength += 1
        }
      })
      if (
        this.sourcesOrder.length === sourcesHiddenLength &&
        this.loadsOrder.length === loadsHiddenLength &&
        !this.chartEnergyRenewablesLine &&
        !this.chartEnergyNetLine
      ) {
        this.hiddenSources = []
        this.hiddenLoads = []
        hiddenFuelTechs = []
      }

      this.$emit('fuelTechsHidden', hiddenFuelTechs)
    },

    handleSourceFuelTechsHidden(hidden, hideOthers, onlyFt) {
      this.hiddenSources = hidden
      if (hideOthers) {
        if (this.fuelTechGroupName === GROUP_DETAILED) {
          const hiddenSources = Domain.getAllDomainObjs().filter(
            (d) => d.category === 'source' && d.fuelTech !== onlyFt.fuelTech
          )
          const hiddenLoads = Domain.getAllDomainObjs().filter(
            (d) => d.category === 'load'
          )
          this.hiddenSources = hiddenSources.map((d) => d.fuelTech)
          this.hiddenLoads = hiddenLoads.map((d) => d.fuelTech)
        } else {
          const hiddenLoads = this.domainPowerEnergyGrouped[
            this.fuelTechGroupName
          ].filter((d) => d.category === 'load')
          this.hiddenLoads = hiddenLoads.map((d) => d[this.propRef])
          // this.hiddenLoads = this.loadsOrder.map(d => d[property])
        }
      }
      this.emitHiddenFuelTechs()
    },

    handleLoadFuelTechsHidden(hidden, hideOthers, onlyFt) {
      this.hiddenLoads = hidden
      if (hideOthers) {
        if (this.fuelTechGroupName === GROUP_DETAILED) {
          const hiddenSources = Domain.getAllDomainObjs().filter(
            (d) => d.category === 'source'
          )
          const hiddenLoads = Domain.getAllDomainObjs().filter(
            (d) => d.category === 'load' && d.fuelTech !== onlyFt.fuelTech
          )
          this.hiddenSources = hiddenSources.map((d) => d.fuelTech)
          this.hiddenLoads = hiddenLoads.map((d) => d.fuelTech)
        } else {
          this.hiddenSources = this.sourcesOrder.map((d) => d[this.propRef])
        }
      }
      this.emitHiddenFuelTechs()
    },

    handlePercentContributionToClick() {
      if (this.percentContributionTo === 'demand') {
        this.$store.dispatch('percentContributionTo', 'generation')
      } else {
        this.$store.dispatch('percentContributionTo', 'demand')
      }
    },

    handleTouchstart(lineDomain) {
      this.mousedownDelay = setTimeout(() => {
        this.handleLineRowShiftClicked(lineDomain)
      }, this.longPress)
    },
    handleTouchend() {
      this.clearTimeout()
    },
    clearTimeout() {
      clearTimeout(this.mousedownDelay)
      this.mousedownDelay = null
    },

    handleTotalLineRowClicked(lineDomain) {
      // const rowToggle = !this[lineDomain]
      // this.$store.commit(
      //   `chartOptionsPowerEnergy/${lineDomain}`,
      //   rowToggle
      // )
      // this.emitHiddenFuelTechs()
    },

    handleLineRowShiftClicked(lineDomain) {
      if (this.fuelTechGroupName === GROUP_DETAILED) {
        const hiddenSources = Domain.getAllDomainObjs().filter(
          (d) => d.category === 'source'
        )
        const hiddenLoads = Domain.getAllDomainObjs().filter(
          (d) => d.category === 'load'
        )
        this.hiddenSources = hiddenSources.map((d) => d.fuelTech)
        this.hiddenLoads = hiddenLoads.map((d) => d.fuelTech)
      } else {
        const hiddenLoads = this.domainPowerEnergyGrouped[
          this.fuelTechGroupName
        ].filter((d) => d.category === 'load')
        this.hiddenLoads = hiddenLoads.map((d) => d[this.propRef])
        this.hiddenSources = this.sourcesOrder.map((d) => d[this.propRef])
      }

      this.$store.commit(
        `chartOptionsPowerEnergy/chartEnergyRenewablesLine`,
        false
      )
      this.$store.commit(
        `chartOptionsPowerEnergy/chartEnergyNetLine`,
        false
      )

      this.$store.commit(
        `chartOptionsPowerEnergy/${lineDomain}`,
        true
      )
      this.emitHiddenFuelTechs()
    },

    handleMouseEnter(ft) {
      this.$emit('mouse-enter', ft)
    },
    handleMouseLeave() {
      this.$emit('mouse-leave')
    },

    handleUnitCellClicked() {
      EventBus.$emit('capacity.chart.unit-toggle')
    },

    getContribution(key) {
      const rowValue = this.summary[key] || 0
      const total = this.summary._totalEnergyForPercentageCalculation

      return (rowValue / total) * 100
    },

    handleDomainClick(domain) {
      this.$emit('domain-click', domain)
    },

    handlePointCopy() {
      let tableText = `fuelTech,power/energy,emissions,intensity\n`
      const domains = _cloneDeep(this.domainPowerEnergy).reverse()
      const format = (val, p = 2) => val ? val.toFixed(p) : 0
      domains.forEach((d) => {
        // console.log(d.id, this.pointSummary[d.id])
        const emissionsId = this.isEnergyType
          ? d.id.replace('.energy', '.emissions')
          : d.id.replace('.power', '.emissions')
        // console.log(emissionsId, this.pointSummary[emissionsId])
        const powerenergy = this.pointSummary[d.id]
        const emissionsVolume = this.pointSummary[emissionsId] || 0
        let ei = emissionsVolume ? emissionsVolume / Math.abs(powerenergy) : null
        if (!this.isEnergyType) {
          ei = ei * 1000 * 12
        }
        tableText += `${d.fuelTech},${format(powerenergy)},${format(emissionsVolume)},${format(ei)}\n`
      })
      console.log(tableText)
      const copyContent = async () => {
        try {
          await navigator.clipboard.writeText(tableText);
          console.log('Content copied to clipboard');
        } catch (err) {
          console.error('Failed to copy: ', err);
        }
      }
      copyContent()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.value-btn {
  font-size: 11px;
  border: 0;
  background: none;
  cursor: pointer;
  color: black;
}

.summary-table {
  color: #333;
  font-size: 11px;

  .cell-value {
    font-family: $family-primary;
  }
}

.cell-toggle {
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }
}

.line-row {
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }

  .summary-col-label {
    display: flex;
    align-items: center;
  }

  .line-icon {
    width: 15px;
    height: 3px;
    background: #ddd;
    margin-right: 5px;

    &.on {
      background: #52A960;

      &.net {
        background: #e34a33;
      }

      &.alt-colour {
        background: #e34a33;
      }
    }
  }
}

:deep(.summary-column-headers) {
  .summary-row {
    font-family: $header-font-family;
    font-weight: 700;
    // user-select: none;
  }
}

:deep(.summary-row) {
  display: flex;
  font-size: 1em;
  padding: 6px 8px;
  justify-content: space-between;

  &.hoverable:hover {
    background-color: #FAF9F6;
  }

  &.summary-heading-row {
    background-color: transparent;
  }

  &.last-row {
    border-bottom-color: #000;
  }

  .summary-col-label {
    width: 200px;
  }
  .summary-col-energy,
  .summary-col-contribution,
  .summary-col-av-value,
  .summary-col-ev,
  .summary-col-ei {
    width: 23%;
    text-align: right;
    padding: 0 5px;
  }

  small {
    display: block;
    color: #999;
  }
}
</style>
