<template>
  <div id="app">

    <section class="main" v-if="showMainNav">
      <app-header />

      <div class="router-view-container">
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
      return name === 'home' || name === 'regions';
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
  }
}
</style>
