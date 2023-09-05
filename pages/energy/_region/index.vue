<template>
  <div class="energy-region">

    <div style="display: flex; align-items: center;">

      <data-options-bar
        v-if="view === 'discrete-time'"
        style="padding-right: 0.5rem;"
        :ranges="ranges"
        :intervals="intervals"
        :range="range"
        :interval="interval"
        :filter-period="filterPeriod"
        :view="view"
        @queryChange="handleQueryChange"
        @rangeChange="handleRangeChange"
        @intervalChange="handleIntervalChange"
        @filterPeriodChange="handleFilterPeriodChange"
      />

      <DataOptionsBarTimeOfDay
        style="padding-right: 0;"
        v-if="view === 'time-of-day'"
        :view="view"
        :range="range"
        :interval="interval"
        @queryChange="handleQueryChange"
        @rangeChange="handleRangeChange"
        @intervalChange="handleIntervalChange"
      />
 
      <div
        v-if="range === '3D' || range === '7D'"
        class="field has-addons" 
        style="margin-bottom: 0;">
        <button 
          class="button is-small"
          style="border-radius: 20px;"
          v-tooltip="view === 'time-of-day' ? 'Switch to discrete time view' : 'Switch to time of day view'"
          :class="{ 'is-selected': view === 'time-of-day' }"
          @click="() => view === 'time-of-day' ? view = 'discrete-time' : view = 'time-of-day'">
          <span class="icon is-small">
            <IconTimeOfDay :selected="view === 'time-of-day'" />
          </span>
        </button>
      </div>
      
    </div>
    
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
        v-if="view === 'discrete-time'"
        :date-hover="hoverDate"
        :on-hover="isHovering"
        :style="{ width: `${visWidth}${widthUnit}`}"
        :class="{ dragging: dragging }"
        class="vis-container"
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering"
      />

      <div 
        v-if="view === 'time-of-day'" 
        style="margin-right: 10px;"
        :style="{ width: `${visWidth}${widthUnit}`}"
        :class="{ dragging: dragging }">
        <TimeOfDaySection />
      </div>

      <Divider 
        v-if="allowResize"
        :allow-y="false"
        :vertical="true"
        @dragging="(d) => dragging = d" 
        @dragged="onDragged" />
      
      <summary-section
        ref="tableContainer"
        style="position: sticky; top: 0; height: 100%"
        :hover-date="hoverDate"
        :is-hovering="isHovering"
        :class="{ dragging: dragging }"
        :style="{
          width: `${tableWidth}${widthUnit}`
        }"
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
import DataOptionsBarTimeOfDay from '~/components/Energy/DataOptionsBarTimeOfDay.vue'
import VisSection from '@/components/Energy/VisSection.vue'
import SummarySection from '@/components/Energy/SummarySection.vue'
import Divider from '@/components/Divider.vue'
import TimeOfDaySection from '~/components/Energy/TimeOfDaySection.vue'
import IconTimeOfDay from '~/components/Vis/IconTimeOfDay.vue'

const minTableWidth = 420

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
    DataOptionsBarTimeOfDay,
    VisSection,
    SummarySection,
    Divider,
    TimeOfDaySection,
    IconTimeOfDay
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
      dragging: false,
      view: 'discrete-time' // discrete-time, time-of-day
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
      allowResize: 'regionEnergy/allowResize',

      query: 'app/query',
      showFeatureToggle: 'app/showFeatureToggle',
      isTouchDevice: 'app/isTouchDevice'
    }),
    
    regionId() {
      return this.$route.params.region
    },

    queryView() {
      return this.$route.query.view
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
    },
    view() {
      this.handleQueryChange(this.query)
    }
  },

  created() {
    this.view = this.queryView || 'discrete-time'

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

    if (this.isTouchDevice) {
      this.setAllowResize(false)
    } else {
      this.setAllowResize(true)
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
      setEmissionsVolumeDisplayPrefix: 'chartOptionsEmissionsVolume/chartDisplayPrefix',

      setAllowResize: 'regionEnergy/allowResize'
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
      const updatedQuery = {
        ...query,
        view: this.view
      }
      this.$router.push({
        params: { region: this.regionId },
        query: updatedQuery
      })

      this.setQuery(updatedQuery)
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

      if (tableWidth > minTableWidth && visWidth > minTableWidth) {
        this.setVisTableWidthUnit(visWidth, tableWidth, 'px')
      }

      EventBus.$emit('vis-resize')
    },

    handleResize() {
      const minTableWidth = 250
      const windowWidth = window.innerWidth

      // this will reset the vis/table width to 65/35 % when the window is resized
      if (windowWidth >= 1024 && this.tableWidth === 100 && this.widthUnit === '%') {
        this.setVisTableWidthUnit(65, 35, '%')
        return
      }

      // if less than 1024px, set all to 100% width
      if (windowWidth < 1024) {
        this.setVisTableWidthUnit(100, 100, '%')
        return
      }

      const tableCurrentWidth = this.$refs.tableContainer.$el.offsetWidth

      if (tableCurrentWidth < minTableWidth) {
        // table width should not be less than minTableWidth
        this.setVisTableWidthUnit(windowWidth - minTableWidth, minTableWidth, 'px')
      } else if (this.widthUnit === 'px') {
        // when resizing, convert px to % so it will be responsive
        const tableWidth = this.tableWidth / windowWidth * 100
        const visWidth = 100 - tableWidth
        this.setVisTableWidthUnit(visWidth, tableWidth, '%')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.vis-table-container {
  user-select: none;
  transition: all 1s ease;
}
.dragging {
  pointer-events: none;
  user-select: none;
}
</style>
