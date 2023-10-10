<template>
  <div class="facility-card">
    <a 
      class="close-btn" 
      @click="close">
      <i class="fal fa-times" />
    </a>

    <div class="facility-card-header">
      <div>
        <div class="facility-name">
          <nuxt-link
            v-tooltip="'View facility info'"
            :to="{
              path: facilityPath
            }"
            class="facility-info-link"
          >
            <i class="fal fa-external-link-square" />
            {{ facility.displayName }}
          </nuxt-link>
        </div>

        <div class="region">{{ regionLabel }}</div>

        <div class="fuel-techs">
          <span
            v-for="(ft, genFtIndex) in facility.genFuelTechs"
            :key="genFtIndex"
          >
            {{ getFtLabel(ft) }}
            <small v-if="facility.genFuelTechs.length > 1">
              ({{ facility.fuelTechRegisteredCap[ft] | facilityFormatNumber }}
              <span v-if="facility.fuelTechRegisteredCap[ft] < 1">kW</span>
              <span v-else>MW</span>)
            </small>
            <span 
              v-if="genFtIndex !== facility.genFuelTechs.length - 1"
            >,</span
            >
          </span>
          <span
            v-if="facility.loadFuelTechs.length && facility.genFuelTechs.length"
          >,</span
          >
          <em
            v-for="(ft, loadFtIndex) in facility.loadFuelTechs"
            :key="loadFtIndex"
          >
            {{ getFtLabel(ft) }}
            <small>
              ({{ facility.fuelTechRegisteredCap[ft] | facilityFormatNumber }}
              <span v-if="facility.fuelTechRegisteredCap[ft] < 1">kW</span>
              <span v-else>MW</span>)
            </small>
            <span 
              v-if="loadFtIndex !== facility.loadFuelTechs.length - 1"
            >,</span
            >
          </em>
        </div>
      </div>

      <div class="capacity-wrapper">
        <span class="capacity-label">Generator capacity</span>
        <div v-show="facility.generatorCap">
          {{ generatorCap | facilityFormatNumber }}
          <span 
            v-if="generatorCap !== 0 && generatorCap < 1" 
            class="unit"
          >kW</span
          >
          <span 
            v-if="generatorCap !== 0 && generatorCap >= 1" 
            class="unit"
          >MW</span
          >
        </div>
        <div v-show="!facility.generatorCap">–</div>
      </div>
    </div>

    <!-- :hover-on="isHovering"
      :hover-date="hoverDate"
    :zoom-extent="zoomExtent"-->
    <transition name="fade">
      <div
        v-if="!fetchingStats && selectedFacilityUnitsDataset.length === 0"
        class="not-found-card card"
      >
        <i class="fal fa-chart-area" />
        <div>
          <span v-if="selectedFacilityError">{{
            selectedFacilityErrorMessage
          }}</span>
          <span v-else>Facility statistics data not available</span>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <Loader
        v-if="fetchingStats || fetchingFacility"
        class="facility-chart-loader"
      />
    </transition>
    <PowerEnergyChart
      v-if="
        !fetchingStats &&
          !fetchingFacility &&
          powerEnergyChartDataset.length > 0
      "
      :power-energy-dataset="powerEnergyChartDataset"
      :domain-power-energy="powerEnergyDomains"
      :range="range"
      :interval="interval"
      :prop-name="'code'"
      :chart-height="250"
      :y-max="facilityRegisteredSourceCapacity"
      :y-min="-Math.abs(facilityRegisteredLoadCapacity)"
      :filter-period="filterPeriod"
      :power-options="powerOptions"
      :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent"
      @dateHover="handleDateHover"
      @isHovering="handleIsHovering"
      @zoomExtent="handleZoomExtent"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import * as FUEL_TECHS from '~/constants/energy-fuel-techs/group-detailed.js'
import * as OPTIONS from '@/constants/chart-options.js'
import { FacilityRegions } from '~/constants/facility-regions.js'
import { RANGE_3D } from '@/constants/ranges.js'
import { INTERVAL_30MIN } from '@/constants/interval-filters.js'
import DateDisplay from '@/services/DateDisplay.js'
import PowerEnergyChart from '@/components/Charts/PowerEnergyChart'
import Loader from '@/components/ui/Loader'

const powerOptions = {
  type: [OPTIONS.CHART_HIDDEN, OPTIONS.CHART_STACKED],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: [OPTIONS.CHART_YAXIS_ABSOLUTE, OPTIONS.CHART_YAXIS_PERCENTAGE]
}

export default {
  components: {
    PowerEnergyChart,
    Loader
  },

  props: {
    facility: {
      type: Object,
      default: () => null
    },
    selectedTechs: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      powerOptions,
      zoomExtent: [],
      isHovering: false,
      hoverDate: null
    }
  },

  computed: {
    ...mapGetters({
      fetchingFacility: 'facility/fetchingFacility',
      fetchingStats: 'facility/fetchingStats',
      selectedFacilityUnitsDataset: 'facility/selectedFacilityUnitsDataset',
      selectedFacilityError: 'facility/selectedFacilityError',
      selectedFacilityErrorMessage: 'facility/selectedFacilityErrorMessage',

      range: 'facility/range',
      interval: 'facility/interval',
      filterPeriod: 'facility/filterPeriod',

      selectedFacility: 'facility/selectedFacility',
      unitsSummary: 'facility/unitsSummary',
      facilityName: 'facility/facilityName',
      facilityUnits: 'facility/facilityUnits',
      facilityLocation: 'facility/facilityLocation',
      facilityNetworkRegion: 'facility/facilityNetworkRegion',
      facilityDescription: 'facility/facilityDescription',
      facilityWikiLink: 'facility/facilityWikiLink',
      facilityFuelTechsColours: 'facility/facilityFuelTechsColours'
    }),

    powerEnergyDomains() {
      return [...this.unitsSummary].reverse()
    },

    facilityRegisteredSourceCapacity() {
      const domains = this.powerEnergyDomains.filter(d => !FUEL_TECHS.isLoad(d.fuelTechLabel))
      return domains.length > 0
        ? domains.reduce(
            (acc, cur) => acc + (cur.registeredCapacity || 0),
            0
          )
        : 0
    },

    facilityRegisteredLoadCapacity() {
      const domains = this.powerEnergyDomains.filter(d => FUEL_TECHS.isLoad(d.fuelTechLabel))
      return domains.length > 0
        ? domains.reduce(
            (acc, cur) => acc + (cur.registeredCapacity || 0),
            0
          )
        : 0
    },

    isAvailable() {
      return this.facility
    },

    region() {
      if (this.facility) {
        return this.facility.regionId
      }
      return ''
    },

    regionLabel() {
      const region = FacilityRegions.find((d) => d.id === this.region)
      return region ? region.label : ''
    },

    facilityPath() {
      return `/facility/${encodeURIComponent(
        this.facility.country
      )}/${encodeURIComponent(this.facility.network)}/${encodeURIComponent(
        this.facility.facilityId
      )}/`
    },

    generatorCap() {
      if (this.facility) {
        if (this.selectedTechs.length === 0) {
          return this.facility.generatorCap
        }

        const ftRegCap = this.facility.fuelTechRegisteredCap
        let cap = 0
        this.selectedTechs.forEach((d) => {
          if (FUEL_TECHS.FUEL_TECH_CATEGORY[d] !== 'load' && ftRegCap[d]) {
            cap += ftRegCap[d]
          }
        })
        return cap
      }
      return ''
    },

    facilityNetworkRegion() {
      return this.facility && this.facility.network
        ? this.facility.network.code || this.facility.network
        : ''
    },

    powerEnergyChartDataset() {
      const ds = _cloneDeep(this.selectedFacilityUnitsDataset)

      this.unitsSummary.forEach(unit => {
        const ft = unit.fuelTechLabel

        if (FUEL_TECHS.isLoad(ft)) {
          ds.forEach(d => {
            const id = unit.id
            const negValue = -d[id]
            d[id] = negValue
          })
        }
      })

      return ds
    }
  },

  watch: {
    facility(val) {
      if (val) {
        this.getFacility()
      }
    },
    selectedFacility(val) {
      if (val) {
        this.getFacilityStats()
      }
    },
    selectedFacilityUnitsDataset(dataset) {
      if (dataset.length > 0) {
        this.doUpdateXGuides({
          interval: this.interval,
          start: dataset[0].time,
          end: dataset[dataset.length - 1].time
        })

        this.setYGuides([
          {
            value: this.facilityRegisteredSourceCapacity,
            text: 'Registered Capacity'
          },
          {
            value: -Math.abs(this.facilityRegisteredLoadCapacity),
            text: 'Registered Capacity'
          }
        ])
      }
    }
  },

  created() {
    this.setRange(RANGE_3D)
    this.setInterval(INTERVAL_30MIN)

    this.doUpdateXTicks({
      range: this.range,
      interval: this.interval,
      isZoomed: false,
      filterPeriod: this.filterPeriod
    })
    this.doUpdateTickFormats({
      range: this.range,
      interval: this.interval,
      filterPeriod: this.filterPeriod
    })
    
    this.getFacility()
  },

  methods: {
    ...mapMutations({
      setRange: 'facility/range',
      setInterval: 'facility/interval',
      setFilterPeriod: 'facility/filterPeriod',

      setYGuides: 'visInteract/yGuides'
    }),

    ...mapActions({
      doGetFacilityByCode: 'facility/doGetFacilityByCode',
      doGetStationStats: 'facility/doGetStationStats',

      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateXTicks: 'visInteract/doUpdateXTicks',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats'
    }),

    async getFacility() {
      await this.doGetFacilityByCode({
        countryCode: this.facility.country,
        networkCode: this.facility.network,
        facilityCode: this.facility.facilityId
      })
    },

    getFacilityStats() {
      const networkRegion = this.facilityNetworkRegion
      const facilityCode = this.facility.facilityId
      const facilityFuelTechsColours = this.facilityFuelTechsColours
      this.doGetStationStats({
        networkRegion,
        facilityCode,
        facilityFuelTechsColours
      })
    },

    getFtLabel(ft) {
      const ftLabel = FUEL_TECHS.FUEL_TECH_LABEL[ft]
      if (ftLabel) {
        if (ft === FUEL_TECHS.BATTERY_DISCHARGING) {
          return 'Battery'
        }
        if (ft === FUEL_TECHS.SOLAR_UTILITY) {
          return 'Solar'
        }
        return ftLabel
      }
      return ft || '—'
    },

    getColour(fuelTech) {
      const ftColour = FUEL_TECHS.DEFAULT_FUEL_TECH_COLOUR[fuelTech]
      return ftColour || 'transparent'
    },

    close() {
      this.$emit('close')
    },

    handleZoomExtent(dateRange) {
      let filteredDates = []
      if (dateRange && dateRange.length > 0) {
        let startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        let endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )

        filteredDates = [startTime, endTime]
      } else {
        filteredDates = []
      }

      this.zoomExtent = filteredDates
    },

    handleDateHover(date) {
      this.hoverDate = DateDisplay.getClosestDateByInterval(
        date,
        this.interval,
        this.filterPeriod
      )
    },
    handleIsHovering(hovering) {
      this.isHovering = hovering
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.facility-card {
  box-shadow: -10px 0 15px rgba(100, 100, 100, 0.1);
  background-color: #fff;
  position: fixed;
  height: 420px;
  left: 0;
  right: 0;
  bottom: 0;
  margin-left: 0;
  z-index: 10000;
  padding: 2rem 2rem 2rem 20px;
  border-radius: 10px;

  @include tablet {
    left: 50vw;
    margin-left: 1rem;
    right: 2rem;
  }

  .close-btn {
    position: absolute;
    top: 5px;
    right: 15px;
  }

  .facility-name {
    font-weight: 600;
    font-size: 1.3rem;
  }

  .region {
    font-size: 12px;
    color: #666;
  }

  .fuel-techs {
    font-size: 12px;
    color: #000;
  }
}

.facility-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-left: 10px;
}

.capacity-wrapper {
  font-size: 20px;
  line-height: 1.2;
  text-align: right;

  .unit {
    font-size: 12px;
    margin-left: -2px;
  }

  span.capacity-label {
    font-family: $header-font-family;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
  }
}

.fuel-tech-colour-wrapper {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
}
.source-colour {
  width: 6px;
  height: 100%;
}

.facility-chart-loader {
  position: absolute;
  margin: 100px auto 0;
  left: 45%;
}

.not-found-card {
  height: 250px;
  margin-left: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  box-shadow: none;
  color: #888;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  i {
    font-size: 1.3em;
    width: 100%;
    text-align: center;
  }
  span {
    font-size: 0.9em;
  }
}
</style>
