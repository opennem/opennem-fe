<template>
  <div id="app">
    <transition name="fade-quick">
      <section v-if="isAbout">
        <router-view/>
        <Footer />
      </section>
    </transition>

    <section v-if="!isAbout">
      <header-nav></header-nav>
      <div class="router-view-container">
        <router-view/>
      </div>
      <Footer />
    </section>   
  </div>  
</template>

<script>
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default {
  name: 'app',
  components: {
    HeaderNav: Header,
    Footer,
  },
  computed: {
    isAbout() {
      return this.$route.name === 'about';
    },
  },
};
</script>

<style lang="scss">
// Vue Transitions
@import "styles/variables.scss";
@import "styles/vue-transitions.css";
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
