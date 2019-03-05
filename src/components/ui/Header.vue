<template>
  <nav role="navigation" aria-label="main dropdown navigation">
    <ui-warning />
    <export-header v-if="isExportPng" />

    <div class="level" v-else>
      <div class="level-left">
        <region-selector />
        <view-selector />
      </div>

      <div class="level-right" v-show="isEnergyRoute">
        <export-buttons style="margin: 1rem 0 0 0" />
      </div>

      <div class="level-right" v-show="isGeneratorsRoute">
        <input 
          class="input is-rounded filter-station-input"
          type="text"
          placeholder="Filter By Station Name"
          v-model="filterGeneratorName"
        />
      </div>
    </div>
  </nav>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import EventBus from '@/lib/event-bus';
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
  data() {
    return {
      filterGeneratorName: '',
    };
  },

  computed: {
    ...mapGetters({
      isExportPng: 'isExportPng',
    }),
    isEnergyRoute() {
      return _.includes(this.$route.name, 'energy');
    },
    isGeneratorsRoute() {
      return _.includes(this.$route.name, 'generators');
    },
  },

  watch: {
    filterGeneratorName(string) {
      EventBus.$emit('generators.name.filter', string);
    },
  },

  mounted() {
    EventBus.$on('generators.filter.clear', this.clearFilter);
  },

  beforeDestroy() {
    EventBus.$off('generators.filter.clear');
  },

  methods: {
    clearFilter() {
      this.filterGeneratorName = '';
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