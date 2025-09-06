<template>
  <div 
    class="toolbar">

    <div 
      v-if="ready" 
      class="header-dropdowns"
      :style="{ padding: padding }">
      <view-dropdown 
        v-if="!tabletBreak" />
      <region-dropdown 
        v-show="!tabletBreak && !isEmissionsView && !isCompareView" />
      <EmissionsRegionDropdown 
        v-show="!tabletBreak && isEmissionsView" />
    </div>

    <div 
      v-if="ready"
      class="data-options-bar"
      :style="{ padding: padding }"
    >

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
      :style="{ padding: padding }"
      v-if="ready">
      <div class="button-group has-addons">
        <div class="buttons">
          <button 
            class="button is-small">
            <download-csv 
              :data="exportData" 
              :name="`${filename}.csv`">
              <i class="fal fa-fw fa-download" />
            </download-csv>
          </button>
        </div>
      </div>

      <div class="button-group has-addons">
        <div class="buttons">
          <button 
            class="button is-small" 
            @click="handleExportImage">
            <i class="fal fa-fw fa-share-alt" />
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
import DownloadCsv from 'vue-json-csv'
import { getEnergyRegions } from '@/constants/energy-regions.js'
import ViewDropdown from '~/components/ui/ViewDropdown'
import ConsumptionGenerationToggle from '~/components/ui/ConsumptionGenerationToggle'
import RegionDropdown from '~/components/ui/RegionDropdown'
import EmissionsRegionDropdown from '~/components/Emissions/EmissionsRegionDropdown'
import EnergyDataOptions from './EnergyDataOptions.vue'
// import FacilityViewToggle from '~/components/Facility/ViewToggle'


export default {
  components: {
    DownloadCsv,
    ViewDropdown,
    RegionDropdown,
    ConsumptionGenerationToggle,
    // FacilityViewToggle,
    EmissionsRegionDropdown,
    EnergyDataOptions
  },

  data() {
    return {
      ready: false,
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
      curtailmentDomains: 'regionEnergy/currentDomainCurtailment',
      emissionDomains: 'regionEnergy/currentDomainEmissions',
      priceDomains: 'regionEnergy/domainPrice',
      demandPriceDomains: 'regionEnergy/domainDemandPrice',
      temperatureDomains: 'regionEnergy/domainTemperature',
      marketValueDomains: 'regionEnergy/currentDomainMarketValue',
      emissionIntensityData: 'energy/emissions/emissionIntensityData'
    }),

    rangeDropdownBreak() {
      return this.$store.getters['app/rangeDropdownBreak']
    },
    padding() {
      return this.rangeDropdownBreak ? '10px' : '24px'
    },


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
      const timeFormat = this.isEnergy && !this.isTimeOfDayView
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
        this.curtailmentDomains.forEach((domain) => {
          obj[`${domain.label} (Curtailment) - ${this.chartUnit}`] = format(d[domain.id])
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
  
}
</style>
