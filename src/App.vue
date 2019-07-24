<template>
  <div id="app">

    <section class="main" v-if="showMainNav">
      <app-header />

      <div class="router-view-container" :class="{ 'facilities-view': isFacilitiesView }">
        <router-view />
        <ui-error />
      </div>

      <app-footer />
    </section>

    <section class="other" v-else>
      <router-view/>
    </section>

  </div>  
</template>

<script>
import { mapGetters } from 'vuex';
import AppHeader from '@/components/ui/Header';
import AppFooter from '@/components/ui/Footer';
import UiError from '@/components/ui/Error';

export default {
  name: 'app',
  components: {
    AppHeader,
    AppFooter,
    UiError,
  },
  computed: {
    ...mapGetters({
      error: 'error',
    }),
    showMainNav() {
      const name = this.$route.name;
      return name === 'home' || name === 'region' ||
        name === 'home-energy' || name === 'home-facilities' ||
        name === 'region-energy' || name === 'region-facilities';
    },
    isFacilitiesView() {
      const name = this.$route.name;
      return name === 'home-facilities' || name === 'region-facilities'
    },
    isAbout() {
      return this.$route.name === 'about';
    },
    isWidget() {
      return this.$route.name === 'widget';
    },
    isNotFound() {
      return this.$route.name === '404';
    },
  },
};
</script>

<style lang="scss">
// Vue Transitions
@import "styles/variables.scss";
@import "styles/vue-transitions.css";
@import "styles/logo.scss";
@import "styles/chart.scss";
@import "styles/table.scss";
@import "styles/dropdown.scss";
@import "styles/button.scss";
@import "styles/date-range.scss";
@import "styles/tooltip.scss";
@import "styles/drawer.scss";

/** Bulma SCSS customisation **/
// 1. Import the initial variables
@import "../node_modules/bulma/sass/utilities/initial-variables.sass";
@import "../node_modules/bulma/sass/utilities/functions.sass";
@import "styles/bulma-derived-variables.scss";
@import "../node_modules/bulma/sass/utilities/derived-variables.sass";
@import "../node_modules/bulma/bulma.sass";

#app {
  font-family: $primary-font-family;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
section {
  @include widescreen {}

  &.notfound-page,
  &.other {
    margin-top: 0;
  }
}
.router-view-container {
  max-width: 1400px;
  min-height: 500px;
  margin: 0.5rem auto 2rem;
  padding: 0 1rem;
  position: relative;

  @include mobile {
    margin: 0 auto;
    padding: 0 1rem;

    &.facilities-view {
      padding: 0;
    }
  }
}

// Map
.map-popup {
  font-family: $primary-font-family;
  font-weight: 600;
  font-size: 18px;

  .leaflet-popup-content-wrapper {
    border-radius: 3px;
    box-shadow: 0 2px 6px rgba(100, 100, 100, 0.8);
  }
  .leaflet-popup-content {
    padding: 3px 9px;
    margin: 0;
  }
  .leaflet-popup-tip-container {
    width: 44px;
  }
  .leaflet-popup-tip {
    width: 10px;
    height: 15px;
  }
  .leaflet-popup-close-button {
    display: none;
  }
  .leaflet-popup-content-wrapper,
  .leaflet-popup-tip {
    background-color: #000;
    color: #fff;
  }
  &.selected .leaflet-popup-content-wrapper,
  &.selected .leaflet-popup-tip {
    background-color: #C74523;
    color: #fff;
  }
}
</style>
