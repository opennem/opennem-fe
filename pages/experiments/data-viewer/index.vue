<template>
  <div class="data-viewer-container">
    <nav>
      <Dropdown
        :options="viewOptions"
        class="dropdown"
        @change="handleViewChange"
      />
      <Dropdown
        :options="regionOptions"
        class="dropdown"
        @change="handleRegionChange"
      />

      <div class="buttons">
        <button
          class="button is-primary is-rounded is-fullwidth"
          @click="handleFetchClick">Fetch</button>
        <button class="button  is-outlined is-rounded is-fullwidth">Reset</button>
      </div>

      <hr>

      <Dropdown
        :options="metricOptions"
        class="dropdown"
        @change="handleMetricChange"
      />
    </nav>

    <section>
      <DataTable
        :columns="columns"
        :rows="rows"
      />
    </section>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { getEnergyRegions } from '@/constants/energy-regions.js'
import { metrics } from '@/constants/stripes/index.js'
import {
  getRegionStripesData,
  getYearlyStripesData,
  getStripesRegion
} from '@/data/pages/page-stripes.js'
import { getTableData } from '@/data/pages/page-data-check.js'
import Dropdown from '@/components/ui/Dropdown'
import DataTable from '@/components/Vis/DataTable'

export default {
  layout: 'no-container',
  head: {
    titleTemplate: 'OpenNEM Experiments: Data viewer'
  },

  components: {
    Dropdown,
    DataTable
  },

  data() {
    return {
      dataset: null,
      selectedView: null,
      selectedRegion: null,
      selectedMetric: null,
      columns: null,
      rows: null
    }
  },

  computed: {
    isCombinedRegions() {
      return this.selectedRegion === 'au' || this.selectedRegion === 'nem'
    }
  },

  created() {
    this.viewOptions = [
      {
        label: 'Stripes',
        value: 'stripes'
      }
    ]

    this.regionOptions = getEnergyRegions().map(d => {
      d.value = d.id
      return d
    })

    this.metricOptions = metrics
  },

  methods: {
    ...mapActions({
      doGetRegionData: 'regionEnergy/doGetRegionData',
      doGetAllData: 'regionEnergy/doGetAllData'
    }),
    getOptionId(options, selectedLabel) {
      const find = options.find(d => d.label === selectedLabel)
      return find ? find.value : null
    },

    handleViewChange(view) {
      this.selectedView = this.getOptionId(this.viewOptions, view)
    },
    handleRegionChange(region) {
      this.selectedRegion = this.getOptionId(this.regionOptions, region)
    },
    handleMetricChange(metric) {
      this.selectedMetric = this.getOptionId(this.metricOptions, metric)
    },

    handleFetchClick() {
      const regions = getStripesRegion(this.selectedRegion)

      if (this.isCombinedRegions) {
        getRegionStripesData(this.doGetAllData, regions).then(dataset => {
          this.dataset = dataset
          this.getCombinedRegionsData(dataset)
        })
      } else {
        getYearlyStripesData(this.doGetRegionData, regions).then(d => {
          console.log(d)
        })
      }
    },

    getCombinedRegionsData(dataset) {
      if (dataset.length > 0) {
        const { columns, rows } = getTableData({
          dataset,
          selectedMetricObject: this.metricOptions.find(
            d => d.value === this.selectedMetric
          )
        })

        this.columns = columns
        this.rows = rows
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.data-viewer-container {
  display: flex;

  & > nav {
    width: 400px;
    padding: 2rem;
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    align-self: flex-start;
  }
  & > section {
    // background: #eee;
    // padding: 2rem;
    width: calc(100% - 400px);
    align-self: flex-start;
  }
}

.buttons {
  button {
    margin-bottom: 0.5rem;
  }
}
</style>
