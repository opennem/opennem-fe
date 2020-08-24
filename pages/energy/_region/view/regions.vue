<template>
  <section class="regions-compare">
    <data-options-bar
      :range="range"
      :interval="interval"
      @onRangeChange="handleRangeChange"
      @onIntervalChange="handleIntervalChange"
    />

    <div class="vis-table-container">
      <div class="vis-container">
        <chart-wrapper 
          :zoom-btn="chartEnergy && dateFilter.length > 0"
          :show-chart="chartEnergy"
          :hover-values="hoverEnergyValues"
          :formatter="$options.filters.formatValue"
          state-name="chartEnergy"
          @date-filter="handleDateFilter">
          <template v-slot:header>
            <strong>Energy</strong>
          </template>
          <template v-slot:datetime>
            {{ hoverDisplayDate }}
          </template>

          <multi-line
            v-show="chartEnergy"
            :toggled="chartEnergy"
            :domains1="filteredDomains"
            :highlight-domain="hoveredRegion"
            :dataset1="energyDataset"
            :y1-max="energyMax"
            :date-hovered="dateHovered"
            :zoom-range="dateFilter"
            :x-ticks="xTicks"
            :x-shades="xShades"
            :cursor-anchor="cursorAnchor"
            :draw-incomplete-bucket="false"
            @date-hover="handleDateHover"
            @enter="handleEnter"
            @leave="handleLeave" />
          <date-brush
            :dataset="energyDataset"
            :zoom-range="dateFilter" 
            :x-ticks="xTicks"
            :tick-format="tickFormat"
            :second-tick-format="secondTickFormat"
            :class="{'has-energy-chart': chartEnergy}"
            class="date-brush"
            @date-hover="handleDateHover"
            @date-filter="handleDateFilter"
            @enter="handleEnter"
            @leave="handleLeave" />
        </chart-wrapper>

        <chart-wrapper 
          v-if="hasEmissions"
          :show-chart="chartEmissionsVolume"
          :hover-values="hoverEmissionVolValues"
          :formatter="$options.filters.formatValue"
          state-name="chartEmissionsVolume">
          <template v-slot:header>
            <strong>Emissions Volume</strong>
          </template>
          <template v-slot:datetime>
            {{ hoverDisplayDate }}
          </template>

          <multi-line
            v-show="chartEmissionsVolume"
            :toggled="chartEmissionsVolume"
            :domains1="filteredDomains"
            :highlight-domain="hoveredRegion"
            :dataset1="emissionVolDataset"
            :y1-max="emissionMax"
            :date-hovered="dateHovered"
            :zoom-range="dateFilter"
            :x-ticks="xTicks"
            :x-shades="xShades"
            :cursor-anchor="cursorAnchor"
            :draw-incomplete-bucket="false"
            @date-hover="handleDateHover"
            @enter="handleEnter"
            @leave="handleLeave" />
        </chart-wrapper>
        <chart-wrapper 
          v-if="hasEmissions"
          :show-chart="chartEmissionsIntensity"
          :hover-values="hoverEmissionIntValues"
          :formatter="$options.filters.formatValue"
          state-name="chartEmissionsIntensity">
          <template v-slot:header>
            <strong>Emissions Intensity</strong>
          </template>
          <template v-slot:datetime>
            {{ hoverDisplayDate }}
          </template>

          <multi-line
            v-show="chartEmissionsIntensity"
            :toggled="chartEmissionsIntensity"
            :domains1="filteredDomains"
            :highlight-domain="hoveredRegion"
            :dataset1="emissionIntDataset"
            :y1-max="emissionIntMax"
            :date-hovered="dateHovered"
            :zoom-range="dateFilter"
            :x-ticks="xTicks"
            :x-shades="xShades"
            :cursor-anchor="cursorAnchor"
            :draw-incomplete-bucket="false"
            @date-hover="handleDateHover"
            @enter="handleEnter"
            @leave="handleLeave" />
        </chart-wrapper>

        <price-charts
          :price-dataset="priceDataset"
          :hover-values="hoverPriceValues"
          :hover-date="hoverDisplayDate"
          :chart-options="{
            domains: filteredDomains,
            highlightDomain: hoveredRegion,
            dateHovered,
            dateFilter,
            xTicks,
            xShades,
            cursorAnchor
          }"
          @date-hover="handleDateHover"
        />

        <chart-wrapper 
          :show-chart="chartTemperature"
          :hover-values="hoverTemperatureValues"
          :formatter="$options.filters.formatValue"
          state-name="chartTemperature">
          <template v-slot:header>
            <strong>Temperature</strong>
          </template>
          <template v-slot:datetime>
            {{ hoverDisplayDate }}
          </template>

          <multi-line
            v-show="chartTemperature"
            :toggled="chartTemperature"
            :domains1="filteredDomains"
            :highlight-domain="hoveredRegion"
            :dataset1="temperatureDataset"
            :y1-max="40"
            :date-hovered="dateHovered"
            :zoom-range="dateFilter"
            :x-ticks="xTicks"
            :x-shades="xShades"
            :cursor-anchor="cursorAnchor"
            @date-hover="handleDateHover"
            @enter="handleEnter"
            @leave="handleLeave" />
        </chart-wrapper>
      </div>

      <div class="table-container">
        <regions-table
          :domains="domains"
          :dataset="combinedDataset"
          :date-hovered="dateHovered"
          :range="range"
          :interval="interval"
        />
      </div>
    </div>    
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { min, max } from 'd3-array'
import { timeDay, timeMonday, timeMonth, timeYear } from 'd3-time'
import DateDisplay from '@/services/DateDisplay.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'
import AxisTicks from '@/services/axisTicks.js'
import RegionsTable from '@/components/SummaryTable/Regions'
import Datatable from '@/components/Vis/Datatable'
import DataOptionsBar from '@/components/ui/DataOptionsBar'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'
import ChartWrapper from '@/components/Vis/ChartWrapper'
import PriceCharts from '@/components/Energy/PriceCharts'

export default {
  layout: 'main',
  components: {
    DataOptionsBar,
    RegionsTable,
    Datatable,
    MultiLine,
    DateBrush,
    ChartWrapper,
    PriceCharts
  },
  data() {
    return {
      dateHovered: null
    }
  },
  computed: {
    ...mapGetters({
      regions: 'region/regions',
      hoveredRegion: 'region/hoveredRegion',
      filteredRegions: 'region/filteredRegions',
      energyDataset: 'region/energyDataset',
      emissionVolDataset: 'region/emissionVolDataset',
      emissionIntDataset: 'region/emissionIntDataset',
      temperatureDataset: 'region/temperatureDataset',
      priceDataset: 'region/priceDataset',
      hasEmissions: 'region/hasEmissions',
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      dateFilter: 'dateFilter',
      chartEnergy: 'chartOptionsPowerEnergy/chartShown',
      chartEmissionsVolume: 'chartOptionsEmissionsVolume/chartShown',
      chartEmissionsIntensity: 'visInteract/chartEmissionsIntensity',
      chartTemperature: 'chartOptionsTemperature/chartShown'
    }),
    domains() {
      return this.regions.map(d => {
        return {
          domain: d.id,
          colour: d.colour,
          label: d.label
        }
      })
    },
    filteredDomains() {
      return this.filteredRegions.map(d => {
        return {
          domain: d.id,
          colour: d.colour,
          label: d.label
        }
      })
    },
    energyMax() {
      return max(this.energyDataset, d => d._highest)
    },
    emissionMax() {
      return max(this.emissionVolDataset, d => d._highest)
    },
    emissionIntMax() {
      const yMax = max(this.emissionIntDataset, d => d._highest)
      return yMax < 1200 ? 1200 : yMax
    },
    temperatureMax() {
      return max(this.temperatureDataset, d => d._highest)
    },
    combinedDataset() {
      return {
        energy: this.energyDataset,
        emissionVol: this.emissionVolDataset,
        emissionInt: this.emissionIntDataset,
        temperature: this.temperatureDataset,
        price: this.priceDataset
      }
    },
    xShades() {
      if (this.energyDataset.length <= 0) {
        return []
      }
      let dStart = this.energyDataset[0].date
      const dEnd = this.energyDataset[this.energyDataset.length - 1].date

      if (this.interval === 'Day') {
        return DateDisplay.weekendGuides(dStart, dEnd)
      }
      if (this.interval === '5m' || this.interval === '30m') {
        return DateDisplay.nightGuides(dStart, dEnd)
      }
      return []
    },
    isZoomed() {
      return this.dateFilter.length > 0
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
      return AxisTicks(this.range, this.interval, this.isZoomed)
    },
    hoverEnergyValues() {
      return this.getHoverArray(this.energyDataset, this.dateHovered)
    },
    hoverEmissionVolValues() {
      return this.getHoverArray(this.emissionVolDataset, this.dateHovered)
    },
    hoverEmissionIntValues() {
      return this.getHoverArray(this.emissionIntDataset, this.dateHovered)
    },
    hoverPriceValues() {
      return this.getHoverArray(this.priceDataset, this.dateHovered)
    },
    hoverTemperatureValues() {
      return this.getHoverArray(this.temperatureDataset, this.dateHovered)
    },
    hoverDisplayDate() {
      let date = this.dateHovered
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
    cursorAnchor() {
      switch (this.interval) {
        case 'Week':
          return 'middle'
        default:
          return 'start'
      }
    }
  },
  created() {
    this.doGetAllRegions({
      range: this.range,
      interval: this.interval
    })
  },
  methods: {
    ...mapActions({
      doGetAllRegions: 'region/doGetAllRegions',
      setInterval: 'interval',
      setRange: 'range'
    }),
    handleRangeChange(range) {
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
          console.log('no range set')
      }
      this.setInterval(interval)
      this.setRange(range)
      this.doGetAllRegions({ range, interval })
    },

    handleIntervalChange(interval) {
      this.setInterval(interval)
      this.doGetAllRegions({ range: this.range, interval })
    },

    handleDateHover(evt, date) {
      this.dateHovered = DateDisplay.snapToClosestInterval(
        this.interval,
        date,
        true
      )
    },

    handleDateFilter(range) {
      if (range.length === 0) {
        this.$store.dispatch('dateFilter', range)
        return
      }

      let start = range[0],
        end = range[1]

      // if (this.interval === 'Fin Year') {
      //   if (start.getMonth() >= 6) {
      //     start.setFullYear(start.getFullYear() + 1)
      //   }
      //   if (end.getMonth() >= 6) {
      //     end.setFullYear(end.getFullYear() + 1)
      //   }
      // }

      const startTime = DateDisplay.roundToClosestInterval(
        this.interval,
        this.filterPeriod,
        start,
        'floor'
      )
      const endTime = DateDisplay.roundToClosestInterval(
        this.interval,
        this.filterPeriod,
        end,
        'ceil'
      )
      this.$store.dispatch('dateFilter', [startTime, endTime])
    },

    handleEnter() {
      this.$store.commit('visInteract/isHovering', true)
    },
    handleLeave() {
      this.$store.commit('visInteract/isHovering', false)
    },
    getHoverArray(dataset, date) {
      const find = date ? dataset.find(d => d.date === date.getTime()) : null
      return find
        ? this.filteredRegions.map(r => {
            return {
              label: r.abbr,
              colour: r.colour,
              unit: '',
              value: find[r.id]
            }
          })
        : []
    }
  }
}
</script>

<style lang="scss" scoped>
.regions-compare {
  margin: 1rem auto 0;
  max-width: 1600px;
  position: relative;

  .date-brush {
    position: relative;

    &.has-energy-chart {
      margin-top: -6px;
    }
  }
}
</style>
