<template>
  <nav role="navigation" aria-label="main dropdown navigation">
    <ui-warning />
    <export-header v-if="isExportPng" />

    <div class="level" v-else>
      <div class="level-left">
        <img class="logo" src="../../assets/opennem-logo.svg" alt="OpenNEM logo" style="margin-right: 0.5rem; margin-top: 5px;" />
        <view-selector />
        <region-selector style="position: relative; left: -10px;" />
      </div>

      <div class="level-right" v-show="isEnergyRoute">
        <export-buttons style="padding: 10px 0 0 0" />
      </div>
    </div>
  </nav>
</template>

<script>
import * as _ from 'lodash';
import { mapGetters } from 'vuex';
import UiWarning from '@/components/ui/Warning';
import RegionSelector from './RegionSelector';
import ViewSelector from './ViewSelector';
import ExportHeader from '../Export/Header';
import ExportButtons from '../Export/Buttons';

export default {
  name: 'header-nav',
  components: {
    RegionSelector,
    ViewSelector,
    ExportHeader,
    ExportButtons,
    UiWarning,
  },

  computed: {
    ...mapGetters({
      isExportPng: 'isExportPng',
    }),
    isEnergyRoute() {
      return _.includes(this.$route.name, 'energy');
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

.filter-station-input {
  width: 20vw;
  margin-top: 10px;
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