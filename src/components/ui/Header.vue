<template>
  <nav role="navigation" aria-label="main dropdown navigation">
    <div class="level">
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

.level {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.level-right {
  margin-top: 0;
}

</style>