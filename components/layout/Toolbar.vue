<template>
  <div 
    class="toolbar" 
    :class="{ 'facilities-header': isFacilitiesView }">

    <div 
      v-if="ready" 
      class="header-dropdowns">
      <!-- <div 
        class="logo-wrapper" 
        @click="toggleDrawer">
        <i 
          v-if="ready && tabletBreak" 
          class="fal fa-ellipsis-v" />
        <app-logo class="header-logo" />
        <h1 v-if="ready && tabletBreak">{{ regionLabel }}</h1>
      </div> -->
      <view-dropdown 
        v-if="!tabletBreak" 
        class="selection" />
      <region-dropdown 
        v-show="!tabletBreak && !isEmissionsView && !isCompareView" 
        class="selection" />
      <EmissionsRegionDropdown 
        v-show="!tabletBreak && isEmissionsView" 
        class="selection" />
    </div>

    <div 
      v-if="ready"
      class="data-options-bar">

      <div>
        <EnergyDataOptions />
      </div>

      <div 
        v-if="!isFacilitiesView && isEnergyOrFacilitiesView && !isTimeOfDayView" 
        :class="{ hide: tabletBreak }">
        <consumption-generation-toggle />
      </div>
    </div>

    <div 
      class="export-bar" 
      v-if="ready">
      <div class="button-group has-addons">
        <div class="buttons">
          <button 
            class="button is-small">
            <download-csv 
              :data="exportData" 
              :name="`${filename}.csv`">
              <i class="fal fa-download" />
            </download-csv>
          </button>
        </div>
      </div>

      <div class="button-group has-addons">
        <div class="buttons">
          <button 
            class="button is-small" 
            @click="handleExportImage">
            <i class="fal fa-share-alt" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { timeFormat as d3TimeFormat, utcFormat } from 'd3-time-format'
import { format as d3Format } from 'd3-format'
import _debounce from 'lodash.debounce'
import DownloadCsv from 'vue-json-csv'
import { mixin as clickaway } from 'vue-clickaway'
import { getEnergyRegions } from '@/constants/energy-regions.js'
import AppLogo from '~/components/ui/Logo'
import ViewDropdown from '~/components/ui/ViewDropdown'
import ConsumptionGenerationToggle from '~/components/ui/ConsumptionGenerationToggle'
import RegionDropdown from '~/components/ui/RegionDropdown'
import EmissionsRegionDropdown from '~/components/Emissions/EmissionsRegionDropdown'
import AppDrawer from '~/components/layout/Drawer'
import FacilityViewToggle from '~/components/Facility/ViewToggle'

import EnergyDataOptions from '../Toolbar/EnergyDataOptions.vue'

export default {
  components: {
    DownloadCsv,
    AppLogo,
    ViewDropdown,
    RegionDropdown,
    ConsumptionGenerationToggle,
    AppDrawer,
    FacilityViewToggle,
    EmissionsRegionDropdown,

    EnergyDataOptions
  },
  mixins: [clickaway],

  data() {
    return {
      ready: false,
      generating: false,
      openDrawer: false,
      showShareMenu: false,
      regions: getEnergyRegions()
    }
  },

  computed: {
    ...mapGetters({
      currentView: 'currentView',
      tabletBreak: 'app/tabletBreak',
      dashboardView: 'app/dashboardView',

      compareCurrentDataset: 'compare/currentDataset',
      selectedMetricObj: 'stripes/selectedMetricObj',

      facilitySelectedView: 'facility/selectedView',

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

    selectedView: {
      get() {
        return this.facilitySelectedView
      },
      set(val) {
        this.$store.dispatch('facility/selectedView', val)
      }
    },

    isEmissionsView() {
      return this.currentView === 'emissions'
    },

    isCompareView() {
      return this.currentView === 'compare'
    },

    isEmissionsWorldRegion() {
      return this.$route.name === 'emissions-world'
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
    isFacilitiesView() {
      return this.$store.getters.currentView === 'facilities'
    },
    chartUnit() {
      return this.$store.getters.chartUnit
    },

    compareExportData() {
      const timeFormat = d3TimeFormat('%Y-%m-%d')
      let data = []

      if (this.compareCurrentDataset.length > 0) {
        data = this.compareCurrentDataset[0].data.map(d => {
          return {
            date: `${timeFormat(d.date)}`
          }
        })

        this.compareCurrentDataset.forEach(region => {
          region.data.forEach((d, i) => {
            data[i][`${region.region}`] = d[this.selectedMetricObj.value]
          })
        })
      }

      return data
    },

    compareFilename() {
      return `Compare — ${this.selectedMetricObj.label}`
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
        region = 'OpenNEM'
      }
      return `${date} ${region}`
    },
    isEnergy() {
      return this.$store.getters.energyChartType === 'energy'
    },
    compareDifference() {
      return this.$store.getters.compareDifference
    },
    focusOn() {
      return this.$store.getters.focusOn
    },
    isEnergyOrFacilitiesView() {
      const view = this.$store.getters.currentView
      return view === 'energy' || view === 'facilities'
    }
  },

  mounted() {
    this.ready = true
  },

  methods: {
    toggleDrawer() {
      this.openDrawer = !this.openDrawer
      this.$store.dispatch('drawer', this.openDrawer)
    },
    closeDrawer() {
      this.openDrawer = false
      this.$store.dispatch('drawer', false)
    },
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
    handleExportDataClick() {
      this.generating = true
      setTimeout(() => {
        this.generating = false
      }, 1000)
    },
    handleCompareClick() {
      this.$store.dispatch('compareDifference', !this.compareDifference)
      if (this.compareDifference) {
        this.$store.dispatch('focusOn', false)
      }
    },
    handleShareButtonClicked() {
      this.showShareMenu = !this.showShareMenu
    },
    handleClickAway() {
      this.showShareMenu = false
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
    padding: $toolbar-padding;
  }

  .data-options-bar {
    width: 100%;
    height: 100%;
    border-left: 1px solid $border-colour;
    border-right: 1px solid $border-colour;
    padding: $toolbar-padding / 2 $toolbar-padding;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .export-bar {
    padding: $toolbar-padding / 2 $toolbar-padding;
    display: flex;
    gap: 4px;

    .buttons {
      background-color: transparent;
      border-radius: 0;
    }

    button {
      background-color: #000;
      color: #fff;
    }
  }

  .header-logo {
    width: 2.3rem;
    max-height: 2.3rem;
    margin: 0.2rem $app-padding / 2;
    position: relative;
    top: 3px;
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
  }

  .fa-ellipsis-v {
    font-size: 2.2rem;
    color: $opennem-link-color;
    position: relative;
    top: 3px;
  }

  .s-button-wrapper {
    position: relative;
    margin-right: 1.5rem;

    .button:focus {
      color: $opennem-link-color;
    }
  }

  &.facilities-header {
    .s-button-wrapper {
      position: absolute;
      left: 50%;
      top: 12px;
      margin-left: -50px;

      @include desktop {
        top: 12px;
        margin-left: -90px;
      }

      .button {
        min-width: 30px;
        border-radius: 4px;
        padding: 0;

        @include desktop {
          min-width: 62px;
          padding: 0 15px;
        }
      }

      .label-image {
        display: none;

        @include desktop {
          display: inline;
        }
      }
    }
  }

  .s-button {
    font-size: 11px;

    img {
      width: 10px;
      color: $opennem-link-color;
      display: inline-block;
      margin-right: 3px;
      position: relative;
      top: -1px;
    }
  }

  .s-menu {
    display: block;
    right: 0;
    left: auto;
    min-width: 40px;

    .dropdown-item {
      border-radius: 0;
      min-width: 40px;
    }
  }

  .s-buttons {
    .button {
      font-size: 0.9rem;
    }

    .label-image {
      margin-left: 3px;
    }

    .fa-chart-bar {
      position: relative;
      top: 1px;
    }
  }
}

.more-buttons {
  position: absolute;
  right: 8rem;

  @include mobile {
    right: 0;
    z-index: 9999;

    &.hide {
      display: none;
    }
  }

  .buttons {
    display: inline;
  }

  .button {
    @include mobile {
      border-radius: 0 !important;
    }
  }
}

.compare-button {
  margin-left: 10px;
}
</style>
