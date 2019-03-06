<template>
  <div class="buttons">
    <button id="png-btn" class="button is-small is-rounded is-primary is-inverted" @click="showExportPng">
      <span class="icon">
        <font-awesome-icon class="fal fa-fw" :icon="iconChart" />
      </span>
      <span>PNG</span>
    </button>
    
    <csv
      :data="exportData"
      :fields="csvHeaders"
      :name="`${exportName}.csv`">
        <button id="csv-btn" class="csv-btn button is-small is-rounded is-primary"
          :class="{
            'is-inverted': !generating,
            'is-loading': generating
          }" @click="handleCSVClick">
          <span class="icon">
            <font-awesome-icon class="fal fa-fw" :icon="iconCSV" />
          </span>
          <span>CSV</span>
        </button>
    </csv>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faTable, faChartArea } from '@fortawesome/fontawesome-pro-light';
import { getCSVHeaders } from '@/domains/graphs';
import Csv from './Csv';

export default {
  name: 'export-buttons',
  components: {
    Csv,
    FontAwesomeIcon,
  },
  data() {
    return {
      generating: false,
    };
  },
  computed: {
    ...mapGetters({
      exportData: 'getExportData',
      exportName: 'getExportName',
      visType: 'visType',
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
    handleCSVClick() {
      this.generating = true;
      setTimeout(() => {
        this.generating = false;
      }, 1000);
    },
    showExportPng() {
      this.$store.dispatch('setExportPng', true);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
</style>