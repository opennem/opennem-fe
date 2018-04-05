<template>
  <div>
    <button class="export-btn button is-small is-rounded is-danger is-inverted"
      @click="handleClick">Export</button>

    <transition name="fade">
      <div class="modal is-active" v-if="modalActive">
        <div class="modal-background"></div>
        <div class="modal-content">
          <div class="panel">
            <p class="panel-heading">
              Export as...
            </p>
            
            <a class="panel-block">
              <span class="panel-icon">
                <i class="fas fa-book"></i>
              </span>
              Image (PNG)
            </a>

            <csv
              :data="chartData"
              :fields="csvHeaders"
              :name="`${exportName}.csv`">
                <span class="panel-icon">
                  <i class="fas fa-book"></i>
                </span>
                Spreadsheet (CSV)
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
      csvHeaders: getCSVHeaders(),
    };
  },
  computed: {
    ...mapGetters({
      chartData: 'getExportData',
      exportName: 'getExportName',
    }),
  },
  methods: {
    handleClick() {
      const isActive = !this.modalActive;
      this.modalActive = isActive;
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

.modal-content {
  max-width: 300px;
  background: #fff;
}
</style>