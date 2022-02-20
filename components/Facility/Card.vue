<template>
  <div class="facility-card">
    <a
      class="close-btn"
      @click="close">
      <i class="fal fa-times" />
    </a>

    <div>
      <div class="facility-name">
        {{ facility.displayName }}
      </div>

      <!-- <div class="fuel-tech-colour-wrapper">
        <div
          v-for="(ft, ftIndex) in facility.fuelTechs"
          :key="ftIndex"
          :style="{ 
            backgroundColor: getColour(ft),
          }"
          class="source-colour" />
      </div> -->
      
      <div class="region">
        {{ region }}
      </div>

      <div class="fuel-techs">
        <span
          v-for="(ft, genFtIndex) in facility.genFuelTechs"
          :key="genFtIndex"
        >
          {{ getFtLabel(ft) }}
          <small v-if="facility.genFuelTechs.length > 1">
            ({{ facility.fuelTechRegisteredCap[ft] | facilityFormatNumber }}<span v-if="facility.fuelTechRegisteredCap[ft] < 1">kW</span><span v-else>MW</span>)
          </small><span v-if="genFtIndex !== facility.genFuelTechs.length - 1">,</span> 
        </span>
        <span v-if="facility.loadFuelTechs.length && facility.genFuelTechs.length">,</span>
        <em
          v-for="(ft, loadFtIndex) in facility.loadFuelTechs"
          :key="loadFtIndex"
        >
          {{ getFtLabel(ft) }}
          <small>
            ({{ facility.fuelTechRegisteredCap[ft] | facilityFormatNumber }}<span v-if="facility.fuelTechRegisteredCap[ft] < 1">kW</span><span v-else>MW</span>)
          </small><span v-if="loadFtIndex !== facility.loadFuelTechs.length - 1">,</span>
        </em>
      </div>
    </div>

    <div class="capacity-wrapper">
      <div v-show="facility.generatorCap">
        {{ generatorCap | facilityFormatNumber }}
        <span 
          v-if="generatorCap !== 0 && generatorCap < 1" 
          class="unit">kW</span><span 
            v-if="generatorCap !== 0 && generatorCap >= 1" 
            class="unit">MW</span>
      </div>
      <div v-show="!facility.generatorCap">
        –
      </div>
    </div>

    <!-- :hover-on="isHovering"
      :hover-date="hoverDate"
      :zoom-extent="zoomExtent" -->


    <PowerEnergyChart
      v-if="!fetchingStats && selectedFacilityUnitsDataset.length > 0"
      :power-energy-dataset="selectedFacilityUnitsDataset"
      :domain-power-energy="powerEnergyDomains"
      :range="range"
      :interval="interval"
      :prop-name="'code'"
      :chart-height="250"
      :y-max="facilityRegisteredCapacity"
      :filter-period="filterPeriod"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as FUEL_TECHS from '~/constants/energy-fuel-techs/group-default.js'
import PowerEnergyChart from '@/components/Charts/PowerEnergyChart'

export default {
  components: {
    PowerEnergyChart
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

  computed: {
    ...mapGetters({
      fetchingStats: 'facility/fetchingStats',
      selectedFacilityUnitsDataset: 'facility/selectedFacilityUnitsDataset',

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

    facilityRegisteredCapacity() {
      return this.powerEnergyDomains.length > 0
        ? this.powerEnergyDomains.reduce(
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

    generatorCap() {
      if (this.facility) {
        if (this.selectedTechs.length === 0) {
          return this.facility.generatorCap
        }

        const ftRegCap = this.facility.fuelTechRegisteredCap
        let cap = 0
        this.selectedTechs.forEach(d => {
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
    }
  },

  watch: {
    selectedFacilityUnitsDataset(val) {
      console.log('watch', val)
    },
    selectedFacility(val) {
      console.log('watch', val)
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

        // this.doUpdateXTicks({
        //   range: this.range,
        //   interval: this.interval,
        //   isZoomed: this.zoomExtent.length > 0,
        //   filterPeriod: this.filterPeriod
        // })

        // this.updateYGuides()
      }
      // clear dates
      // this.setFocusDate(null)
    }
  },

  created() {
    this.getFacility()
  },

  methods: {
    ...mapActions({
      doGetFacilityByCode: 'facility/doGetFacilityByCode',
      doGetStationStats: 'facility/doGetStationStats',

      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateXTicks: 'visInteract/doUpdateXTicks'
    }),

    getFacility() {
      console.log(
        this.facility,
        this.facility.country,
        this.facility.facilityId,
        this.facility.network
      )
      this.doGetFacilityByCode({
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
        if (ft === FUEL_TECHS.SOLAR_UTILITY || ft === FUEL_TECHS.SOLAR) {
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
    }
  }
}
</script>

<style lang="scss" scoped>
.facility-card {
  box-shadow: -10px 0 15px rgba(100, 100, 100, 0.1);
  background-color: #fff;
  position: fixed;
  height: 40vh;
  left: 50vw;
  right: 5rem;
  bottom: 0;
  margin-left: 4rem;
  z-index: 100;
  padding: 10px 40px;
  // display: flex;
  // justify-content: space-between;
  // align-items: center;
  border-radius: 10px;

  .close-btn {
    position: absolute;
    top: 5px;
    right: 15px;
  }

  .facility-name {
    font-weight: 600;
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

.capacity-wrapper {
  font-size: 20px;

  .unit {
    font-size: 12px;
    margin-left: -2px;
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
</style>
