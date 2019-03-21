<template>
  <nav role="navigation" aria-label="main dropdown navigation">
    <ui-warning />
    <export-header v-if="isExportPng" />

    <div class="level" v-else>
      <div class="level-left">
        <region-selector />
      </div>

      <div class="level-right">
        <export-buttons style="margin: 1rem 0 0 0" />
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex';
import UiWarning from '@/components/ui/Warning';
import RegionSelector from './RegionSelector';
import ExportHeader from '../Export/Header';
import ExportButtons from '../Export/Buttons';

export default {
  name: 'header-nav',
  components: {
    RegionSelector,
    ExportHeader,
    ExportButtons,
    UiWarning,
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
  padding: 0 0 0.1rem;
}

h1 {
  font-weight: bold;
}

.level {
  max-width: 1400px;
  margin: 0 auto;
  padding: .1rem 1rem .1rem;
}

.level-right {
  margin-top: 0;
}

.fal {
  font-size: 16px;
}
.csv-btn .fal {
  font-size: 16px;
}

@media only screen and (min-width: 500px) {
  .level,
  .level-right {
    display: flex;
  }
}

</style>