<template>
  <div class="drawer-wrapper" :class="{ open: drawer }" @click="close">
    <div class="drawer">
      <a class="close-btn" @click="close">
        <font-awesome-icon class="fal" :icon="iconClose" />
      </a>

      <div class="logo-wrapper" @click="close">
        <img class="logo" src="../../assets/opennem-logo.svg" alt="OpenNEM logo" />
        <!-- <span>OpenNEM</span> -->
      </div>

      <div class="menu">
        <a class="menu-item"
          @click="goToEnergyView()"
          :class="{ selected: isEnergy }"
        >
          Energy
          <span class="icon" v-if="!isEnergy">
            <font-awesome-icon class="fal" :icon="iconRight" />
          </span>
        </a>
        
        <a class="menu-item"
          @click="gotToFacilitiesView()"
          :class="{ selected: !isEnergy }"
        >
          Facilities
          <span class="icon" v-if="isEnergy">
            <font-awesome-icon class="fal" :icon="iconRight" />
          </span>
        </a>
      </div>

      <div class="menu">
        <a class="all-regions menu-item"
          @click="goHome()"
          :class="{ selected: isHome }"
        >
          All Regions
          <span class="icon" v-if="!isHome">
            <font-awesome-icon class="fal" :icon="iconRight" />
          </span>
        </a>
        <a 
          v-for="region in regions" 
          :key="region.id" 
          @click="handleRegionChange(region.id)" 
          class="menu-item"
          :class="{ selected: isCurrentSelection(region.id)}"
        >
          {{region.label}}
          <span class="icon" v-if="!isCurrentSelection(region.id)">
            <font-awesome-icon class="fal" :icon="iconRight" />
          </span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faChevronRight, faTimes } from '@fortawesome/fontawesome-pro-light';
import { getAllRegions } from '@/domains/regions';

const DELAY = 250;

export default {
  components: {
    FontAwesomeIcon,
  },

  props: {
    open: Boolean,
  },

  data() {
    return {
      drawer: false,
      regions: getAllRegions(),
    };
  },

  computed: {
    isHome() {
      const routeName = this.$route.name;
      return routeName === 'home-energy' || routeName === 'home-facilities';
    },
    isEnergy() {
      return _.includes(this.$route.name, 'energy');
    },
    iconRight() {
      return faChevronRight;
    },
    iconClose() {
      return faTimes;
    },
    routeParentName() {
      return this.$route.matched[0].name;
    },
  },

  watch: {
    open(value) {
      this.drawer = value;
    },
  },

  methods: {
    onClickAway() {
      this.dropdownActive = false;
    },
    isCurrentSelection(id) {
      return this.$route.params.region === id;
    },
    goHome() {
      this.close();
      setTimeout(() => {
        const view = this.isEnergy ? 'energy' : 'facilities';
        this.$store.dispatch('region', 'nem');
        this.$router.push({ name: `home-${view}` });
      }, DELAY);
    },
    goToEnergyView() {
      this.close();
      setTimeout(() => {
        this.$router.push({ name: `${this.routeParentName}-energy` });
      }, DELAY);
    },
    gotToFacilitiesView() {
      this.close();
      setTimeout(() => {
        this.$router.push({ name: `${this.routeParentName}-facilities` });
      }, DELAY);
    },
    handleRegionChange(regionId) {
      this.close();
      setTimeout(() => {
        const view = this.isEnergy ? 'energy' : 'facilities';
        this.$store.dispatch('region', `${regionId}1`);
        this.$router.push({ name: `region-${view}`, params: { region: regionId } });
      }, DELAY);
    },

    close() {
      window.scrollTo(0, 0);
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.logo-wrapper {
  width: 100%;
  padding: 10px 0 0 18px;

  span {
    color: $opennem-primary;
    font-family: $header-font-family;
    font-weight: 600;
    position: relative;
    top: 2px;
    font-size: 1.1rem;
  }
}

.drawer-wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  left: -100%;
  transition: all .3s linear;

  .drawer {
    position: fixed;
    top: 0;
    bottom: 0;
    left: -100%;
    width: 300px;
    background-color: #eee;
    transition: all .2s ease-in-out;
  }

  &.open {
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.85);

    .drawer {
      left: 0;
    }
  }
}

.menu {
  margin: 20px 0;

  .menu-item {
    display: block;
    padding: 4px 20px;
    color: #000;
    border-bottom: 1px solid #dedede;

    &:hover {
      background: #dedede;
    }

    &.all-regions {
      border-bottom-color: #999;
    }

    &.selected {
      font-weight: 600;
      border-right: 6px solid $opennem-primary-alpha;
      color: $opennem-primary-alpha;
    }

    .icon {
      position: absolute;
      right: 15px;
      color: rgba(100, 100, 100, 0.5);
    }
  }
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 22px;
  font-size: 20px;
}
</style>