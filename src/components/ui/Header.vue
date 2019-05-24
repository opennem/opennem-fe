<template>
  <nav role="navigation" aria-label="main dropdown navigation" :class="{ 'is-export-header': isExportPng }">
    <ui-warning />
    <export-header v-if="isExportPng" />

    <div class="app-menu" v-else>
      <div class="logo-wrapper" @click="openDrawer = !openDrawer">
        <span class="menu-btn">
          <font-awesome-icon class="fal" :icon="iconMenu" />
        </span>
        <img class="logo" src="../../assets/opennem-logo.svg" alt="OpenNEM logo" />
        <span class="region-label">{{regionLabel}}</span>
      </div>

      <drawer
        :open="openDrawer"
        @close="openDrawer = false"
        v-if="widthBreak"
      />

      <div class="selectors-wrapper" v-if="!widthBreak">
        <view-selector class="selectors-view" />
        <region-selector class="selectors-region" />
      </div>

      <div class="export-wrapper" v-if="!widthBreak">
        <export-buttons class="export-energy" v-show="isEnergyRoute" />
        <facilities-export class="export-facility" v-show="isFacilityRoute" />
      </div>
    </div>
  </nav>
</template>

<script>
import * as _ from 'lodash';
import { mapGetters } from 'vuex';
import { mixin as clickaway } from 'vue-clickaway';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faEllipsisV } from '@fortawesome/fontawesome-pro-light';
import UiWarning from '@/components/ui/Warning';
import { getRegionLabel } from '@/domains/regions';
import RegionSelector from './RegionSelector';
import ViewSelector from './ViewSelector';
import ExportHeader from '../Export/Header';
import ExportButtons from '../Export/Buttons';
import FacilitiesExport from '../Facility/Export';
import Drawer from './Drawer';

export default {
  name: 'header-nav',
  mixins: [clickaway],
  components: {
    FontAwesomeIcon,
    RegionSelector,
    ViewSelector,
    ExportHeader,
    ExportButtons,
    UiWarning,
    FacilitiesExport,
    Drawer,
  },

  data() {
    return {
      openDrawer: false,
      windowWidth: window.innerWidth,
    };
  },

  computed: {
    ...mapGetters({
      isExportPng: 'isExportPng',
    }),
    widthBreak() {
      return this.windowWidth < 769;
    },
    isEnergyRoute() {
      return _.includes(this.$route.name, 'energy');
    },
    isFacilityRoute() {
      return _.includes(this.$route.name, 'facilities');
    },
    regionLabel() {
      const region = getRegionLabel(this.$route.params.region);
      return region || 'All Regions';
    },
    iconMenu() {
      return faEllipsisV;
    },
  },

  created() {
    window.addEventListener('resize', _.debounce(() => {
      this.windowWidth = window.innerWidth;
      // 769 tablet and up
    }, 200));
  },

  methods: {
    onClickAway() {
      this.openDrawer = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

nav {
  background-color: $background-alpha;
  position: relative;
  z-index: 99;
  max-width: 1400px;
  margin: 0 auto;

  @include tablet {
    position: sticky;
    top: -10px;
    padding-bottom: 10px;

    &.is-export-header {
      top: 0;
      padding-top: 10px;
      border-bottom: 1px solid #ccc;
    }
  }
}

.app-menu {
  display: flex;
  flex-wrap: wrap;

  @include tablet {
    padding: 1em 1em 0;
  }
}

.logo-wrapper {
  width: 100%;
  padding: 8px 8px 8px 22px;

  @include tablet {
    width: auto;
    text-align: left;
    padding-bottom: 0;
    padding-left: 0;
    border-left: none;
  }

  span {
    color: $opennem-primary;
    font-family: $header-font-family;
    font-weight: 600;
    position: relative;
    top: 2px;
    font-size: 1.1rem;

    @include tablet {
      font-size: 1.2rem;
      display: none;
    }
  }

  .region-label {
    color: #000;
    margin-left: 3px;
  }

  .menu-btn {
    font-size: 30px;
    position: absolute;
    left: 10px;
    top: 1px;
  }
}

.selectors-wrapper {
  display: flex;
  width: 100%;
  justify-content: center;

  .selectors-view {
    width: 45%;
  }
  .selectors-region {
    width: 45%;
  }

  @include tablet {
    width: auto;
    align-items: center;
    position: relative;
    top: 3px;

    .selectors-view, 
    .selectors-region {
      width: auto;
    }
  }
}

.export-wrapper {
  position: absolute;
  right: 10px;
  top: 12px;

  @include tablet {
    top: 29px;
  }
}
</style>
