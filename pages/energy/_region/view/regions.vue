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
          :zoom-btn="zoomRange.length > 0"
          :show-chart="chartEnergy" 
          state-name="chartEnergy"
          @date-filter="handleDateFilter">
          <template v-slot:header>
            <strong>Energy</strong>
          </template>

          <multi-line
            v-show="chartEnergy"
            :line-domains="domains"
            :dataset="energyDataset"
            :y-max="energyMax"
            :date-hovered="dateHovered"
            :zoom-range="zoomRange"
            :ticks="ticks"
            :x-shades="xShades"
            @date-hover="handleDateHover"
            @enter="handleEnter"
            @leave="handleLeave" />
          <date-brush
            v-show="chartEnergy"
            :dataset="energyDataset"
            :zoom-range="zoomRange" 
            :ticks="ticks"
            :tick-format="tickFormat"
            :second-tick-format="secondTickFormat"
            class="date-brush"
            @date-hover="handleDateHover"
            @date-filter="handleDateFilter" />
        </chart-wrapper>

        <chart-wrapper 
          v-if="hasEmissions"
          :show-chart="chartEmissionsVolume" 
          state-name="chartEmissionsVolume">
          <template v-slot:header>
            <strong>Emissions Volume</strong>
          </template>

          <multi-line
            v-show="chartEmissionsVolume"
            :line-domains="domains"
            :dataset="emissionVolDataset"
            :y-max="emissionMax"
            :date-hovered="dateHovered"
            :zoom-range="zoomRange"
            :ticks="ticks"
            :x-shades="xShades"
            @date-hover="handleDateHover"
            @enter="handleEnter"
            @leave="handleLeave" />
        </chart-wrapper>
        <chart-wrapper 
          v-if="hasEmissions"
          :show-chart="chartEmissionsIntensity" 
          state-name="chartEmissionsIntensity">
          <template v-slot:header>
            <strong>Emissions Intensity</strong>
          </template>

          <multi-line
            v-show="chartEmissionsIntensity"
            :line-domains="domains"
            :dataset="emissionIntDataset"
            :y-max="1200"
            :date-hovered="dateHovered"
            :zoom-range="zoomRange"
            :ticks="ticks"
            :x-shades="xShades"
            @date-hover="handleDateHover"
            @enter="handleEnter"
            @leave="handleLeave" />
        </chart-wrapper>

        <chart-wrapper 
          :show-chart="chartPrice" 
          state-name="chartPrice">
          <template v-slot:header>
            <strong>Price</strong>
          </template>

          <multi-line
            v-show="chartPrice"
            :line-domains="domains"
            :dataset="priceDataset"
            :y-max="priceMax"
            :y-min="priceMin"
            :date-hovered="dateHovered"
            :zoom-range="zoomRange"
            :ticks="ticks"
            :x-shades="xShades"
            @date-hover="handleDateHover"
            @enter="handleEnter"
            @leave="handleLeave" />
        </chart-wrapper>

        <chart-wrapper 
          :show-chart="chartTemperature" 
          state-name="chartTemperature">
          <template v-slot:header>
            <strong>Temperature</strong>
          </template>

          <multi-line
            v-show="chartTemperature"
            :line-domains="domains"
            :dataset="temperatureDataset"
            :y-max="40"
            :date-hovered="dateHovered"
            :zoom-range="zoomRange"
            :ticks="ticks"
            :x-shades="xShades"
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

export default {
  layout: 'main',
  components: {
    DataOptionsBar,
    RegionsTable,
    Datatable,
    MultiLine,
    DateBrush,
    ChartWrapper
  },
  data() {
    return {
      dateHovered: null,
      zoomRange: []
    }
  },
  computed: {
    ...mapGetters({
      regions: 'region/regions',
      energyDataset: 'region/energyDataset',
      emissionVolDataset: 'region/emissionVolDataset',
      emissionIntDataset: 'region/emissionIntDataset',
      temperatureDataset: 'region/temperatureDataset',
      priceDataset: 'region/priceDataset',
      hasEmissions: 'region/hasEmissions',
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      chartEnergy: 'chartEnergy',
      chartEmissionsVolume: 'chartEmissionsVolume',
      chartEmissionsIntensity: 'chartEmissionsIntensity',
      chartPrice: 'chartPrice',
      chartTemperature: 'chartTemperature'
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
    energyMax() {
      return max(this.energyDataset, d => d._highest)
    },
    emissionMax() {
      return max(this.emissionVolDataset, d => d._highest)
    },
    temperatureMax() {
      return max(this.temperatureDataset, d => d._highest)
    },
    priceMin() {
      return min(this.priceDataset, d => d._lowest)
    },
    priceMax() {
      return max(this.priceDataset, d => d._highest)
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
      return this.zoomRange.length > 0
    },
    tickFormat() {
      if (this.interval === 'Fin Year') {
        return d => {
          const year = d.getFullYear() + 1 + ''
          return `FY${year.substr(2, 2)}`
        }
      }
      return AxisTimeFormats.defaultFormat
    },
    secondTickFormat() {
      return AxisTimeFormats.secondaryFormat
    },
    ticks() {
      return AxisTicks(this.range, this.interval, this.isZoomed)
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

    handleDateHover(date) {
      this.dateHovered = DateDisplay.snapToClosestInterval(this.interval, date)
    },

    handleDateFilter(range) {
      if (range.length === 0) {
        this.zoomRange = range
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
      this.zoomRange = [startTime, endTime]
    },

    handleEnter() {
      this.$store.commit('visInteract/isHovering', true)
    },
    handleLeave() {
      this.$store.commit('visInteract/isHovering', false)
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
    margin-top: -6px;
  }
}
</style>
