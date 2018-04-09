<template>
  <nav role="navigation" aria-label="main dropdown navigation">
    <div class="level export-nav is-mobile" v-if="isExportPng">
      <div class="level-left">
        <h1>Export as Image (PNG)</h1>
      </div>
      <div class="level-right">
        <div class="buttons">
          <button class="button is-small is-rounded is-primary is-inverted" @click="cancelExport">
            Cancel
          </button>
          <button class="button is-small is-rounded is-primary">
            Download
          </button>
        </div>
      </div>
    </div>
    <div class="level" v-else>
      <div class="level-left">
        <region-selector />
      </div>

      <div class="level-right">
        <date-selector />
        <export-modal />
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex';
import RegionSelector from './RegionSelector';
import DateSelector from './DateSelector';
import ExportModal from '../Export/Modal';

export default {
  name: 'header-nav',
  components: {
    RegionSelector,
    DateSelector,
    ExportModal,
  },
  computed: {
    ...mapGetters({
      isExportPng: 'isExportPng',
    }),
  },
  methods: {
    cancelExport() {
      this.$store.dispatch('setExportPng', false);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

nav {
  position: sticky;
  z-index: 99;
  top: 0;
  background-color: $background-alpha;
  box-shadow: 0 1px 4px rgba(10, 10, 10, 0.05);
  padding: 0.5rem 0 0.75rem;
}

h1 {
  font-weight: bold;
}

.level {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;

  &.export-nav {
    max-width: 650px;
  }
}

.level-right {
  margin-top: 0;
}

</style>