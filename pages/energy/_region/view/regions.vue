<template>
  <section class="">
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
          :line-domains="lineDomains"
          :dataset="datasetEnergy"
          :y-max="energyMax"
        />
        <h1>Energy Table</h1>
        <datatable :dataset="datasetEnergy"/>
      </div>

      <div class="column">
        <h1>Emissions</h1>
        <multi-line
          :line-domains="lineDomains"
          :dataset="datasetEmission"
          :y-max="emissionMax"
        />
        <h1>Emissions Table</h1>
        <datatable :dataset="datasetEmission"/>
      </div>
    </div>    
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { max } from 'd3-array'

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
  computed: {
    ...mapGetters({
      regions: 'region/regions',
      datasetEnergy: 'region/datasetEnergy',
      datasetEmission: 'region/datasetEmission',
      hostEnv: 'hostEnv',
      range: 'range',
      interval: 'interval'
    }),
    lineDomains() {
      return this.regions.map(d => {
        return {
          domain: d.id,
          colour: d.colour,
          label: d.abbr
        }
      })
    },
    energyMax() {
      return max(this.datasetEnergy, d => d._highest)
    },
    emissionMax() {
      return max(this.datasetEmission, d => d._highest)
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
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  margin-top: 3rem;
}
</style>
