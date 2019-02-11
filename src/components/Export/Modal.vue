<template>
  <div>
    <button class="export-btn button is-small is-rounded is-primary is-inverted"
      @click="handleClick">
      <font-awesome-icon class="fal fa-fw" :icon="iconExport" />
    </button>

    <transition name="fade">
      <div class="modal is-active" v-if="modalActive">
        <div class="modal-background"></div>
        <div class="modal-content">
          <div class="panel">
            <h3 class="panel-heading">
              Other formats...
            </h3>
            
            <a class="panel-block" @click="showExportPng">
              <span v-if="isChrome">Image (PNG)</span>
              <span v-else>Compact view</span>
            </a>

            <csv
              :data="exportData"
              :fields="csvHeaders"
              :name="`${exportName}.csv`">
                <a class="panel-block" @click="closeModal">
                  Download CSV
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
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faShareAll } from '@fortawesome/fontawesome-pro-light';
import { isChrome } from '@/lib/device';
import { getCSVHeaders } from '@/domains/graphs';
import Csv from './Csv';

export default {
  name: 'export-modal',
  components: {
    Csv,
    FontAwesomeIcon,
  },
  data() {
    return {
      modalActive: false,
      isChrome: isChrome(),
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
    iconExport() {
      return faShareAll;
    },
  },
  methods: {
    handleClick() {
      const isActive = !this.modalActive;
      this.modalActive = isActive;
      if (isActive) {
        this.$store.dispatch('generateExportData');
      }
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

  .fal {
    position: relative;
    top: 1px;
    font-size: 18px;
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
@media only screen and (min-width: 500px) {
  .export-btn {
    position: relative;
    top: 5px;
    right: 0;
  }
}
</style>