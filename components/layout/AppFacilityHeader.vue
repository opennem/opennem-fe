<template>
  <header>
    <nuxt-link 
      :to="path" 
      class="back-link">
      <i class="fal fa-chevron-left"/>
      <AppLogo class="logo" />
      <h1>Facilities</h1>
    </nuxt-link>
  </header>
</template> 

<script>
import { mapGetters } from 'vuex'
import AppLogo from '~/components/ui/Logo'

export default {
  components: {
    AppLogo
  },
  computed: {
    ...mapGetters({
      previousPath: 'facility/previousPath'
    }),
    path() {
      return this.previousPath === '' ? '/facilities/all' : this.previousPath
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.back-link {
  $item-margin: 0.75rem;
  display: inline-flex;
  align-items: center;
  border-radius: $header-hover-radius;
  margin-top: 1.5rem;
  margin-left: 1.5rem;
  padding: $app-padding / 3 $app-padding / 2;
  background-color: $background-alpha;

  i {
    font-size: 1.6rem;
    margin-right: $item-margin;
  }

  .logo {
    width: 2.3rem;
    position: relative;
    top: 3px;
    margin-right: $item-margin;
  }

  h1 {
    font-family: $header-font-family;
    font-weight: 700;
    color: #000;
    font-size: 1.2rem;
  }

  &:hover {
    i {
      color: $opennem-link-color;
    }
    background-color: rgba(255, 255, 255, 0.55);
  }
}
</style>
