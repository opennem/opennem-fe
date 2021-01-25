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
        <button
          class="button is-outlined is-rounded is-fullwidth"
          @click="handleResetClick">Reset</button>
      </div>

      <hr>

      <div v-if="selectedView === 'stripes'">
        <Dropdown
          :options="metricOptions"
          class="dropdown"
          @change="handleMetricChange"
        />
        <Dropdown
          v-if="!isCombinedRegions"
          :options="metricYearOptions"
          class="dropdown"
          @change="handleMetricYearChange"
        />
      </div>


    </nav>

    <section>
      <header>
        <h3>{{ tableTitle }}</h3>
      </header>
      <DataTable
        :columns="columns"
        :rows="rows"
        :show-row-num="true"
        :col-highlight-index="colHighlightIndex"
        :row-highlight-index="rowHighlightIndex"
        class="is-size-7"
        @cell-click="handleCellClick"
      />
    </section>

    <section class="detail">
      <header>
        <h3>{{ headerDetailTitle }}</h3>
      </header>
      <DataTable
        :columns="colsDetail"
        :rows="rowsDetail"
        class="is-size-7"
      />
    </section>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import format from 'date-fns/format'

import { getEnergyRegions } from '@/constants/energy-regions.js'
import { metrics } from '@/constants/stripes/index.js'
import { getEachYearOfInterval } from '@/constants/stripes/dates.js'
import {
  getRegionStripesData,
  getYearlyStripesData,
  getStripesRegion,
  dateFormatString
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
      regionOptions: getEnergyRegions().map(d => {
        d.value = d.id
        return d
      }),
      metricOptions: metrics,
      metricYearOptions: getEachYearOfInterval.map(d => {
        return {
          label: d + '',
          value: d
        }
      }),
      dataset: null,
      selectedView: null,
      selectedRegion: null,
      selectedMetric: null,
      selectedYear: null,
      tableTitle: '',
      columns: null,
      rows: null,
      headerDetailTitle: '',
      colsDetail: null,
      rowsDetail: null,
      colHighlightIndex: null,
      rowHighlightIndex: null
    }
  },

  computed: {
    isCombinedRegions() {
      return this.selectedRegion === 'au' || this.selectedRegion === 'nem'
    }
  },

  watch: {
    selectedMetric(val) {
      this.setTableTitle(this.selectedRegion, val, this.selectedYear)
      this.getCombinedRegionsData(this.dataset, val)
    },
    selectedYear(val) {
      this.setTableTitle(this.selectedRegion, this.selectedMetric, val)

      if (this.dataset && this.dataset.length > 0) {
        this.dataset[0].data = this.dataset[0].yearlyData.find(
          d => d.year + '' === val
        ).data
      }

      this.getCombinedRegionsData(this.dataset, this.selectedMetric)
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
    getOptionLabel(options, selectedValue) {
      const find = options.find(d => d.value === selectedValue)
      return find ? find.label : null
    },

    setTableTitle(region, metric, year) {
      const regionLabel = this.getOptionLabel(this.regionOptions, region)
      const metricLabel = this.getOptionLabel(this.metricOptions, metric)
      this.tableTitle = `${regionLabel} — ${metricLabel}`

      if (!this.isCombinedRegions) {
        this.tableTitle += ` — ${year}`
      }
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
    handleMetricYearChange(year) {
      this.selectedYear = year
    },
    handleCellClick({ col, colIndex, row, rowIndex }) {
      console.log(col, colIndex, row, rowIndex)
      const title = `${col.label} — ${format(row.date, dateFormatString)}`
      const regionData = this.dataset.find(d => d.regionId === col.field)
      // const data = regionData
      //   ? regionData.data.find(d => d.time === row.time)
      //   : null
      const originalData = regionData
        ? regionData.originalDataset.find(d => d.time === row.time)
        : null

      console.log(regionData, regionData.originalDataset, originalData)

      if (originalData) {
        const cols = [
          {
            label: 'Key',
            textAlign: 'left',
            field: 'key',
            type: 'string'
          },
          {
            label: 'Value',
            field: 'value'
          }
        ]
        const rows = []

        // Object.keys(data).forEach(key => {
        //   rows.push({
        //     key,
        //     value: data[key]
        //   })
        // })

        Object.keys(originalData).forEach(key => {
          const type = key === 'date' ? 'date' : 'number'
          rows.push({
            key,
            value: originalData[key],
            type
          })
        })

        console.log(title, cols, rows, colIndex, rowIndex)

        this.headerDetailTitle = title
        this.colsDetail = cols
        this.rowsDetail = rows
        this.colHighlightIndex = colIndex
        this.rowHighlightIndex = rowIndex
      }
    },

    handleResetClick() {
      this.dataset = null
      this.tableTitle = ''
      this.columns = null
      this.rows = null
      this.headerDetailTitle = ''
      this.colsDetail = null
      this.rowsDetail = null
      this.colHighlightIndex = null
      this.rowHighlightIndex = null
    },

    handleFetchClick() {
      const regions = getStripesRegion(this.selectedRegion)

      if (this.isCombinedRegions) {
        getRegionStripesData(this.doGetAllData, regions).then(dataset => {
          this.dataset = dataset
          this.setTableTitle(this.selectedRegion, this.selectedMetric)
          this.getCombinedRegionsData(dataset, this.selectedMetric)
        })
      } else {
        getYearlyStripesData(this.doGetRegionData, regions).then(dataset => {
          this.dataset = dataset

          this.setTableTitle(
            this.selectedRegion,
            this.selectedMetric,
            this.selectedYear
          )

          if (this.dataset && this.dataset.length > 0) {
            const find = this.dataset[0].yearlyData.find(
              d => d.year + '' === this.selectedYear
            )
            this.dataset[0].data = find.data
            this.dataset[0].originalDataset = find.originalDataset
          }

          this.getCombinedRegionsData(this.dataset, this.selectedMetric)
        })
      }
    },

    getCombinedRegionsData(dataset, selectedMetric) {
      if (dataset && dataset.length > 0) {
        const { columns, rows } = getTableData({
          dataset,
          dateFormatString,
          selectedMetricObject: this.metricOptions.find(
            d => d.value === selectedMetric
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
    padding: 2rem 1rem;
    width: calc(100% - 400px);
    align-self: flex-start;

    h3 {
      font-size: 21px;
      font-family: $header-font-family;
      font-weight: 700;
    }
  }
  & > section.detail {
    width: 640px;
    padding: 2rem 2rem 2rem 1rem;
    align-self: flex-start;
  }
}

.buttons {
  button {
    margin-bottom: 0.5rem;
  }
}
</style>
