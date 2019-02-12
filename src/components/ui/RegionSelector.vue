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
import _ from 'lodash';
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
      const routeName = this.$route.name;
      return routeName === 'home-energy' || routeName === 'home-generators';
    },
    iconDown() {
      return faAngleDown;
    },
    isEnergyRoute() {
      return _.includes(this.$route.name, 'energy');
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
      const view = this.isEnergyRoute ? 'energy' : 'generators';
      this.$store.dispatch('region', `${regionId}1`);
      this.$router.push({ name: `region-${view}`, params: { region: regionId } });
    },
    isCurrentSelection(id) {
      return this.$route.params.region === id;
    },
    goHome() {
      const view = this.isEnergyRoute ? 'energy' : 'generators';
      this.$store.dispatch('region', 'nem');
      this.$router.push({ name: `home-${view}` });
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

  a.dropdown-trigger {
    color: #000;

    .fal {
      position: relative;
      top: 3px;
      color: $opennem-primary-alpha;
    }

    span {
      position: relative;
      top: 2px;
      padding: 0.4rem 1rem 0.5rem 0.9rem;
      border-radius: 3rem;
    }

    &:hover span {
      background-color: rgba(255,255,255,0.5);
    }
  }
}
@media only screen and (min-width: 600px) {
  .region-selector {
    font-size: 2rem;
  }
}
</style>