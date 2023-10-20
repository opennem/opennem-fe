<template>
  <div class="summary-table">
    <export-legend
      v-if="displayAsLegend"
      :domains="legendDomains"
      :show-percent="showPercentInLegend"
    />

    <div v-else>
      <div v-if="isTimeOfDayView">
        <DatesDisplayToD
          :is-hovering="hoverOn"
          :hovered-time="timeOfDayHoverTime"
          :start-date="startDate"
          :end-date="endDate"
          :range="range"
          :interval="interval"
          :timezone-string="isEnergyType ? '' : regionTimezoneString"
        />
      </div>
      <dates-display
        v-else
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

      <div class="summary-column-headers">
        <div class="summary-row">
          <div 
            class="summary-col-label" 
            style="padding-top: 3px">
            <group-selector v-if="groupSelection" />
          </div>

          <div 
            class="summary-col-external-link-icon" 
            style="width: 20px" />

          <div
            v-if="isEnergy"
            class="summary-col-energy cell-toggle"
            @click="handleUnitCellClicked"
          >
            <span v-if="isTypeChangeSinceLine">
              Change since <small>{{ displayUnit }}</small>
            </span>
            <span v-else>
              Energy <small>{{ chartCurrentUnit }}</small>
            </span>
          </div>
          <div 
            v-else 
            class="summary-col-energy">
            <span v-if="hoverOn || focusOn">
              Power <small>{{ chartCurrentUnit }}</small>
            </span>
            <span v-else> Energy <small>GWh</small> </span>
          </div>

          <div
            class="summary-col-contribution cell-toggle"
            @click="handlePercentContributionToClick"
          >
            Contribution <small>to {{ percentContributionTo }}</small>
          </div>
          <div class="summary-col-av-value">
            <column-selector />
          </div>
        </div>

        <div class="summary-row">
          <div class="summary-col-label">Sources</div>

          <!-- <div
            class="summary-col-external-link-icon" 
            style="width: 20px" />

           <div 
            v-if="isEnergy" 
            class="summary-col-energy cell-value">
            <div v-if="isTypeChangeSinceLine">–</div>
            <div v-else>
              <span v-if="hoverOn || focusOn">
                {{
                  pointSummarySources._total
                    | convertValue(chartUnitPrefix, chartDisplayPrefix)
                    | formatValue
                }}
              </span>
              <span v-else>
                {{
                  summarySources._totalEnergy
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
                pointSummarySources._total
                  | convertValue(chartUnitPrefix, chartDisplayPrefix)
                  | formatValue
              }}
            </span>
            <span v-else>
              {{ summarySources._totalEnergy | formatValue }}
            </span>
          </div>

          <div class="summary-col-contribution cell-value" />
          <div
            v-if="!hoverOn && !focusOn"
            class="summary-col-av-value cell-value"
          >
            <span v-if="isEnergy && isAvValueColumn">
              {{ summary._totalDemandAverageValue | formatCurrency }}
            </span>
            <span v-if="!isEnergy && isAvValueColumn">
              {{ summary._totalAverageValue | formatCurrency }}
            </span>
            <span v-if="isEmissionsVolumeColumn">
              {{
                sumEmissionsMinusLoads
                  | convertValue(
                    chartEmissionsVolumeUnitPrefix,
                    chartEmissionsVolumeDisplayPrefix
                  )
                  | formatValue
              }}
            </span>
            <span v-if="isEmissionsIntensityColumn">
              {{ averageEmissionIntensity | formatValue }}
            </span>
          </div>
          <div
            v-if="hoverOn || focusOn"
            class="summary-col-av-value cell-value"
          >
            <span v-if="isEnergy && isAvValueColumn">
              {{ pointSummary._demandAverageValue | formatCurrency }}
            </span>
            <span v-if="!isEnergy && isAvValueColumn">
              {{ pointSummary._totalAverageValue | formatCurrency }}
            </span>
            <span v-if="isEmissionsVolumeColumn">
              {{
                emissionsHoverValue
                  | convertValue(
                    chartEmissionsVolumeUnitPrefix,
                    chartEmissionsVolumeDisplayPrefix
                  )
                  | formatValue
              }}
            </span>
            <span v-if="isEmissionsIntensityColumn">
              {{ emissionIntensityHoverValue | formatValue }}
            </span>
          </div> -->
        </div>
      </div>

      <items
        :group="'ft-sources'"
        :hidden-fuel-techs="hiddenSources"
        :original-order="sourcesOrder"
        :market-value-order="sourcesMarketValueOrder"
        :show-point-summary="hoverOn || focusOn"
        :point-summary="pointSummarySources"
        :point-summary-total="pointSummarySourcesTotal"
        :summary="summarySources"
        :summary-total="summarySourcesTotal"
        :domain-toggleable="domainToggleable"
        :energy-domains="energyDomains"
        :emissions-domains="emissionsDomains"
        :is-year-interval="isYearInterval"
        @update="handleSourcesOrderUpdate"
        @fuelTechsHidden="handleSourceFuelTechsHidden"
        @mouse-enter="handleMouseEnter"
        @mouse-leave="handleMouseLeave"
        @domain-click="handleDomainClick"
      />

      <div 
        v-if="loadsOrder.length > 0" 
        class="summary-column-headers">
        <div class="summary-row">
          <div class="summary-col-label">Loads</div>

          <div 
            class="summary-col-external-link-icon" 
            style="width: 20px" />

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
      </div>

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

      <div 
        v-if="loadsOrder.length > 0" 
        class="summary-column-headers line-row"
        @touchstart="() => handleTouchstart('chartEnergyNetLine')"
        @touchend="handleTouchend"
        @click.exact="() => handleTotalLineRowClicked('chartEnergyNetLine')"
        @click.shift.exact="() => handleLineRowShiftClicked('chartEnergyNetLine')"
      >
        <div class="summary-row last-row">
          <div class="summary-col-label">
            <div
              :class="{
                on: chartEnergyNetLine
              }"
              class="line-icon net"
            />
            Net
          </div>

          <div 
            class="summary-col-external-link-icon" 
            style="width: 20px" />

          <div 
            v-if="isEnergy" 
            class="summary-col-energy cell-value">
            <span v-if="hoverOn || focusOn">
              {{
                pointSummary._total
                  | convertValue(chartUnitPrefix, chartDisplayPrefix)
                  | formatValue
              }}
            </span>
            <span v-else-if="isTypeChangeSinceLine"> – </span>
            <span v-else>
              {{
                summary._totalEnergy
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
                pointSummary._total
                  | convertValue(chartUnitPrefix, chartDisplayPrefix)
                  | formatValue
              }}
            </span>
            <span v-else-if="isTypeChangeSinceLine"> – </span>
            <span v-else>
              {{ summary._totalEnergy | formatValue }}
            </span>
          </div>

          <div class="summary-col-contribution cell-value" />
          <div class="summary-col-av-value cell-value" />
        </div>
      </div>

      <div
        class="summary-column-headers line-row"
        @touchstart="() => handleTouchstart(chartEnergyRenewablesLine)"
        @touchend="handleTouchend"
        @click.exact="() => handleTotalLineRowClicked('chartEnergyRenewablesLine')"
        @click.shift.exact="() => handleLineRowShiftClicked('chartEnergyRenewablesLine')"
      >
        <div class="summary-row last-row">
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

          <div
            v-if="!hoverOn && !focusOn"
            class="summary-col-contribution cell-value"
          >
            {{ renewablesPercentage | percentageFormatNumber }}
          </div>
          <div
            v-if="hoverOn || focusOn"
            class="summary-col-contribution cell-value"
          >
            {{ pointRenewablesPercentage | percentageFormatNumber }}
          </div>
          <div class="summary-col-av-value cell-value" />
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
import { GROUP_DETAILED } from '@/constants/energy-fuel-techs'
import EventBus from '@/plugins/eventBus'
import { getTimeLabel } from '@/data/transform/time-of-day' 
import groupDataset from '@/data/parse/region-energy/group'
import Domain from '~/services/Domain.js'
import GroupSelector from '~/components/ui/FuelTechGroupSelector'
import ColumnSelector from '~/components/ui/SummaryColumnSelector'
import ExportLegend from '@/components/Energy/Export/Legend'
import Items from './Items'
import DatesDisplay from './DatesDisplay'
import DatesDisplayToD from './DatesDisplayToD'

export default {
  components: {
    GroupSelector,
    ColumnSelector,
    Items,
    DatesDisplay,
    DatesDisplayToD,
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
      longPress: 500
    }
  },

  computed: {
    ...mapGetters({
      datasetFlat: 'regionEnergy/datasetFlat',
      changeSinceDataset: 'regionEnergy/changeSinceDataset',
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
      return this.isEnergy
        ? this.chartEnergyCurrentUnit
        : this.chartPowerCurrentUnit
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
      return this.energyDomains.filter(
        (d) => d.category === 'source' || d.category === 'load'
      ).length
    },

    sourcesOrder() {
      return this.energyDomains.filter((d) => d.category === 'source')
    },

    loadsOrder() {
      return this.energyDomains.filter((d) => d.category === 'load')
    },

    sourcesMarketValueOrder() {
      return this.marketValueDomains.filter((d) => d.category === 'source')
    },

    loadsMarketValueOrder() {
      return this.marketValueDomains.filter((d) => d.category === 'load')
    },

    legendDomains() {
      const hidden = this.hiddenFuelTechs
      const domains = this.energyDomains.filter(
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

    pointSummarySourcesTotal() {
      if (this.percentContributionTo === 'demand') {
        return this.pointSummary._totalEnergyForPercentageCalculation
      } else {
        return this.pointSummarySources._totalGeneration
      }
    },

    summarySourcesTotal() {
      if (this.percentContributionTo === 'demand') {
        return this.summary._totalEnergyForPercentageCalculation
      } else {
        return this.summarySources._totalGeneration
      }
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
    energyDomains(updated) {
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
    this.energyDomains.forEach((d) => {
      if (_includes(hiddenFuelTechs, d[this.propRef])) {
        hiddenLength += 1
      }
    })

    if (this.energyDomains.length === hiddenLength) {
      this.hiddenSources = []
      this.hiddenLoads = []
      hiddenFuelTechs = []
    }

    this.$emit('fuelTechsHidden', hiddenFuelTechs)

    hiddenFuelTechs.forEach((fuelTech) => {
      const find = this.energyDomains.find(
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
    calculateSummary(data) {
      if (data.length > 0) {
        const isGeneration = this.percentContributionTo === 'generation'
        let totalEnergy = 0
        let totalEnergyMinusHidden = 0
        let totalEnergyForPercentageCalculation = 0
        let totalPower = 0
        let totalPowerMinusHidden = 0
        let totalGenerationEnergyMinusHidden = 0
        let totalSources = 0
        let totalGeneration = 0
        let totalLoads = 0
        let totalPriceMarketValue = 0
        let totalEIMinusHidden = 0
        this.summary = {}
        this.summarySources = {}
        this.summaryLoads = {}

        const energySummary = data.map((d) => {
          let p = 0
          this.energyDomains.forEach((ft) => {
            p += d[ft.id] || 0
          })
          return p
        })
        const energySummaryTotal = energySummary.reduce((a, b) => a + b, 0)
        const volWeightPrice = energySummary.map((d, i) => {
          const price = data[i][this.priceId]
          return price * d
        })
        const volWeightPriceTotal = volWeightPrice.reduce((a, b) => a + b, 0)

        const dataEnergyMap = (ft, excludeHidden) => {
          return data.map((d) => {
            const energy = {}
            const setEnergy = () => {
              if (this.isEnergy) {
                return d[ft.id]
              } else {
                // calculate energy (GWh) += power * 5mins/60/1000
                const mins = this.interval === '30m' ? 30 : 5
                return (d[ft.id] * mins) / 60 / 1000
              }
            }

            if (excludeHidden) {
              if (!_includes(this.hiddenFuelTechs, ft[this.propRef])) {
                energy[ft.id] = setEnergy()
              } else {
                energy[ft.id] = 0
              }
            } else {
              energy[ft.id] = setEnergy()
            }

            return energy
          })
        }
        const dataPowerMap = (ft, excludeHidden) => {
          return data.map((d) => {
            const power = {}
            const setPower = () => {
              if (!this.isEnergy) {
                return d[ft.id]
              }
              return 0
            }

            if (excludeHidden) {
              if (!_includes(this.hiddenFuelTechs, ft[this.propRef])) {
                power[ft.id] = setPower()
              } else {
                power[ft.id] = 0
              }
            } else {
              power[ft.id] = setPower()
            }
            return power
          })
        }
        const sumMap = (ft, dataMap) => {
          return dataMap.reduce((prev, cur) => prev + cur[ft.id], 0)
        }

        // fetch original data
        const start = data[0]
        const end = data[data.length - 1]
        const startDate = start.date
        const endDate = end.date
        const bucketSizeMins = differenceInMinutes(endDate, startDate) + 1

        const datasetWithUpdatedSummary = this.datasetFlat.filter(
          (df) => df.time >= start.time && df.time <= end.time
        )
        groupDataset({
          dataset: datasetWithUpdatedSummary,
          domainPowerEnergyGrouped: this.domainPowerEnergyGrouped,
          domainEmissionsGrouped: this.domainEmissionsGrouped,
          domainMarketValueGrouped: this.domainMarketValueGrouped
        })

        // Calculate Energy
        this.energyDomains.forEach((ft) => {
          const category = ft.category
          const fullDomainData = datasetWithUpdatedSummary.map((fd) => fd[ft.id])
          const fullDomainDataMinusHidden = datasetWithUpdatedSummary.map((fd) =>
            _includes(this.hiddenFuelTechs, ft[this.propRef]) ? 0 : fd[ft.id]
          )

          const dataEnergy = dataEnergyMap(ft)
          const dataEnergyMinusHidden = dataEnergyMap(ft, true)

          // For Power, calculate using trapezoid, then convert to GWh
          const dataEnergySum = this.isEnergyType
            ? sumMap(ft, dataEnergy)
            : energy_sum(fullDomainData, bucketSizeMins) / 1000
          const dataEnergyMinusHiddenSum = this.isEnergyType
            ? sumMap(ft, dataEnergyMinusHidden)
            : energy_sum(fullDomainDataMinusHidden, bucketSizeMins) / 1000

          const dataPower = dataPowerMap(ft)
          const dataPowerMinusHidden = dataPowerMap(ft, true)
          const dataPowerSum = sumMap(ft, dataPower)
          const dataPowerMinusHiddenSum = sumMap(ft, dataPowerMinusHidden)

          let avValue = 0

          this.summary[ft.id] = dataEnergySum

          totalEnergy += dataEnergySum
          totalPower += dataPowerSum
          totalEnergyMinusHidden += dataEnergyMinusHiddenSum
          totalPowerMinusHidden += dataPowerMinusHiddenSum

          if (category !== 'load' || _includes(ft.id, 'exports')) {
            totalEnergyForPercentageCalculation += dataEnergySum
          }

          if (category === 'source') {
            this.summarySources[ft.id] = dataEnergySum
            totalSources += dataEnergySum
            if (!_includes(ft.id, 'imports')) {
              totalGeneration += dataEnergySum
            }
          } else if (category === 'load') {
            this.summaryLoads[ft.id] = dataEnergySum
            totalLoads += dataEnergySum
          }
        })

        // Calculate Emissions
        this.emissionsDomains.forEach((ft) => {
          const category = ft.category
          const dataEVMinusHidden = data.map((d) => {
            const emissionsVol = {}
            if (!_includes(this.hiddenFuelTechs, ft[this.propRef])) {
              if (
                !isGeneration ||
                (isGeneration &&
                  ft.fuelTech !== 'imports' &&
                  ft.fuelTech !== 'exports')
              ) {
                emissionsVol[ft.id] = d[ft.id]
              } else {
                emissionsVol[ft.id] = 0
              }
            } else {
              emissionsVol[ft.id] = 0
            }
            return emissionsVol
          })
          const evSum = sumMap(ft, dataEVMinusHidden)
          this.summary[ft.id] = evSum

          if (category === 'source') {
            this.summarySources[ft.id] = evSum
          } else if (category === 'load') {
            this.summaryLoads[ft.id] = evSum
          }
        })

        totalEIMinusHidden = data.reduce(
          (prev, cur) => prev + cur._emissionsIntensity,
          0
        )
        // Calculate Market Value for Energy
        // TODO: refactor price market value calcuation
        if (this.marketValueDomains.length > 0) {
          if (this.isEnergy) {
            this.marketValueDomains.forEach((ft, index) => {
              const category = ft.category
              let avValue = null
              let dataMarketValueSum = 0

              const dataMarketValue = data.map((d) => {
                const marketValue = {}
                marketValue[ft.id] = d[ft.id]
                return marketValue
              })
              dataMarketValueSum = dataMarketValue.reduce(
                (prev, cur) => prev + cur[ft.id],
                0
              )
              const findEnergyEq = this.energyDomains.find(
                (e) => e[this.propRef] === ft[this.propRef]
              )
              if (!findEnergyEq) {
                console.error(
                  'There is an issue finding the energy fuel tech in market value calculations.'
                )
              }
              const ftTotal = this.summary[findEnergyEq.id]
              avValue = dataMarketValueSum / ftTotal / 1000

              this.summary[ft.id] = avValue
              totalPriceMarketValue += dataMarketValueSum

              if (category === 'source') {
                this.summarySources[ft.id] = avValue
              } else if (category === 'load') {
                this.summaryLoads[ft.id] = -avValue
              }
            })
          } else {
            let avValue = null

            this.energyDomains.forEach((domain) => {
              const id = domain.id
              const ftPrice = data.map((p, pIndex) => {
                const price = data[pIndex][this.priceId]
                  ? data[pIndex][this.priceId]
                  : 0
                return Math.abs(p[id]) * price
              })
              const ftPriceTotal = ftPrice.reduce((a, b) => a + b, 0)
              avValue = ftPriceTotal / Math.abs(totalPower)
            })

            this.summary[this.priceId] = avValue

            avValue = null

            this.marketValueDomains.forEach((domain) => {
              const category = domain.category
              const id = domain.id
              const findEnergyEq = this.energyDomains.find(
                (e) => e[this.propRef] === domain[this.propRef]
              )
              const ftId = findEnergyEq.id
              let avValue = null
              if (!findEnergyEq) {
                console.error(
                  'There is an issue finding the energy fuel tech in market value calculations.'
                )
              }
              const dataPowerTotal = data.reduce(
                (a, b) => a + (b[ftId] || 0),
                0
              )
              const ftPrice = data.map((p, pIndex) => {
                const price = data[pIndex][this.priceId]
                  ? data[pIndex][this.priceId]
                  : 0
                return Math.abs(p[ftId]) * price
              })

              const ftPriceTotal = ftPrice.reduce((a, b) => a + b, 0)
              avValue = ftPriceTotal / Math.abs(dataPowerTotal)

              this.summary[id] = avValue

              if (category === 'source') {
                this.summarySources[id] = avValue
              } else if (category === 'load') {
                this.summaryLoads[id] = avValue
              }
            })
          }
        }

        // Calculate Temperature domains
        const temperatureObj = this.temperatureDomains.find((domain) => {
          return domain.type === 'temperature' ||
            domain.type === 'temperature_mean'
            ? domain.id
            : null
        })
        const temperatureWithoutNulls = temperatureObj
          ? data.filter((d) => {
              return d[temperatureObj.id] !== null
            })
          : []
        const totalTemperatureWithoutNulls = temperatureObj
          ? temperatureWithoutNulls.reduce(
              (prev, cur) => prev + (cur[temperatureObj.id] || 0),
              0
            )
          : 0

        let totalAverageValue = 0

        let demandEnergyTotal = 0,
          demandPowerTotal = 0,
          demandMarketValueTotal = 0,
          totalDemandAverageValue = 0
        if (this.isEnergy) {
          if (this.demandEnergyDomains && this.demandEnergyDomains.length) {
            const demandEnergyId = this.demandEnergyDomains[0].id

            const demandEnergy = data.map((p) => {
              return p[demandEnergyId] ? p[demandEnergyId] : null
            })
            demandEnergyTotal = demandEnergy.reduce((a, b) => a + b, 0)
            console.log('demandEnergyTotal: ', demandEnergyTotal)
          }

          if (
            this.demandMarketValueDomains &&
            this.demandMarketValueDomains.length
          ) {
            const demandMarketValueId = this.demandMarketValueDomains[0].id

            const demandMarketValue = data.map((p) => {
              return p[demandMarketValueId] ? p[demandMarketValueId] : null
            })
            demandMarketValueTotal = demandMarketValue.reduce(
              (a, b) => a + b,
              0
            )
            console.log('demandMarketValueTotal: ', demandMarketValueTotal)
          }
          totalAverageValue = totalPriceMarketValue / energySummaryTotal / 1000
          totalDemandAverageValue =
            demandMarketValueTotal / demandEnergyTotal / 1000

          console.log('totalDemandAverageValue: ', totalDemandAverageValue)
        } else {
          if (this.demandPowerDomains && this.demandPowerDomains.length) {
            const demandPowerId = this.demandPowerDomains[0].id
            const demandPower = data.map((p) => {
              return p[demandPowerId] ? p[demandPowerId] : null
            })
            demandPowerTotal = demandPower.reduce((a, b) => a + b, 0)

            console.log('demand power total', demandPowerTotal)
            console.log('calculated power total', energySummaryTotal)
          }
          totalAverageValue = volWeightPriceTotal / demandPowerTotal
        }

        this.summary._totalEnergy = totalEnergy
        this.summary._totalEnergyForPercentageCalculation =
          totalEnergyForPercentageCalculation
        this.summary._totalAverageValue = totalAverageValue
        this.summary._totalDemandAverageValue = totalDemandAverageValue
        this.summarySources._totalEnergy = totalSources
        this.summarySources._totalGeneration = totalGeneration
        this.summaryLoads._totalEnergy = totalLoads

        // calculate averages
        const avTotal = this.isEnergy
          ? totalEnergyMinusHidden
          : totalPowerMinusHidden

        const average = avTotal / data.length
        this.summary._averageEnergy = average
        this.summary._averageTemperature =
          totalTemperatureWithoutNulls / temperatureWithoutNulls.length
        this.$emit('summary-update', this.summary)
      }
    },

    calculatePointSummary({ data, marketValueData }) {
      let totalDemand = 0
      let totalSources = 0
      let totalGeneration = 0
      let totalRenewables = 0
      let totalEnergyForPercentageCalculation = 0
      let totalLoads = 0
      let totalPriceMarketValue = 0
      let hasLoadValue = false,
        hasSourceValue = false
      this.pointSummary = data || {} // pointSummary._total is already calculated
      this.pointSummarySources = {}
      this.pointSummaryLoads = {}

      if (!_isEmpty(this.pointSummary)) {
        // if (this.isTimeOfDayView) {
        //   this.domainPowerEnergy.forEach((ft) => {
        //     if (ft.renewable) {
        //       totalRenewables += data[ft.id] || 0
        //     }
        //   })
        // }

        this.energyDomains.forEach((ft) => {
          const category = ft.category
          const value = this.pointSummary[ft.id]

          if (category !== 'load' || _includes(ft.id, 'exports')) {
            totalEnergyForPercentageCalculation += value || 0
          }

          if (ft.renewable) {
            totalRenewables += data[ft.id] || 0
          }

          if (category === 'source') {
            if (value || value === 0) {
              hasSourceValue = true
            }
            this.pointSummarySources[ft.id] = value
            totalSources += value
            if (!_includes(ft.id, 'imports')) {
              totalGeneration += value
            }
          } else if (category === 'load') {
            if (value || value === 0) {
              hasLoadValue = true
            }
            this.pointSummaryLoads[ft.id] = value
            totalLoads += value
          }

          totalDemand += value || 0
        })

        if (!hasSourceValue) {
          totalSources = null
        }
        if (!hasLoadValue) {
          totalLoads = null
        }

        // Calculate Market Value
        if (this.isEnergy) {
          this.marketValueDomains.forEach((ft, index) => {
            const category = ft.category
            const value = marketValueData[ft.id]
            const findEnergyEq = this.energyDomains.find(
              (e) => e[this.propRef] === ft[this.propRef]
            )
            if (!findEnergyEq) {
              console.error(
                'There is an issue finding the energy fuel tech in market value calculations.'
              )
            }
            const ftTotal = marketValueData[findEnergyEq.id]
            const avValue = value / ftTotal / 1000

            this.pointSummary[ft.id] = avValue
            totalPriceMarketValue += value

            if (category === 'source') {
              this.pointSummarySources[ft.id] = avValue
            } else if (category === 'load') {
              this.pointSummaryLoads[ft.id] = -avValue
            }
          })
        }

        // Calculate Emissions
        this.emissionsDomains.forEach((domain) => {
          const category = domain.category
          const value = this.pointSummary[domain.id]

          if (category === 'source') {
            this.pointSummarySources[domain.id] = value
          } else if (category === 'load') {
            this.pointSummaryLoads[domain.id] = value
          }
        })
      }
      if (this.demandPriceDomains && this.demandPriceDomains.length) {
        const demandPriceId = this.demandPriceDomains[0].id
        // const demandEnergyId = this.demandEnergyDomains[0].id
        // const demandMarketValueId = this.demandMarketValueDomains[0].id
        // console.log(
        //   'demand av value:',
        //   `${this.pointSummary[demandPriceId]} = (${
        //     this.pointSummary[demandMarketValueId]
        //   } / ${this.pointSummary[demandEnergyId]} / 1000)`
        // )
        this.pointSummary._demandAverageValue = this.pointSummary[demandPriceId]
      }

      if (this.priceId) {
        this.pointSummary._totalAverageValue = this.pointSummary[this.priceId]
      } else {
        let totalAverageValue =
          totalPriceMarketValue / this.pointSummary._total / 1000
        if (totalAverageValue === 0) {
          totalAverageValue = '–'
        }
        this.pointSummary._totalAverageValue = totalAverageValue
      }
      this.pointSummary._totalEnergyForPercentageCalculation =
        totalEnergyForPercentageCalculation
      this.pointSummarySources._total = totalSources
      this.pointSummarySources._totalGeneration = totalGeneration
      this.pointSummaryLoads._total = totalLoads

      if (!this.pointSummary._total) {
        this.pointSummary._total = totalDemand
      }
      if (!this.pointSummary._totalRenewables) {
        this.pointSummary._totalRenewables = totalRenewables
      }
    },

    updatePointSummary(date) {
      if (!date) return

      // const dataFound = this.dataset.find((d) => d.time === date.getTime())
      // const todDataFound = this.averagesDataset.find((d) => d.time === date.getTime())

      const dataFound = this.isTimeOfDayView
        ? this.averagesDataset.find((d) => d.time === date.getTime())
        : this.dataset.find((d) => d.time === date.getTime())

      this.hoveredTemperature =
        dataFound && dataFound[this.temperatureId]
          ? dataFound[this.temperatureId]
          : ''

      let point = _cloneDeep(dataFound)

      if (this.isTypeChangeSinceLine) {
        const changeSinceData = this.changeSinceDataset.find(
          (d) => d.time === date.getTime()
        )

        point = _cloneDeep(changeSinceData)

        // if (changeSinceData) {
        //   Object.keys(changeSinceData).forEach(k => {
        //     point[k] = changeSinceData[k]
        //   })
        // }
      }

      this.calculatePointSummary({
        data: point,
        marketValueData: _cloneDeep(dataFound)
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
      const rowToggle = !this[lineDomain]
      this.$store.commit(
        `chartOptionsPowerEnergy/${lineDomain}`,
        rowToggle
      )
      this.emitHiddenFuelTechs()
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
      EventBus.$emit('energy.chart.unit-toggle')
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
      background: #52bca3;

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
    user-select: none;
  }
}

:deep(.summary-row) {
  display: flex;
  font-size: 1em;
  padding: 3px 4px;
  border-bottom: 1px solid #ddd;

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
