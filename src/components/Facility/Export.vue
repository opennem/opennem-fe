<template>
  <button class="csv-btn button is-small is-rounded is-primary is-inverted">
    <download-csv
      :data="facilityExportData"
      :name="`facilities.csv`"
    >
      <span class="icon">
        <font-awesome-icon class="fal fa-fw" :icon="iconCSV" />
      </span>
      <span class="csv-label">Data</span>
    </download-csv>
  </button>
</template>

<script>
import { mapGetters } from 'vuex';
import DownloadCsv from 'vue-json-csv';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faTable } from '@fortawesome/fontawesome-pro-light';

export default {
  components: {
    DownloadCsv,
    FontAwesomeIcon,
  },

  computed: {
    ...mapGetters({
      facilityExportData: 'facilityExportData',
    }),
    iconCSV() {
      return faTable;
    },
  },
};
</script>

<style lang="scss" scoped>
.csv-btn {
  .fal {
    font-size: 12px;
  }

  .csv-label {
    position: relative;
    top: -2px;
    left: -2px;
  }
}
</style>
