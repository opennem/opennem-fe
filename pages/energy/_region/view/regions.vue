<template>
  <section class="container">
    <data-options-bar
      :range="range"
      :interval="interval"
      @onRangeChange="handleRangeChange"
      @onIntervalChange="handleIntervalChange"
    />

    <div class="columns">
      <div class="column">
        <h1>Energy</h1>
        <multi-line
          :line-domains="domains"
          :dataset="energyDataset"
          :y-max="energyMax"
          :date-hovered="dateHovered"
          @date-hover="handleDateHover"
        />

        <div 
          v-if="hasEmissions" 
          class="emissions-vis">
          <h1>Emissions</h1>
          <multi-line
            :line-domains="domains"
            :dataset="emissionVolDataset"
            :y-max="emissionMax"
            :date-hovered="dateHovered"
            @date-hover="handleDateHover"
          />
        </div>
        
        <h1>Price</h1>
        <multi-line
          :line-domains="domains"
          :dataset="priceDataset"
          :y-max="priceMax"
          :y-min="priceMin"
          :curve="'step'"
          :date-hovered="dateHovered"
          @date-hover="handleDateHover"
        />
        <!-- <datatable :dataset="priceDataset"/> -->

        <h1>Temperature</h1>
        <multi-line
          :line-domains="domains"
          :dataset="temperatureDataset"
          :y-max="40"
          :date-hovered="dateHovered"
          @date-hover="handleDateHover"
        />
        <!-- <h1>Energy Table</h1>
        <datatable :dataset="energyDataset"/> -->
      </div>

      <div class="column is-one-third">
        <regions-table
          :domains="domains"
          :dataset="combinedDataset"
          :date-hovered="dateHovered"
          class="regions-table"
        />
      </div>
    </div>    
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { min, max } from 'd3-array'
import DateDisplay from '@/services/DateDisplay.js'
import RegionsTable from '@/components/Energy/RegionsTable'
import Datatable from '@/components/Vis/Datatable'
import DataOptionsBar from '@/components/ui/DataOptionsBar'
import MultiLine from '@/components/Vis/MultiLine'

export default {
  layout: 'main',
  components: {
    DataOptionsBar,
    RegionsTable,
    Datatable,
    MultiLine
  },
  data() {
    return {
      dateHovered: null
    }
  },
  computed: {
    ...mapGetters({
      regions: 'region/regions',
      energyDataset: 'region/energyDataset',
      emissionVolDataset: 'region/emissionVolDataset',
      temperatureDataset: 'region/temperatureDataset',
      priceDataset: 'region/priceDataset',
      hasEmissions: 'region/hasEmissions',
      range: 'range',
      interval: 'interval'
    }),
    domains() {
      return this.regions.map(d => {
        return {
          domain: d.id,
          colour: d.colour,
          label: d.abbr
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
        temperature: this.temperatureDataset,
        price: this.priceDataset
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

    handleDateHover(date) {
      this.dateHovered = DateDisplay.snapToClosestInterval(this.interval, date)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  margin-top: 1rem;
  padding: 1rem;
  max-width: none;

  ::v-deep .data-options-bar {
    margin-bottom: 1rem;
    padding-left: 0;
  }

  .regions-table {
    position: sticky;
    top: 2rem;
  }
}
</style>
