<template>
  <header>
    <div class="header-dropdowns">
      <div
        class="logo-wrapper"
        @click="toggleDrawer">
        <i
          v-if="ready && widthBreak"
          class="fal fa-ellipsis-v" />
        <app-logo class="header-logo" />
        <h1 v-if="ready && widthBreak"> {{ regionLabel }}</h1>
      </div>
      <view-dropdown
        v-if="!widthBreak"
        class="selection" />
      <region-dropdown
        v-if="!widthBreak"
        class="selection" />
    </div>

    <app-drawer
      v-if="widthBreak"
      :open="openDrawer"
      @close="openDrawer = false"
    />

    <div
      v-if="!widthBreak"
      class="share-buttons buttons has-addons">
      <button
        v-if="!isFacilitiesView"
        class="button is-rounded"
        @click="handleExportImage">
        <i class="fal fa-fw fa-chart-bar" />
        <span class="label-image">Image</span>
      </button>
      <button
        :class="{
          'is-loading': generating,
          'is-primary': generating
        }"
        class="button is-rounded"
        @click="handleExportDataClick">
        <download-csv
          :data="exportData"
          :name="`${filename}.csv`"
        >
          <i class="fal fa-fw fa-table" />
          <span class="label-csv">Data</span>
        </download-csv>
      </button>
    </div>
  </header>
</template>

<script>
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import { format as d3Format } from 'd3-format'
import _debounce from 'lodash.debounce'
import DownloadCsv from 'vue-json-csv'
import REGIONS from '~/constants/regions.js'
import AppLogo from '~/components/ui/Logo'
import ViewDropdown from '~/components/ui/ViewDropdown'
import RegionDropdown from '~/components/ui/RegionDropdown'
import AppDrawer from '~/components/layout/Drawer'

export default {
  components: {
    DownloadCsv,
    AppLogo,
    ViewDropdown,
    RegionDropdown,
    AppDrawer
  },

  data() {
    return {
      ready: false,
      generating: false,
      openDrawer: false,
      windowWidth: 0,
      regions: REGIONS
    }
  },

  computed: {
    responsiveBreakWidth() {
      return this.$store.getters.responsiveBreakWidth
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
    widthBreak() {
      return this.windowWidth < this.responsiveBreakWidth
    },
    isFacilitiesView() {
      return this.$store.getters.currentView === 'facilities'
    },
    energyDomains() {
      return this.$store.getters.energyDomains
    },
    priceDomains() {
      return this.$store.getters.priceDomains
    },
    temperatureDomains() {
      return this.$store.getters.temperatureDomains
    },
    marketValueDomains() {
      return this.$store.getters.marketValueDomains
    },
    energyExportData() {
      return this.$store.getters.exportData
    },
    chartUnit() {
      return this.$store.getters.chartUnit
    },
    exportData() {
      const timeFormat = d3TimeFormat('%Y-%m-%d %H:%M')
      const format = d3Format('.2f')
      if (this.isFacilitiesView) {
        return this.$store.getters.facilityExportData
      }
      return this.energyExportData.map(d => {
        let obj = {
          date: `${timeFormat(d.date)}`
        }
        this.energyDomains.forEach(domain => {
          obj[`${domain.label} - ${this.chartUnit}`] = format(d[domain.id])
        })
        this.temperatureDomains.forEach(domain => {
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
        this.priceDomains.forEach(domain => {
          const label =
            domain.type === 'price' ? 'Price' : 'Volume Weighted Price'
          obj[`${label} - AUD/MWh`] = format(d[domain.id])
        })
        if (this.hasMarketValue) {
          this.marketValueDomains.forEach(domain => {
            obj[`${domain.label} Market Value - AUD`] = format(d[domain.id])
          })
        }
        return obj
      })
    },
    regionId() {
      return this.$route.params.region
    },
    regionLabel() {
      const region = this.regions.find(d => d.id === this.regionId)
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
    }
  },

  mounted() {
    this.windowWidth = window.innerWidth
    window.addEventListener(
      'resize',
      _debounce(() => {
        this.windowWidth = window.innerWidth
      }, 200)
    )
    this.ready = true
  },

  methods: {
    toggleDrawer() {
      this.openDrawer = !this.openDrawer
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
        path: `/energy/${this.regionId}/image`,
        query
      })
    },
    handleExportDataClick() {
      this.generating = true
      setTimeout(() => {
        this.generating = false
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

header {
  color: #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $app-padding / 2;
  background-color: $background-alpha;
  position: relative;
  z-index: 9999;

  @include desktop {
    margin-top: $app-padding;
  }

  h1 {
    font-family: $header-font-family;
    font-weight: 700;
    color: #000;
    font-size: 1.2rem;
    position: relative;
    top: 3px;
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

  .header-dropdowns {
    display: flex;
    align-items: center;

    .selection {
      position: relative;
      top: 3px;
    }
  }

  .share-buttons {
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
</style>
