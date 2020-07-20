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
          
          <chart-header
            :show="chartEnergyOptions" 
            @show-change="s => handleChartOptionsChange('chartEnergy', s)">

            <template v-slot:label-unit >
              <strong v-if="step">Energy</strong>
              <strong v-else>Generation</strong>

              <small v-if="chartEnergyType === 'proportion' || (chartEnergyType === 'line' && chartEnergyYAxis === 'percentage')">%</small>
              <small v-else-if="step">{{ isYearInterval ? 'TWh' : 'GWh' }}/{{ interval | intervalLabel }}</small>
              <small v-else>MW</small>
            </template>

            <template 
              v-slot:average-value 
              v-if="!isRenewableLineOnly && chartEnergyType !== 'proportion'">
              Av.
              <strong>
                {{ averageEnergy | formatValue }}
                <span v-if="step">{{ isYearInterval ? 'TWh' : 'GWh' }}/{{ interval | intervalLabel }}</span>
                <span v-else>MW</span>
              </strong>
            </template>

            <template v-slot:hover-date>
              {{ hoverDisplayDate }}
            </template>
            <template v-slot:hover-values>
              <span
                v-if="hoverValue"
                class="ft-value">
                <em
                  :style="{ 'background-color': hoverDomainColour }"
                  class="colour-square" />
                {{ hoverDomainLabel }}
                <strong>
                  {{ hoverValue | formatValue }}<span v-if="chartEnergyType === 'proportion' || (chartEnergyType === 'line' && chartEnergyYAxis === 'percentage')">%</span>
                  <span v-else-if="step">{{ isYearInterval ? ' TWh' : ' GWh' }}</span>
                  <span v-else> MW</span>
                </strong>
              </span>

              <span
                v-if="isRenewableLineOnly"
                class="renewables-value">
                <strong>{{ hoverRenewables | percentageFormatNumber }}</strong>
              </span>
              <span
                v-else-if="chartEnergyType !== 'proportion'"
                class="total-value">
                Total
                <strong>
                  {{ hoverTotal | formatValue }}
                  <span v-if="step">{{ isYearInterval ? 'TWh' : 'GWh' }}</span>
                  <span v-else>MW</span>
                </strong>
              </span>
            </template>
          </chart-header>

          <stacked-area-vis
            v-if="chartEnergy && chartEnergyType === 'area'"
            :domains="stackedAreaDomains"
            :dataset="dataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :focus-date="focusDate"
            :focus-on="focusOn"
            :range="range"
            :interval="interval"
            :curve="isEnergyType ? chartEnergyCurve : chartPowerCurve"
            :y-min="energyYMin"
            :y-max="energyYMax"
            :vis-height="stackedAreaHeight"
            :zoomed="zoomed"
            :x-guides="xGuides"
            :x-axis-dy="xAxisDy"
            :mobile-screen="tabletBreak"
            :incomplete-intervals="incompleteIntervals"
            :compare-dates="compareDates"
            :dataset-two="chartEnergyRenewablesLine ? renewablesPercentageDataset : []"
            :dataset-two-colour="renewablesLineColour"
            class="vis-chart"
            @dateOver="handleDateOver"
            @domainOver="handleDomainOver"
            @svgClick="handleSvgClick"
          />

          <button
            v-if="chartEnergy && chartEnergyType === 'line' && zoomed"
            class="button is-rounded is-small reset-btn"
            @click.stop="resetZoom"
          >
            Zoom Out
          </button>
          <multi-line
            v-if="chartEnergy && chartEnergyType === 'line'"
            :toggled="chartEnergy"
            :svg-height="stackedAreaHeight - 30"
            :domains1="chartEnergyYAxis === 'percentage' ? stackedEnergyPercentDomains : stackedAreaDomains"
            :dataset1="chartEnergyYAxis === 'percentage' ? energyGrossPercentDataset : multiLineEnergyDataset"
            :domains2="[{
              label: 'Renewables',
              domain: 'value',
              colour: renewablesLineColour
            }]"
            :dataset2="renewablesPercentageDataset"
            :show-y2="chartEnergyRenewablesLine"
            :y2-max="renewablesMax"
            :y2-min="0"
            :y2-axis-unit="'%'"
            :y1-max="chartEnergyYAxis === 'percentage' ? energyLinePercentYMax : energyLineYMax"
            :y1-min="chartEnergyYAxis === 'percentage' ? energyLinePercentYMin : energyLineYMin"
            :x-ticks="xTicks"
            :y1-axis-unit="chartEnergyYAxis === 'percentage' ? '%' : ''"
            :curve="isEnergyType ? chartEnergyCurve : chartPowerCurve"
            :date-hovered="hoverDate"
            :zoom-range="dateFilter"
            :draw-incomplete-bucket="false"
            @date-hover="handleDateOver"
            @domain-hover="handleDomainOver"
            @enter="handleVisEnter"
            @leave="handleVisLeave" />
          <date-brush
            v-if="chartEnergy && chartEnergyType === 'line'"
            :dataset="energyGrossPercentDataset"
            :zoom-range="dateFilter" 
            :x-ticks="xTicks"
            :tick-format="tickFormat"
            :second-tick-format="secondTickFormat"
            class="date-brush"
            @date-hover="handleDateOver"
            @date-filter="handleDatasetFilter"
            @enter="handleVisEnter"
            @leave="handleVisLeave" />

          <stacked-area-vis
            v-if="chartEnergy && chartEnergyType === 'proportion'"
            :domains="stackedEnergyPercentDomains"
            :dataset="energyPercentDataset"
            :dynamic-extent="dateFilter"
            :hover-date="hoverDate"
            :hover-on="hoverOn"
            :focus-date="focusDate"
            :focus-on="focusOn"
            :range="range"
            :interval="interval"
            :curve="isEnergyType ? chartEnergyCurve : chartPowerCurve"
            :y-min="energyYMin"
            :y-max="energyYMax"
            :vis-height="stackedAreaHeight"
            :zoomed="zoomed"
            :x-guides="xGuides"
            :x-axis-dy="xAxisDy"
            :y-axis-unit="'%'"
            :mobile-screen="tabletBreak"
            :incomplete-intervals="incompleteIntervals"
            :compare-dates="compareDates"
            :dataset-two="chartEnergyRenewablesLine ? renewablesPercentageDataset : []"
            :dataset-two-colour="renewablesLineColour"
            class="vis-chart"
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
            @click="handleChartLabelClick">
            <div class="chart-label">
              <span @click.stop="toggleChart('chartEmissionsVolume')">
                <i
                  :class="{
                    'fa-caret-down': chartEmissionsVolume,
                    'fa-caret-right': !chartEmissionsVolume
                  }"
                  class="fal fa-fw" />
                <strong>Emissions Volume</strong>
              </span>
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
            :y-axis-ticks="5"
            class="emissions-volume-vis vis-chart"
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
import _includes from 'lodash.includes'
import _cloneDeep from 'lodash.clonedeep'
import Draggable from 'vuedraggable'
import { saveAs } from 'file-saver'

import PageAllMixin from '~/mixins/page-all.js'
import PageEnergyMixin from '~/mixins/page-energy.js'
import PageEnergyCreatedMixin from '~/mixins/page-energy-created.js'
import PerfLogMixin from '~/mixins/perf-log.js'

import { EMISSIONS } from '~/constants/emissions.js'
import EventBus from '~/plugins/eventBus.js'
import PerfTime from '~/plugins/perfTime.js'
import Http from '~/services/Http.js'
import DateDisplay from '~/services/DateDisplay.js'
import Data from '~/services/Data.js'
import EnergyDataTransform from '~/services/dataTransform/Energy.js'
import Domain from '~/services/Domain.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'
import AxisTicks from '@/services/axisTicks.js'

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
import ChartWrapper from '@/components/Vis/ChartWrapper'
import MultiLine from '@/components/Vis/MultiLine'
import ChartOptions from '@/components/Vis/ChartOptions'
import DateBrush from '@/components/Vis/DateBrush'
import ChartHeader from '@/components/Vis/ChartHeader'

export default {
  layout: 'main',

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
    EnergyCompare,
    ChartWrapper,
    MultiLine,
    ChartOptions,
    DateBrush,
    ChartHeader
  },

  mixins: [PageAllMixin, PageEnergyMixin, PerfLogMixin, PageEnergyCreatedMixin],

  computed: {
    queryStart() {
      return this.$route.query.start
    },
    queryEnd() {
      return this.$route.query.end
    },
    queryInterval() {
      return this.$route.query.interval
    },
    queryRange() {
      return this.$route.query.range
    },
    queryDates() {
      if (this.queryStart) {
        return {
          startDate: moment(this.queryStart).valueOf(),
          endDate: this.queryEnd ? moment(this.queryEnd).valueOf() : null,
          range: this.queryRange ? this.queryRange : '7D',
          interval: this.queryInterval ? this.queryInterval : '30m'
        }
      }
      return null
    },
    queryYearWeek() {
      function zeroFill(number, width) {
        width -= number.toString().length
        if (width > 0) {
          return (
            new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number
          )
        }
        return number + ''
      }

      const queries = []
      const interval = this.queryInterval ? this.queryInterval : '30m'

      if (interval === '30m') {
        const startWeekNum = this.queryStart
          ? moment(this.queryStart).week()
          : null
        const endWeekNum = this.queryEnd ? moment(this.queryEnd).week() : null

        if (endWeekNum) {
          for (let i = startWeekNum; i <= endWeekNum; i++) {
            const week = zeroFill(i, '2')
            queries.push(
              `/power/history/5minute/${this.regionId}_${moment(
                this.queryStart
              ).year()}W${week}.json`
            )
          }
        } else if (startWeekNum && !endWeekNum) {
          const week = zeroFill(startWeekNum, '2')
          queries.push(
            `/power/history/5minute/${this.regionId}_${moment(
              this.queryStart
            ).year()}W${week}.json`
          )
        }
      } else if (interval === 'day') {
        const isProd = this.hostEnv === 'prod'
        const startYear = this.queryStart
          ? moment(this.queryStart).year()
          : null
        const endYear = this.queryEnd ? moment(this.queryEnd).year() : null
        const prepend = isProd ? '/testing/' : '/testing/v2/'

        this.$store.commit('range', '1Y')
        this.$store.commit('interval', 'Day')
        for (let i = startYear; i <= endYear; i++) {
          queries.push(`${prepend}${this.regionId}/energy/daily/${i}.json`)
        }
      }

      console.log(queries)
      return queries.length > 0 ? queries : null
    },
    zoomed() {
      return this.dateFilter.length !== 0
    },
    isEnergyType() {
      return this.type === 'energy'
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
    groupDomains() {
      const dict = this.fuelTechGroup
      const domains = this.energyDomains
      return Domain.parseDomains(domains, dict, 'energy')
    },
    groupEnergyPercentDomains() {
      const dict = this.fuelTechGroup
      const domains = this.energyPercentDomains
      return Domain.parseDomains(domains, dict, 'energy_percent')
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
    stackedEnergyPercentDomains() {
      const hidden = this.hiddenFuelTechs
      let domains =
        this.groupEnergyPercentDomains.length > 0
          ? this.groupEnergyPercentDomains
          : this.energyPercentDomains
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
      function getSeasonStartMonth(month) {
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

      function getQuarterStartMonth(month) {
        switch (month) {
          case 0:
          case 1:
          case 2:
            return 0

          case 3:
          case 4:
          case 5:
            return 3

          case 6:
          case 7:
          case 8:
            return 6

          case 9:
          case 10:
          case 11:
            return 9

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

      function getQuarterLabel(month) {
        switch (month) {
          case 0:
            return 'Q1'
          case 3:
            return 'Q2'
          case 6:
            return 'Q3'
          case 9:
            return 'Q4'
        }
      }

      if (this.dataset.length < 1) return []

      let dStart = this.dataset[0].date
      let dStartMoment = moment(dStart)
      const dEnd = this.dataset[this.dataset.length - 1].date
      const actualStartDate = this.dataset[0]._actualStartDate
      const aSD = new Date(actualStartDate).setHours(0)
      const actualLastDate = this.dataset[0]._actualLastDate
      let aLD = new Date(actualLastDate).setHours(0)

      if (this.interval === 'Week') {
        const incompletes = []
        const filtered = this.dataset.filter(d => d._isIncompleteBucket)
        filtered.forEach(f => {
          incompletes.push({
            start: f.date,
            end: moment(f.date)
              .add(1, 'week')
              .valueOf()
          })
        })

        return incompletes
      }

      if (this.range === '1Y' && this.interval === 'Month') {
        const incompletes = []
        const filtered = this.dataset.filter(d => d._isIncompleteBucket)
        filtered.forEach(f => {
          incompletes.push({
            start: f.date,
            end: moment(f.date)
              .add(1, 'month')
              .valueOf()
          })
        })
        return incompletes
      }

      if (this.interval === 'Season' || this.interval === 'Quarter') {
        const isFilter = !this.filterPeriod || this.filterPeriod !== 'All'
        if (!isFilter) {
          const incompletes = []
          const filtered = this.dataset.filter(d => d._isIncompleteBucket)
          filtered.forEach(f => {
            incompletes.push({
              start: f.date,
              end: moment(f.date)
                .add(3, 'month')
                .valueOf()
            })
          })
          return incompletes
        } else {
          const incompletes = []
          aLD = moment(aLD).add(1, 'year')
          const isSeason = this.interval === 'Season'
          const actualStartMonth = isSeason
            ? getSeasonStartMonth(new Date(aSD).getMonth())
            : getQuarterStartMonth(new Date(aSD).getMonth())
          const actualStartLabel = isSeason
            ? getSeasonLabel(actualStartMonth)
            : getQuarterLabel(actualStartMonth)
          const actualEndMonth = isSeason
            ? getSeasonStartMonth(new Date(aLD).getMonth())
            : getQuarterStartMonth(new Date(aLD).getMonth())
          const actualEndLabel = isSeason
            ? getSeasonLabel(actualEndMonth)
            : getQuarterLabel(actualEndMonth)

          if (actualStartLabel === this.filterPeriod) {
            if (moment(aSD).month() > moment(dStart).month()) {
              incompletes.push({
                start: dStart,
                end: moment(dStart)
                  .add(1, 'year')
                  .valueOf()
              })
            }
          }
          if (actualEndLabel === this.filterPeriod) {
            const newDEnd = moment(dEnd).add(2, 'month')
            if (aLD.month() < newDEnd.month()) {
              incompletes.push({
                start: moment(dEnd)
                  .subtract(1, 'year')
                  .valueOf(),
                end: dEnd
              })
            }
          }
          return incompletes
        }
      }

      if (this.interval === 'Half Year') {
        const incompletes = []
        const filtered = this.dataset.filter(d => d._isIncompleteBucket)
        filtered.forEach(f => {
          incompletes.push({
            start: f.date,
            end: moment(f.date)
              .add(6, 'month')
              .valueOf()
          })
        })
        return incompletes
      }

      if (this.interval === 'Fin Year' || this.interval === 'Year') {
        const incompletes = []
        const filtered = this.dataset.filter(d => d._isIncompleteBucket)
        filtered.forEach(f => {
          incompletes.push({
            start: f.date,
            end: moment(f.date)
              .add(1, 'year')
              .valueOf()
          })
        })
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
      let dataset = this.dataset
      if (this.chartEnergyType === 'proportion') {
        dataset = this.energyPercentDataset
      }
      if (
        this.chartEnergyType === 'line' &&
        this.chartEnergyYAxis === 'percentage'
      ) {
        dataset = this.energyGrossPercentDataset
      }
      return dataset.find(d => d.date === time)
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
      let find = null
      if (
        this.chartEnergyType === 'proportion' ||
        (this.chartEnergyType === 'line' &&
          this.chartEnergyYAxis === 'percentage')
      ) {
        find = this.stackedEnergyPercentDomains.find(
          d => d.id === this.hoverDomain
        )
      } else {
        find = this.stackedAreaDomains.find(d => d.id === this.hoverDomain)
      }
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
      let find = null
      if (
        this.chartEnergyType === 'proportion' ||
        (this.chartEnergyType === 'line' &&
          this.chartEnergyYAxis === 'percentage')
      ) {
        find = this.stackedEnergyPercentDomains.find(
          d => d.id === this.hoverDomain
        )
      } else {
        find = this.stackedAreaDomains.find(d => d.id === this.hoverDomain)
      }
      return find ? find.colour : null
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
    hoverRenewables() {
      const isGeneration = this.percentContributionTo === 'generation'
      if (this.hoverOrFocusData) {
        return isGeneration
          ? this.hoverOrFocusData._totalGenerationRenewablesPercentage
          : this.hoverOrFocusData._totalDemandRenewablesPercentage
      } else {
        return null
      }
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
        const hoverDate = this.hoverOrFocusData.date
        const hoverEmissionsVol = this.emissionsVolumeDataset.find(d => {
          return d.date === hoverDate
        })
        this.emissionStackedAreaDomains.forEach(domain => {
          const id = domain.id
          if (
            !isGeneration ||
            (isGeneration &&
              domain.fuelTech !== 'imports' &&
              domain.fuelTech !== 'exports')
          ) {
            total += hoverEmissionsVol[id]
          }
        })
      }
      return total
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
    },
    isRenewableLineOnly() {
      return (
        this.chartEnergyRenewablesLine && this.stackedAreaDomains.length === 0
      )
    },
    tickFormat() {
      switch (this.interval) {
        case 'Day':
          return AxisTimeFormats.intervalDayTimeFormat
        case 'Week':
          return AxisTimeFormats.intervalWeekTimeFormat
        case 'Month':
          return this.range === 'ALL'
            ? AxisTimeFormats.rangeAllIntervalMonthTimeFormat
            : AxisTimeFormats.intervalMonthTimeFormat
        case 'Fin Year':
          return d => {
            const year = d.getFullYear() + 1 + ''
            return `FY${year.substr(2, 2)}`
          }
        default:
          return AxisTimeFormats.defaultFormat
      }
    },
    secondTickFormat() {
      switch (this.interval) {
        case 'Day':
          return AxisTimeFormats.intervalDaySecondaryTimeFormat
        case 'Week':
          return AxisTimeFormats.intervalWeekSecondaryTimeFormat
        default:
          return AxisTimeFormats.secondaryFormat
      }
    },
    xTicks() {
      return AxisTicks(this.range, this.interval, this.zoomed)
    },
    multiLineEnergyDataset() {
      return this.dataset.map(d => {
        const obj = {
          date: d.date,
          _isIncompleteBucket: d._isIncompleteBucket
        }
        this.stackedAreaDomains.forEach(domain => {
          if (domain.category === 'load') {
            obj[domain.id] = -d[domain.id]
          } else {
            obj[domain.id] = d[domain.id]
          }
        })
        return obj
      })
    }
  },

  watch: {
    groupDomains(domains) {
      const perfTime = new PerfTime()
      perfTime.time()
      if (domains.length > 0) {
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
      perfTime.timeEnd(this.getGroupPerfLabel())
    },
    groupEnergyPercentDomains(domains) {
      if (domains.length > 0) {
        this.originalDataset = this.updateDatasetGroups(
          this.originalDataset,
          domains
        )
        this.updateDataset(this.filterPeriod)
      }
    },
    groupMarketValueDomains(domains) {
      if (domains.length > 0) {
        this.originalDataset = this.updateDatasetGroups(
          this.originalDataset,
          domains
        )
        this.updateDataset(this.filterPeriod)
      }
    },
    groupEmissionDomains(domains) {
      if (domains.length > 0) {
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
    stackedEnergyPercentDomains(updated) {
      this.$store.commit('export/stackedEnergyPercentDomains', updated)
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

    fetchDataByYearWeek() {
      const urls = this.queryYearWeek

      if (urls && urls.length > 0) {
        Http(urls)
          .then(responses => {
            this.handleResponses(responses)
          })
          .catch(e => {
            console.error(e)
          })
      } else {
        console.warn('fetchDataByYearWeek', 'No urls provided')
      }
    },

    handleResponses(responses) {
      // !!! Removing Vol weighted Price after requesting ALL data
      // - due to incorrect data
      if (this.range === 'ALL') {
        responses.forEach(r => {
          const rData = r.data || r
          const findIndex = rData.findIndex(
            d => d.type === 'volume_weighted_price'
          )
          if (findIndex !== -1) {
            rData.splice(findIndex, 1)
          }
        })
      }

      this.responses = responses
      const perfTime = new PerfTime()
      perfTime.time()
      this.updateDomains(responses)
      EnergyDataTransform.mergeResponses(
        responses,
        this.energyDomains,
        this.marketValueDomains,
        this.temperatureDomains,
        this.priceDomains,
        this.emissionDomains,
        this.range,
        this.interval,
        null,
        this.queryDates
      ).then(dataset => {
        this.readyDataset(dataset)
        perfTime.timeEnd(this.getPerfLabel())
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
      if (this.groupEnergyPercentDomains.length > 0) {
        updated = this.updateDatasetGroups(
          updated,
          this.groupEnergyPercentDomains
        )
      }

      this.dataset = updated
      this.originalDataset = updated

      this.updatedFilteredDataset(updated)
      this.updateDataset(this.filterPeriod)
      this.updateYMinMax()
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
      this.energyPercentDomains = Domain.getDomainObjs(
        this.regionId,
        this.fuelTechEnergyOrder,
        'energy_percent'
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
      const isPowerRange = range === '1D' || range === '3D' || range === '7D'
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

      if (this.regionId === 'wem' && isPowerRange) {
        interval = '30m'
      }
      this.setDateFilter([])
      this.compareData = []
      this.$store.dispatch('compareDates', [])
      this.$store.dispatch('interval', interval)
      this.$store.dispatch('range', range)
      this.$router.push({
        path: '',
        params: { region: this.regionId },
        query: {}
      })
      this.fetchData(this.regionId, range)
    },

    handleIntervalChange(interval) {
      this.$store.dispatch('focusOn', false)
      this.$store.dispatch('compareDifference', false)
      this.compareData = []
      this.$store.dispatch('compareDates', [])
      this.$store.dispatch('interval', interval)
      const perfTime = new PerfTime()
      perfTime.time()
      EnergyDataTransform.mergeResponses(
        this.responses,
        this.energyDomains,
        this.marketValueDomains,
        this.temperatureDomains,
        this.priceDomains,
        this.emissionDomains,
        this.range,
        interval,
        null,
        this.queryDates
      ).then(dataset => {
        this.readyDataset(dataset)
        perfTime.timeEnd(this.getPerfLabel())
      })
    },

    handleDatasetFilter(dateRange) {
      if (dateRange && dateRange.length > 0) {
        let startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        const endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )
        if (this.interval === 'Fin Year') {
          startTime = moment(startTime).add(1, 'year')
        }
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

    resetZoom() {
      this.setDateFilter([])
      this.filteredDataset = this.dataset
    },

    handleDateOver(evt, date) {
      const isFilter = !this.filterPeriod || this.filterPeriod !== 'All'
      if (date && this.interval === 'Fin Year') {
        if (date.getMonth() >= 6) {
          date.setFullYear(date.getFullYear() + 1)
        }
      }
      if (
        isFilter &&
        date &&
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
      this.hoverDate = closestDate
    },

    handleDomainOver(domain) {
      this.hoverDomain = domain
    },

    handleEmissionsDomainOver(domain) {
      this.hoverEmissionVolumeDomain = domain
    },

    handleVisMouseMove(date) {
      this.hoverDate = date
    },

    handleVisEnter() {
      this.hoverOn = true
      this.$store.commit('visInteract/isHovering', true)
    },

    handleVisLeave() {
      this.hoverOn = false
      this.hoverDate = null
      this.$store.commit('visInteract/isHovering', false)
    },

    toggleChart(chartName) {
      this.$store.commit(`visInteract/${chartName}`, !this[chartName])
    },

    handleChartOptionsChange(chartName, show) {
      const chartOptions = `${chartName}Options`
      this[chartOptions] = show
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
    },

    handleChartLabelClick() {
      const prefix = this.emissionsVolumePrefix
      const shouldUseNextPrefix = !this.useEVnextPrefix
      this.$store.dispatch('si/useEVnextPrefix', shouldUseNextPrefix)

      if (shouldUseNextPrefix) {
        this.$store.dispatch(
          'si/emissionsVolumePrefix',
          Data.siNextPrefix(prefix)
        )
      } else {
        this.$store.dispatch(
          'si/emissionsVolumePrefix',
          Data.siPreviousPrefix(prefix)
        )
      }

      this.recalculateAfterPrefixChanged()
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
  margin: 0.5rem auto 0;
  position: relative;
  @include desktop {
    margin-top: 1rem;
  }
}
.vis-chart {
  // margin-right: 10px;
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
.reset-btn {
  position: absolute;
  top: 39px;
  right: 24px;
}
</style>
