<template>
  <nav role="navigation" aria-label="main dropdown navigation">
    <export-header v-if="isExportPng" />

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
import ExportHeader from '../Export/Header';
import ExportModal from '../Export/Modal';

export default {
  name: 'header-nav',
  components: {
    RegionSelector,
    DateSelector,
    ExportHeader,
    ExportModal,
  },
  computed: {
    ...mapGetters({
      isExportPng: 'isExportPng',
    }),
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
  padding: 0.5rem 0 0.75rem;
}

h1 {
  font-weight: bold;
}

.level {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.level-right {
  margin-top: 0;
}

</style>