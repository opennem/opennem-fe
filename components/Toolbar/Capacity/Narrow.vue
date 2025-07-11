<template>
  <div 
    class="toolbar">

    <div 
      v-if="ready" 
      class="header-dropdowns">
      <ViewDropdown />
      <RegionDropdown />
    </div>

    <div class="options">
      <div class="button-group has-addons">
        <div class="buttons">
          <button 
            class="button"
            @click="() => showFilters = true">
            <i class="fal fa-fw fa-sliders-h" />
          </button>
        </div>
      </div>

      <!-- <div 
        :class="{ 'is-active': dropdownActive }" 
        class="dropdown export-bar">
        <button
          v-on-clickaway="handleClickAway"
          class="dropdown-trigger button inverted is-selected"
          @click="() => dropdownActive = !dropdownActive"
        >
          <i class="fal fa-fw fa-share-alt" />
        </button>

        <transition name="slide-down-fade">
          <div 
            v-if="dropdownActive" 
            class="filter-menu dropdown-menu">
            <div class="dropdown-content">
              <button 
                @click="() => dropdownActive = false">
                <download-csv 
                  :data="exportData" 
                  :name="`${filename}.csv`">
                  Download CSV
                </download-csv>
              </button>

              <button @click="handleExportImage">
                Export as PNG
              </button>
            </div>
          </div>
        </transition>
      </div> -->
    </div>

    <div 
      v-if="showFilters" 
      class="options-panel">
      <div class="options-header">
        <span>Filters</span>

        <!-- <button>Clear</button> -->
      </div>

      <div class="options-wrapper">
        <!-- <label>
          <span>Region:</span>
          <RegionDropdown :full-width="true" />
        </label> -->

        <CapacityDataOptions :mobile="true" />

        <!-- <ConsumptionGenerationToggle :mobile="true" /> -->
      </div>

      <div class="options-footer">
        <button 
          class="button cta" 
          @click="() => showFilters = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'
import { timeFormat as d3TimeFormat, utcFormat } from 'd3-time-format'
import { format as d3Format } from 'd3-format'
import DownloadCsv from 'vue-json-csv'
import { getEnergyRegions } from '@/constants/energy-regions.js'
import ViewDropdown from '~/components/ui/ViewDropdown'
import ConsumptionGenerationToggle from '~/components/ui/ConsumptionGenerationToggle'
import RegionDropdown from '~/components/ui/RegionDropdown'
import EmissionsRegionDropdown from '~/components/Emissions/EmissionsRegionDropdown'
import CapacityDataOptions from './CapacityDataOptions.vue'

// import FacilityViewToggle from '~/components/Facility/ViewToggle'


export default {
  mixins: [clickaway],

  components: {
    DownloadCsv,
    ViewDropdown,
    RegionDropdown,
    ConsumptionGenerationToggle,
    // FacilityViewToggle,
    EmissionsRegionDropdown,
    CapacityDataOptions
  },

  data() {
    return {
      ready: false,
      dropdownActive: false,
      showFilters: false,
      regions: getEnergyRegions()
    }
  },

  computed: {
    ...mapGetters({
      currentView: 'currentView',
      isFacilitiesView: 'isFacilitiesView',
      tabletBreak: 'app/tabletBreak',
      dashboardView: 'app/dashboardView',
      chartEnergyRenewablesLine:
        'chartOptionsPowerEnergy/chartEnergyRenewablesLine',
      isEnergyType: 'regionEnergy/isEnergyType',
      energyExportData: 'regionEnergy/filteredCurrentDataset',
      energyDomains: 'regionEnergy/currentDomainPowerEnergy',
      emissionDomains: 'regionEnergy/currentDomainEmissions',
      priceDomains: 'regionEnergy/domainPrice',
      demandPriceDomains: 'regionEnergy/domainDemandPrice',
      temperatureDomains: 'regionEnergy/domainTemperature',
      marketValueDomains: 'regionEnergy/currentDomainMarketValue',
      emissionIntensityData: 'energy/emissions/emissionIntensityData'
    }),

    isEmissionsView() {
      return this.currentView === 'emissions'
    },
    isCompareView() {
      return this.currentView === 'compare'
    },
    isEnergyOrFacilitiesView() {
      return this.currentView === 'energy' || this.currentView === 'facilities'
    },
    isTimeOfDayView() {
      return this.dashboardView === 'time-of-day'
    },
    

    range() {
      return this.$store.getters.range
    },
    interval() {
      return this.$store.getters.interval
    },
    hasMarketValue() {
      return this.range !== '1D' && this.range !== '3D' && this.range !== '7D'
    },
    dateFilter() {
      return this.$store.getters.dateFilter
    },
    chartUnit() {
      return this.$store.getters.chartUnit
    },

    exportData() {
      const timeFormat = this.isEnergy
        ? d3TimeFormat('%Y-%m-%d')
        : utcFormat('%Y-%m-%d %H:%M')
      const format = d3Format('.2f')
      if (this.isFacilitiesView) {
        return this.$store.getters.facilityExportData
      }
      return this.energyExportData.map((d) => {
        let obj = {
          date: `${timeFormat(d.date)}`
        }
        this.energyDomains.forEach((domain) => {
          obj[`${domain.label} - ${this.chartUnit}`] = format(d[domain.id])
        })
        this.temperatureDomains.forEach((domain) => {
          let label = 'Temperature'
          switch (domain.type) {
            case 'temperature_mean':
              label += ' Mean'
              break
            case 'temperature_min':
              label += ' Min'
              break
            case 'temperature_max':
              label += ' Max'
              break
            default:
          }
          obj[`${label} - C`] = format(d[domain.id])
        })
        this.emissionDomains.forEach((domain) => {
          obj[`${domain.label} Emissions Vol - tCO₂e`] = format(d[domain.id])
        })
        const ei = this.emissionIntensityData.find(
          (e) => e.time === d.time
        )
        obj['Emissions Intensity - kgCO₂e/MWh'] = ei ? format(ei._emissionIntensity) : 0

        if (this.isEnergyType) {
          if (this.demandPriceDomains.length) {
            const priceDomain = this.demandPriceDomains[0]
            const label = 'Volume Weighted Price'
            obj[`${label} - AUD/MWh`] = format(d[priceDomain.id])
          }
        } else {
          if (this.priceDomains.length) {
            const priceDomain = this.priceDomains[0]
            const label = 'Price'
            obj[`${label} - AUD/MWh`] = format(d[priceDomain.id])
          }
        }
        if (this.hasMarketValue) {
          this.marketValueDomains.forEach((domain) => {
            obj[`${domain.label} Market Value - AUD`] = format(d[domain.id])
          })
        }
        if (this.chartEnergyRenewablesLine) {
          if (this.isGeneration) {
            obj['Renewables — %'] = format(
              d._totalGenerationRenewablesPercentage
            )
          } else {
            obj['Renewables — %'] = format(d._totalDemandRenewablesPercentage)
          }
        }
        return obj
      })
    },
    regionId() {
      return this.$route.params.region
    },
    regionLabel() {
      const region = this.regions.find((d) => d.id === this.regionId)
      return region ? region.label : ''
    },
    filename() {
      if (this.isFacilitiesView) {
        return 'facilities'
      }
      let date = ''
      let region = this.regionLabel
      if (this.exportData.length > 0) {
        date = d3TimeFormat('%Y%m%d')(this.energyExportData[0].date)
      }
      if (this.regionId === 'nem') {
        region = 'Open Electricity'
      }
      return `${date} ${region}`
    },
    isEnergy() {
      return this.$store.getters.energyChartType === 'energy'
    }
  },

  mounted() {
    this.ready = true
  },

  methods: {
    handleExportImage() {
      const query = {
        range: this.range,
        interval: this.interval
      }
      if (this.dateFilter.length > 0) {
        query.start = new Date(this.dateFilter[0]).getTime()
        query.end = new Date(this.dateFilter[1]).getTime()
      }
      this.$router.push({
        path: `/energy/${this.regionId}/export/`
      })
    },

    handleClickAway() {
      this.dropdownActive = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.toolbar {
  color: #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 998;
  border-bottom: 1px solid $border-colour;
  height: 56px;
  background-color: #fff;

  .header-dropdowns {
    display: flex;
    align-items: center;
    padding: 10px;

    .dropdown {
      font-size: 1rem;
    }
  }

  .options {
    padding: 10px;
    display: flex;
    gap: 10px;
  }

  .export-bar {
    .buttons {
      background-color: transparent;
      border-radius: 0;
    }

    .dropdown-trigger.button {
      background-color: #000;
      color: #fff;
      min-width: auto;
      font-size: 0.9rem;
    }

    .dropdown-menu {
      min-width: 10rem;
      padding-top: 0;
      margin-top: 5px;
      right: 0;
      left: auto;
    }
  }
}

.options-panel {
  $padding: 18px;

  position: fixed;
  top: 70px;
  bottom: 20px;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  flex-direction: column;
  align-content: space-between;
  z-index: 9999;

  label {
    span {
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 500;
      display: block;
      color: #353535;
      margin-bottom: 4px;
    }
  }

  .options-header {
    padding: $padding;
    font-weight: bold;
    font-size: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    button {
      border: 0;
      text-decoration: underline;
      background: transparent;
      cursor: pointer;
      color: #353535;
      font-weight: bold;
      font-size: 16px;
    }
  }

  .options-wrapper {
    padding: $padding;
    border-bottom: 1px solid #e0e0e0;
    border-top: 1px solid #e0e0e0;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .options-footer {
    padding: $padding;
    display: flex;
    justify-content: space-evenly;
    gap: 8px;
    
    button {
      width: 100%;
      padding: 8px;
      border: 1px solid #353535;
      color: #000;
      font-weight: bold;

      &.cta {
        background-color: #353535;
        color: #fff;
      }
    }
  }
}
</style>
