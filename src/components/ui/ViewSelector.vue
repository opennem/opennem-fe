<template>
  <div class="view-selector dropdown" :class="{'is-active': dropdownActive}">
    <a class="dropdown-trigger" v-on-clickaway="onClickAway" @click="handleClick">
      <span>
        <strong v-if="isEnergy">Energy</strong>
        <strong v-else>Facilities</strong>
        <font-awesome-icon class="fal" :icon="iconDown" />
      </span>          
    </a>

    <transition name="slide-down-fade">
      <div v-if="dropdownActive" class="dropdown-menu">
        <div class="dropdown-content">
          <a class="dropdown-item"
            v-if="haveEnergy"
            @click="goToEnergyView()"
            :class="{ selected: isEnergy }"
          >
            Energy
          </a>
          <a class="dropdown-item"
            @click="gotToFacilitiesView()"
            :class="{ selected: !isEnergy }"
          >
            Facilities
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

export default {
  name: 'view-selector',
  mixins: [clickaway],
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      dropdownActive: false,
    };
  },
  computed: {
    isEnergy() {
      const routeName = this.$route.name;
      return routeName === 'home-energy' || routeName === 'region-energy';
    },
    haveEnergy() {
      return this.$route.name !== 'home-facilities' && this.$route.params.region !== 'wa'
    },
    iconDown() {
      return faAngleDown;
    },
    routeParentName() {
      return this.$route.matched[0].name;
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
    isCurrentSelection(id) {
      return this.$route.params.region === id;
    },
    goToEnergyView() {
      if (this.$route.params.region === 'nem') {
        this.$router.push({ name: 'home-energy' });
      } else {
        this.$router.push({ name: `${this.routeParentName}-energy` });
      }
    },
    gotToFacilitiesView() {
      if (this.$route.name === 'home-energy') {
        this.$router.push({ name: 'region-facilities', params: { region: 'nem' } });
      } else {
        this.$router.push({ name: `${this.routeParentName}-facilities` });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

.view-selector {
  font-size: 1.1rem;
  justify-content: center;

  @include tablet {
    font-size: 1.2rem;
  }

  a.dropdown-trigger {
    color: #000;
    display: inline-block;
    font-family: $header-font-family;

    .fal {
      color: $opennem-primary-alpha;
    }

    span {
      padding: 2px 8px;
      border-radius: 3px;
    }

    &:hover span {
      background-color: rgba(255,255,255,0.5);
    }
  }

  .dropdown-menu {
    min-width: auto;

    @include tablet {
      min-width: 10rem;
    }
  }
}
</style>
