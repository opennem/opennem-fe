<template>
  <div class="region-selector dropdown" :class="{'is-active': dropdownActive}">
    <a class="dropdown-trigger" v-on-clickaway="onClickAway" @click="handleClick">
      <img class="logo" src="../../assets/opennem-logo.svg" alt="OpenNEM logo" />
      <span>
        <strong v-if="isHome">All Regions</strong>
        <strong v-else>{{regionLabel}}</strong>
        <font-awesome-icon class="fal" :icon="iconDown" />
      </span>          
    </a>

    <transition name="slide-down-fade">
      <div v-if="dropdownActive" class="dropdown-menu">
        <div class="dropdown-content">
          <a class="dropdown-item"
            v-if="!isHome"
            @click="goHome()"
          >
            All Regions
          </a>
          <hr v-if="!isHome" class="dropdown-divider">
          <a 
            v-for="region in regions" 
            :key="region.id" 
            @click="handleRegionChange(region.id)" 
            class="dropdown-item"
            :class="{ selected: isCurrentSelection(region.id)}"
          >
            {{region.label}}
          </a>
        </div>
      </div>
    </transition> 
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faAngleDown } from '@fortawesome/fontawesome-pro-light';
import { getAllRegions, getRegionLabel } from '@/domains/regions';

export default {
  name: 'region-selector',
  mixins: [clickaway],
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      dropdownActive: false,
      regions: getAllRegions(),
    };
  },
  computed: {
    regionLabel() {
      return getRegionLabel(this.$route.params.region);
    },
    isHome() {
      return this.$route.name === 'home';
    },
    iconDown() {
      return faAngleDown;
    },
  },
  methods: {
    handleClick() {
      const isActive = !this.dropdownActive;
      this.dropdownActive = isActive;
    },
    onClickAway() {
      this.dropdownActive = false;
    },
    handleRegionChange(regionId) {
      this.$router.push({ name: 'regions', params: { region: regionId } });
    },
    isCurrentSelection(id) {
      return this.$route.params.region === id;
    },
    goHome() {
      this.$router.push({ name: 'home' });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

.region-selector {
  font-family: $header-font-family;
  font-size: 1.4rem;

  @include tablet {
    font-size: 2rem;
  }

  a.dropdown-trigger {
    color: #000;

    .fal {
      position: relative;
      top: 3px;
    }

    span {
      position: relative;
      top: 2px;
      border-bottom: 1px dashed $opennem-primary-alpha;
    }
  }
  
}
</style>