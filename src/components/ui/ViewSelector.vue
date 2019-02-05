<template>
  <div class="view-selector dropdown" :class="{'is-active': dropdownActive}">
    <a class="dropdown-trigger" v-on-clickaway="onClickAway" @click="handleClick">
      <span>
        <strong v-if="isEnergy">Energy</strong>
        <strong v-else>Generators</strong>
        <font-awesome-icon class="fal" :icon="iconDown" />
      </span>          
    </a>

    <transition name="slide-down-fade">
      <div v-if="dropdownActive" class="dropdown-menu">
        <div class="dropdown-content">
          <a class="dropdown-item"
            @click="goHome()"
            :class="{ selected: isEnergy }"
          >
            Energy
          </a>
          <a class="dropdown-item"
            @click="goToGeneratorsView()"
            :class="{ selected: !isEnergy }"
          >
            Generators
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
      return routeName === 'home-energy';
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
    handleRegionChange() {
      // this.$store.dispatch('region', `${regionId}1`);
      // this.$router.push({ name: 'regions', params: { region: regionId } });
    },
    isCurrentSelection(id) {
      return this.$route.params.region === id;
    },
    goHome() {
      this.$store.dispatch('region', 'nem');
      this.$router.push({ name: 'home-energy' });
    },
    goToGeneratorsView() {
      this.$router.push({ name: 'home-generators' });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

.view-selector {
  font-family: $header-font-family;
  font-size: 1.2rem;

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
  .view-selector {
    font-size: 1.4rem;
  }
}
</style>