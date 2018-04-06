<template>
  <div id="app">

    <section v-if="showMainNav">
      <app-header />
      <div class="router-view-container">
        <router-view />
      </div>
      <app-footer />
    </section>

    <transition name="fade-quick">
      <section class="about-page" v-if="isAbout">
        <router-view/>
        <app-footer /> 
      </section>
    </transition>

    <transition name="fade">
      <section class="widget-page" v-if="isWidget">
        <router-view/>
      </section>
    </transition>

  </div>  
</template>

<script>
import AppHeader from '@/components/ui/Header';
import AppFooter from '@/components/ui/Footer';

export default {
  name: 'app',
  components: {
    AppHeader,
    AppFooter,
  },
  computed: {
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
  padding-bottom: 2rem;
}
section {
  @include widescreen {
    margin-top: 2rem;
  }
}
.router-view-container {
  max-width: 1400px;
  min-height: 500px;
  margin: 1rem auto;
  padding: 0 1rem;
}
</style>
