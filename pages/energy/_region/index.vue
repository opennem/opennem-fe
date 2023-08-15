<template>
  <div class="energy-region">
    <data-options-bar
      :ranges="ranges"
      :intervals="intervals"
      :range="range"
      :interval="interval"
      :filter-period="filterPeriod"
      @queryChange="handleQueryChange"
      @rangeChange="handleRangeChange"
      @intervalChange="handleIntervalChange"
      @filterPeriodChange="handleFilterPeriodChange"
    />
    <transition name="fade">
      <div 
        v-if="!ready" 
        class="vis-table-container loading-containers">
        <div 
          class="vis-container" 
          :style="{ width: `${visWidth}${widthUnit}`}">
          <div 
            class="loader-block" 
            style="height: 30px" />
          <div 
            class="loader-block" 
            style="height: 400px" />
        </div>
        <div 
          class="table-container" 
          :style="{ width: `${tableWidth}${widthUnit}`}">
          <div 
            class="loader-block" 
            style="height: 30px" />
          <div 
            class="loader-block" 
            style="height: 400px" />
        </div>
      </div>
    </transition>
    <div 
      v-if="ready"
      ref="visTableContainer"
      class="vis-table-container">
      <vis-section
        :date-hover="hoverDate"
        :on-hover="isHovering"
        :style="{ width: `${visWidth}${widthUnit}`}"
        :class="{ dragging: dragging }"
        class="vis-container"
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering"
      />
      <Divider 
        :allow-y="false"
        :vertical="true"
        @dragging="(d) => dragging = d" 
        @dragged="onDragged" />
      <summary-section
        :hover-date="hoverDate"
        :is-hovering="isHovering"
        :class="{ dragging: dragging }"
        :style="{ width: `${tableWidth}${widthUnit}`}"
        class="table-container"
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import _includes from 'lodash.includes'
import EventBus from '~/plugins/eventBus.js'
import * as SI from '@/constants/si'
import { isPowerRange, RANGES, RANGE_INTERVALS } from '@/constants/ranges.js'
import {
  isValidRegion,
  getEnergyRegionLabel
} from '@/constants/energy-regions.js'
import * as FT from '@/constants/energy-fuel-techs/group-default.js'
import DataOptionsBar from '@/components/Energy/DataOptionsBar.vue'
import VisSection from '@/components/Energy/VisSection.vue'
import SummarySection from '@/components/Energy/SummarySection.vue'
import Divider from '@/components/Divider.vue'

export default {
  layout: 'main',

  head() {
    return {
      title: `: ${getEnergyRegionLabel(this.regionId)}`,
      meta: [
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: `OpenNEM: ${getEnergyRegionLabel(this.regionId)}`
        },
        {
          hid: 'twitter:image:src',
          name: 'twitter:image:src',
          content: this.cardFilename
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: `OpenNEM: ${getEnergyRegionLabel(this.regionId)}`
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
    VisSection,
    SummarySection,
    Divider
  },

  data() {
    return {
      isHovering: false,
      hoverDate: null,
      baseUrl: `${this.$config.url}/images/screens/`,
      useDev: this.$config.useDev,
      ranges: RANGES,
      intervals: RANGE_INTERVALS,
      isWemOrAu: false,
      visWidth: 65,
      tableWidth: 35,
      widthUnit: '%', // px
      dragging: false
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      fuelTechGroupName: 'fuelTechGroupName',
      hiddenFuelTechs: 'hiddenFuelTechs',
      percentContributionTo: 'percentContributionTo',

      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      powerEnergyPrefix: 'regionEnergy/powerEnergyPrefix',
      currentDataset: 'regionEnergy/currentDataset',
      filteredDates: 'regionEnergy/filteredDates',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      domainPowerEnergy: 'regionEnergy/domainPowerEnergy',

      query: 'app/query',
      showFeatureToggle: 'app/showFeatureToggle'
    }),
    regionId() {
      return this.$route.params.region
    },
    cardFilename() {
      return this.useDev
        ? `${this.baseUrl}opennem-dev.png`
        : `${this.baseUrl}opennem-${this.regionId}.png`
    },

    property() {
      return this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
    },
    calculateByGeneration() {
      return this.percentContributionTo === 'generation'
    },

    emissionsDomains() {
      const domains = this.currentDomainEmissions.filter(
        (d) => d.category !== FT.LOAD || d.fuelTech === FT.EXPORTS
      )
      const hidden = this.hiddenFuelTechs
      return domains
        ? domains.filter((d) => !_includes(hidden, d[this.property]))
        : []
    },
    powerEnergyDomains() {
      const domains = this.currentDomainPowerEnergy
      const hidden = this.hiddenFuelTechs
      return domains.filter((d) => !_includes(hidden, d[this.property]))
    }
  },

  watch: {
    showFeatureToggle(show) {
      if (!show) {
        this.doGetRegionDataByRangeInterval({
          region: this.regionId,
          range: this.range,
          interval: this.interval,
          period: this.filterPeriod,
          groupName: this.fuelTechGroupName
        })
      }
    },
    range(curr, prev) {
      this.setCompareDifference(false)
      this.doUpdateTickFormats({
        range: curr,
        interval: this.interval,
        filterPeriod: this.filterPeriod
      })
      if (isPowerRange(curr) && isPowerRange(prev)) {
        this.doUpdateDatasetByFilterRange({
          range: curr,
          interval: this.interval
        })
      } else {
        this.doGetRegionDataByRangeInterval({
          region: this.regionId,
          range: curr,
          interval: this.interval,
          period: this.filterPeriod,
          groupName: this.fuelTechGroupName
        })
      }
    },
    interval(interval) {
      this.setCompareDifference(false)
      this.doUpdateTickFormats({
        range: this.range,
        interval,
        filterPeriod: this.filterPeriod
      })
      this.doUpdateDatasetByInterval({ range: this.range, interval })
    },
    filteredDates(dates) {
      this.doUpdateXTicks({
        range: this.range,
        interval: this.interval,
        isZoomed: dates.length > 0,
        filterPeriod: this.filterPeriod
      })
    },
    filterPeriod(period) {
      this.doUpdateDatasetByFilterPeriod({
        range: this.range,
        interval: this.interval,
        period
      })

      this.doUpdateXTicks({
        range: this.range,
        interval: this.interval,
        isZoomed: this.filteredDates.length > 0,
        filterPeriod: period
      })
    },
    fuelTechGroupName(groupName) {
      this.doUpdateDatasetByGroup({ groupName })
    },
    currentDataset(dataset) {
      if (dataset.length > 0) {
        this.doUpdateXGuides({
          interval: this.interval,
          start: dataset[0].time,
          end: dataset[dataset.length - 1].time
        })
        this.updateEmissionsData()
      }
    },
    powerEnergyPrefix(prefix) {
      this.doSetChartEnergyUnitPrefix(prefix)
    },
    calculateByGeneration() {
      this.updateEmissionsData()
    },
    hiddenFuelTechs() {
      this.updateEmissionsData()
    }
  },

  created() {
    this.setXGuides([])
    this.setYGuides([])

    if (isValidRegion(this.regionId)) {
      this.$store.dispatch('currentView', 'energy')
      this.setEmissionsVolumePrefix('')
      this.setEmissionsVolumeDisplayPrefix(SI.BASE)

      this.isWemOrAu = this.regionId === 'wem' || this.regionId === 'au'
      if (this.sWemOrAu && !this.isEnergyType) {
        this.setInterval('30m')
      }
      this.doGetRegionDataByRangeInterval({
        region: this.regionId,
        range: this.range,
        interval: this.interval,
        period: this.filterPeriod,
        groupName: this.fuelTechGroupName
      })
    } else {
      this.$router.push({
        params: { region: 'nem' },
        query: this.query
      })
    }
  },

  mounted() {
    if (window.innerWidth < 1024) {
      this.setVisTableWidthUnit(100, 100, '%')
    }

    this.doUpdateTickFormats({
      range: this.range,
      interval: this.interval,
      filterPeriod: this.filterPeriod
    })
    this.doUpdateXTicks({
      range: this.range,
      interval: this.interval,
      isZoomed: this.filteredDates.length > 0,
      filterPeriod: this.filterPeriod
    })

    window.addEventListener(
      'resize',
      this.handleResize
    )
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    ...mapActions({
      doGetRegionDataByRangeInterval:
        'regionEnergy/doGetRegionDataByRangeInterval',
      doUpdateDatasetByInterval: 'regionEnergy/doUpdateDatasetByInterval',
      doUpdateDatasetByGroup: 'regionEnergy/doUpdateDatasetByGroup',
      doUpdateDatasetByFilterRange: 'regionEnergy/doUpdateDatasetByFilterRange',
      doUpdateDatasetByFilterPeriod:
        'regionEnergy/doUpdateDatasetByFilterPeriod',
      doUpdateEmissionIntensityDataset:
        'energy/emissions/doUpdateEmissionIntensityDataset',
      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats',
      doUpdateXTicks: 'visInteract/doUpdateXTicks',
      doSetChartEnergyUnitPrefix:
        'chartOptionsPowerEnergy/doSetChartEnergyUnitPrefix'
    }),
    ...mapMutations({
      setCompareDifference: 'compareDifference',
      setRange: 'range',
      setInterval: 'interval',
      setFilterPeriod: 'filterPeriod',
      setQuery: 'app/query',

      setXGuides: 'visInteract/xGuides',
      setYGuides: 'visInteract/yGuides',

      setEmissionsVolumePrefix: 'chartOptionsEmissionsVolume/chartUnitPrefix',
      setEmissionsVolumeDisplayPrefix: 'chartOptionsEmissionsVolume/chartDisplayPrefix'
    }),

    setVisTableWidthUnit(vis, table, unit) {
      this.visWidth = vis
      this.tableWidth = table
      this.widthUnit = unit
    },

    updateEmissionsData() {
      this.doUpdateEmissionIntensityDataset({
        datasetAll: this.currentDataset,
        isCalculateByGeneration: this.calculateByGeneration,
        emissionsDomains: this.emissionsDomains,
        powerEnergyDomains: this.powerEnergyDomains,
        domainPowerEnergy: this.domainPowerEnergy,
        isEnergyType: this.isEnergyType,
        isWemOrAu: this.isWemOrAu
      })
    },

    handleDateHover(date) {
      this.hoverDate = date
    },
    handleIsHovering(hover) {
      this.isHovering = hover
    },
    handleQueryChange(query) {
      this.$router.push({
        params: { region: this.regionId },
        query
      })

      this.setQuery(query)
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

    onDragged({ clientX }) {
      const e = this.$refs.visTableContainer
      const visWidth = clientX
      const tableWidth = e.offsetWidth - clientX
      const limit = 365

      if (tableWidth > limit && visWidth > limit) {
        this.setVisTableWidthUnit(visWidth, tableWidth, 'px')
        EventBus.$emit('stacked-chart-resize')
      }
      
    },

    handleResize() {
      const width = window.innerWidth

      if (width < 1024) {
        this.setVisTableWidthUnit(100, 100, '%')
        return
      }

      if (this.widthUnit === 'px') {
        this.setVisTableWidthUnit(
          this.visWidth / width * 100,
          this.tableWidth / width * 100,
          '%'
        )
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dragging {
  opacity: 0.75;
  pointer-events: none;
}
</style>
