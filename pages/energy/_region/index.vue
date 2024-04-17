<template>
  <div class="energy-region">
    
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
      class="vis-table-container"
      :style="{ 'padding-left': tabletBreak ? '0' : '1rem' }">

      <vis-section
        v-if="dashboardView === 'discrete-time'"
        :date-hover="hoverDate"
        :on-hover="isHovering"
        :style="{ width: `${visWidth}${widthUnit}`}"
        :class="{ dragging: dragging }"
        class="vis-container"
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering"
      />

      <div 
        v-if="dashboardView === 'time-of-day'" 
        style="margin-right: 10px;"
        :style="{ width: `${visWidth}${widthUnit}`}"
        :class="{ dragging: dragging }">
        <TimeOfDaySection 
          :show-sparklines="false" 
          @dateHover="handleDateHover"
          @is-hovering="handleIsHovering" />
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
        :show-donut-bar="dashboardView === 'discrete-time'"
        :show-records="dashboardView === 'discrete-time'"
        :class="{ dragging: dragging }"
        :style="{
          width: `${tableWidth}${widthUnit}`
        }"
        class="table-container"
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering"
      />
    </div>

    <div 
      v-if="ready && dashboardView === 'time-of-day'" 
      style="margin-top: 2rem;">
      <TimeOfDaySection :show-stacked-averages="false" />
    </div>

  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import _includes from 'lodash.includes'
import EventBus from '~/plugins/eventBus.js'
import * as SI from '@/constants/si'
import { isPowerRange } from '@/constants/ranges.js'
import {
  isValidRegion,
  getEnergyRegionLabel
} from '@/constants/energy-regions.js'
import * as FT from '@/constants/energy-fuel-techs/group-detailed.js'
import VisSection from '@/components/Energy/VisSection.vue'
import SummarySection from '@/components/Energy/SummarySection.vue'
import Divider from '@/components/Divider.vue'
import TimeOfDaySection from '~/components/Charts/TimeOfDay/index.vue'

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
    VisSection,
    SummarySection,
    Divider,
    TimeOfDaySection
  },

  data() {
    return {
      isHovering: false,
      hoverDate: null,
      baseUrl: `${this.$config.url}/images/screens/`,
      useDev: this.$config.useDev,
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
      allowResize: 'regionEnergy/allowResize',
      useCachedData: 'regionEnergy/useCachedData',

      query: 'app/query',
      showFeatureToggle: 'app/showFeatureToggle',
      isTouchDevice: 'app/isTouchDevice',
      tabletBreak: 'app/tabletBreak'
    }),

    dashboardView: {
      get() {
        return this.$store.getters['app/dashboardView']
      },

      set(val) {
        this.$store.commit('app/dashboardView', val)
      }
    },
    
    regionId() {
      return this.$route.params.region
    },

    queryView() {
      return this.$route.query.view
    },

    queryRange() {
      return this.$route.query.range
    },

    queryInterval() {
      return this.$route.query.interval
    },

    cardFilename() {
      return this.useDev
        ? `${this.baseUrl}opennem-dev.png`
        : `${this.baseUrl}opennem-${this.regionId}.png`
    },

    property() {
      return this.fuelTechGroupName === FT.GROUP_LABEL ? 'fuelTech' : 'group'
    },
    calculateByGeneration() {
      return this.percentContributionTo === 'generation'
    },

    emissionsDomains() {
      const domains = this.currentDomainEmissions
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
          groupName: this.fuelTechGroupName,
          dashboardView: this.dashboardView
        })
      }
    },

    range(curr, prev) {
      if (this.dashboardView === 'discrete-time') {
        this.getDiscreteTimeData({ curr, prev })
      } else {
        this.getTimeOfDayData({ curr, prev })
      }
    },

    interval(interval) {
      if (this.dashboardView === 'discrete-time') {
        this.setCompareDifference(false)
        this.doUpdateTickFormats({
          range: this.range,
          interval,
          filterPeriod: this.filterPeriod
        })
      }

      this.doUpdateDatasetByInterval({ range: this.range, interval })  
    },

    filteredDates(dates) {
      this.doUpdateXTicks({
        range: this.range,
        interval: this.interval,
        isZoomed: dates.length > 0,
        filterPeriod: this.filterPeriod
      })
      this.updateEmissionsData()
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
        groupName: this.fuelTechGroupName,
        dashboardView: this.dashboardView
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

    this.dashboardView = this.queryView || 'discrete-time'

    this.handleQueryChange({
      range: this.queryRange || '7d',
      interval: this.queryInterval || '30m',
      view: this.dashboardView
    })
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
      doFilterDatasetByRange: 'regionEnergy/doFilterDatasetByRange',
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

    getDiscreteTimeData({ curr, prev }) {
      this.setCompareDifference(false)
      this.doUpdateTickFormats({
        range: curr,
        interval: this.interval,
        filterPeriod: this.filterPeriod
      })
      if (isPowerRange(curr) && isPowerRange(prev)) {
        this.doFilterDatasetByRange({
          range: curr,
          interval: this.interval
        })
      } else {
        this.doGetRegionDataByRangeInterval({
          region: this.regionId,
          range: curr,
          interval: this.interval,
          period: this.filterPeriod,
          groupName: this.fuelTechGroupName,
          dashboardView: this.dashboardView
        })
      }
    },

    getTimeOfDayData({ curr, prev }) {
      this.doUpdateTickFormats({
        range: this.range,
        interval: this.interval,
        filterPeriod: this.filterPeriod
      })

      if (this.useCachedData) {
        this.doFilterDatasetByRange({ range: this.range, interval: this.interval })
      } else {
        this.doGetRegionDataByRangeInterval({
          region: this.regionId,
          range: this.range,
          interval: this.interval,
          period: this.filterPeriod,
          groupName: this.fuelTechGroupName,
          dashboardView: this.dashboardView
        })
      }
    },
    
    setVisTableWidthUnit(vis, table, unit) {
      this.visWidth = vis
      this.tableWidth = table
      this.widthUnit = unit
    },

    updateEmissionsData() {
      const filteredTimes = this.filteredDates.map(d => d.getTime())
      const dataset = filteredTimes.length
        ? this.currentDataset.filter(d => d.time >= filteredTimes[0] && d.time < filteredTimes[filteredTimes.length - 1])
        : this.currentDataset
      this.doUpdateEmissionIntensityDataset({
        datasetAll: dataset,
        isCalculateByGeneration: this.calculateByGeneration,
        emissionsDomains: this.emissionsDomains,
        powerEnergyDomains: this.powerEnergyDomains,
        domainPowerEnergy: this.domainPowerEnergy,
        isEnergyType: this.isEnergyType,
        isWemOrAu: this.isWemOrAu,
        regionId: this.regionId,
        interval: this.interval
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
        view: this.dashboardView
      }

      this.$router.push({
        params: { region: this.regionId },
        query: updatedQuery
      })

      this.setQuery(updatedQuery)
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
$breakpoint: 769px;

.vis-table-container {
  // user-select: none;
  transition: all 1s ease;
}
.dragging {
  pointer-events: none;
  user-select: none;
}
</style>
