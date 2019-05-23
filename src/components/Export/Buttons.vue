<template>
  <div class="buttons">
    <button id="png-btn" class="button is-small is-rounded is-primary is-inverted" @click="showExportPng">
      <span class="icon">
        <font-awesome-icon class="fal fa-fw" :icon="iconChart" />
      </span>
      <span>Image</span>
    </button>
    <button
      class="button is-small is-rounded is-primary"
      :class="{
        'is-inverted': !generating,
        'is-loading': generating
      }"
      @click="generate"
    >
      <span class="icon">
        <font-awesome-icon class="fal fa-fw" :icon="iconCSV" />
      </span>
      <span class="csv-label">Data</span>
    </button> 

    <download-csv
      style="position: absolute; left: -9999em;"
      v-if="exportData.length > 0"
      id="csv-download"
      :data="exportData"
      :labels="csvHeaders"
      :name="`${exportName}.csv`"
    /> 
  </div>
</template>

<script>
import * as moment from 'moment';
import { mapGetters } from 'vuex';
import DownloadCsv from 'vue-json-csv';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faTable, faChartArea } from '@fortawesome/fontawesome-pro-light';
import { getCSVHeaders } from '@/domains/graphs';
import { dataFilter } from '@/lib/data-helpers';
import dataTransform from '@/lib/data-transform';

export default {
  name: 'export-buttons',
  components: {
    DownloadCsv,
    FontAwesomeIcon,
  },
  data() {
    return {
      exportData: [],
      generating: false,
    };
  },
  computed: {
    ...mapGetters({
      exportName: 'getExportName',
      visType: 'visType',
      domains: 'getDomains',
      selectedStartDate: 'getSelectedStartDate',
      selectedEndDate: 'getSelectedEndDate',
      responseData: 'responseData',
      currentInterval: 'currentInterval',
    }),
    csvHeaders() {
      return getCSVHeaders(this.$store.getters.visType);
    },
    iconChart() {
      return faChartArea;
    },
    iconCSV() {
      return faTable;
    },
  },

  methods: {
    showExportPng() {
      this.$store.dispatch('setExportPng', true);
    },

    getKeys(data, header) {
      if (header) {
        const newHeader = {};
        Object.keys(data[0]).reverse().forEach((key) => {
          if (key !== 'pricePos' && key !== 'priceNeg') {
            newHeader[header[key]] = key;
          }
        });
        return newHeader;
      }
      const keys = { date: 'date' };

      Object.keys(data[0]).forEach((key) => {
        if (key !== 'date') {
          keys[key] = key;
        }
      });

      return keys;
    },

    getProcessedJson(data, header) {
      const keys = this.getKeys(data, header);
      const newData = [];

      data.forEach((item) => {
        const newItem = {};

        Object.keys(keys).forEach((label) => {
          const key = keys[label];
          let value = item[key];

          if (value === undefined) {
            if (label.includes('Temperature') || label.includes('Trading Price')) {
              value = '';
            } else {
              value = 0;
            }
          }
          if (value === null) {
            value = '';
          }
          if (key === 'date') {
            value = moment(value).format('YYYY-MM-DD HH:mm');
          }

          newItem[label] = value;
        });

        newData.push(newItem);
      });

      return newData;
    },

    generate() {
      this.generating = true;
      const responses = this.responseData;
      const startDate = this.selectedStartDate;
      const endDate = this.selectedEndDate;
      let exportData = [];

      responses.forEach((r) => {
        exportData = [...exportData, ...dataTransform(this.domains, r.data, false)];
      });

      let endDateFilter = endDate;
      switch (this.currentInterval) {
        case 'WW':
          endDateFilter = moment(endDate).add(1, 'week').toDate();
          break;

        case 'MM':
          endDateFilter = moment(endDate).add(1, 'month').toDate();
          break;

        case '3MM':
        case 'S3MM':
          endDateFilter = moment(endDate).add(2, 'months').toDate();
          break;

        case 'YYYY':
        case 'FY':
          endDateFilter = moment(endDate).add(1, 'year').toDate();
          break;
        default:
      }

      if (startDate && endDateFilter) {
        exportData = dataFilter(exportData, startDate, endDateFilter);
      }
      this.exportData = this.getProcessedJson(exportData);
      setTimeout(() => {
        document.getElementById('csv-download').click();
        this.generating = false;
        this.exportData = [];
      }, 1500);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
</style>