<template>
  <div class="region-selector dropdown" :class="{'is-active': dropdownActive}">
    <a class="dropdown-trigger" v-on-clickaway="onClickAway" @click="handleClick">
      <img class="logo" src="../../assets/opennem-logo.svg" alt="OpenNEM logo">            
      <strong v-if="isHome">All Regions</strong>
      <strong v-else>{{regionLabel}}</strong>
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
import { getAllRegions, getRegionLabel } from '@/domains/regions';

export default {
  name: 'region-selector',
  mixins: [clickaway],
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
  font-size: 1.3rem;

  @include tablet {
    font-size: 1.7rem;
  }

  .logo {
    margin-right: 0.1rem;
    max-height: 1.6rem;
    vertical-align: text-bottom;

    @include tablet {
      max-height: 2rem;
    }
  }

  a.dropdown-trigger {
    color: #000;

    strong {
      border-bottom: 1px dashed $opennem-primary-alpha;
    }
  }
  
}
</style>