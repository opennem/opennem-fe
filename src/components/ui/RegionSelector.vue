<template>
  <div class="region-selector dropdown" :class="{'is-active': dropdownActive}">
    <a class="dropdown-trigger" v-on-clickaway="onClickAway" @click="handleClick">
      <span>
        <strong v-if="isHome && isEnergyRoute">NEM</strong>
        <strong v-else-if="isHome && !isEnergyRoute">All Regions</strong>
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
            <span v-if="isEnergyRoute">NEM</span>
            <span v-else>All Regions</span>
          </a>
          <a class="dropdown-item"
            v-if="!isEnergyRoute"
            :class="{ selected: isCurrentSelection('nem')}"
            @click="handleRegionChange('nem')"
          >
            NEM
          </a>
          <hr v-if="!isEnergyRoute || !isHome" class="dropdown-divider">
          <a 
            v-for="region in regions"
            v-show="!isEnergyRoute || !isWA(region.id)"
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
    haveEnergy() {
      return this.$route.params.region !== 'nem' && this.$route.params.region !== 'wa';
    },
    isHome() {
      const routeName = this.$route.name;
      return routeName === 'home-energy' || routeName === 'home-facilities';
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
      const view = this.isEnergyRoute ? 'energy' : 'facilities';
      this.$store.dispatch('region', `${regionId}1`);
      this.$router.push({ name: `region-${view}`, params: { region: regionId } });
      window.scrollTo(0, 0);
    },
    isCurrentSelection(id) {
      return this.$route.params.region === id;
    },
    goHome() {
      const view = this.isEnergyRoute ? 'energy' : 'facilities';
      this.$store.dispatch('region', 'nem');
      this.$router.push({ name: `home-${view}` });
    },
    isWA(regionId) {
      return regionId === 'wa';
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

.region-selector {
  justify-content: center;
  font-size: 1.1rem;

  @include tablet {
    font-size: 1.2rem;
  }

  a.dropdown-trigger {
    color: #000;
    font-family: $header-font-family;

    .fal {
      color: $opennem-primary-alpha;
    }

    span {
      padding: 2px 6px;
      border-radius: 3px;
    }

    &:hover span {
      background-color: rgba(255,255,255,0.5);
    }
  }

  .dropdown-menu {
    min-width: auto;

    @include tablet {
      min-width: 10.5rem;
    }
  }
}
</style>
