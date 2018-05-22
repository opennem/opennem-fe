<template>
  <div>
    <button class="export-btn button is-small is-rounded is-primary is-inverted"
      @click="handleClick">Export</button>

    <transition name="fade">
      <div class="modal is-active" v-if="modalActive">
        <div class="modal-background"></div>
        <div class="modal-content">
          <div class="panel">
            <h3 class="panel-heading">
              Export as...
            </h3>
            
            <a class="panel-block" @click="showExportPng" v-if="isChrome">
              Image (PNG)
            </a>

            <csv
              :data="chartData"
              :fields="csvHeaders"
              :name="`${exportName}.csv`">
                <a class="panel-block" @click="closeModal">
                  Spreadsheet (CSV)
                </a>
            </csv>
          </div>
        </div>
        <button class="modal-close is-large" aria-label="close" @click="handleClick"></button>
      </div>
    </transition>
    
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { isChrome } from '@/lib/device';
import { getCSVHeaders } from '@/domains/graphs';
import Csv from './Csv';

export default {
  name: 'export-modal',
  components: {
    Csv,
  },
  data() {
    return {
      modalActive: false,
      isChrome: isChrome(),
    };
  },
  computed: {
    ...mapGetters({
      chartData: 'getExportData',
      exportName: 'getExportName',
      visType: 'visType',
    }),
    csvHeaders() {
      return getCSVHeaders(this.$store.getters.visType);
    },
  },
  methods: {
    handleClick() {
      const isActive = !this.modalActive;
      this.modalActive = isActive;
    },
    closeModal() {
      this.modalActive = false;
    },
    showExportPng() {
      this.$store.dispatch('setExportPng', true);
      this.closeModal();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.export-btn {
  position: absolute;
  right: 1rem;
  top: 1.5rem;

  @include tablet {
    margin-left: 1rem;
    position: relative;
    top: 5px;
    right: 0;
  }
}

.panel-heading {
  font-size: 0.9rem;
  font-weight: 600;
}
.panel-block {
  padding: 0.5rem 1rem;
}

.modal-content {
  border-radius: 5px;
  max-width: 300px;
  background: #fff;
}
</style>