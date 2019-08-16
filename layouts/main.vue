<template>
  <div class="container-fluid">
    <app-header />
    <nuxt/>
    <app-footer />
  </div>
</template>

<script>
import { lsGet, lsSet } from '~/services/LocalStorage'
import AppHeader from '~/components/layout/AppHeader'
import AppFooter from '~/components/layout/AppFooter'

const MutationTypes = {
  FEATURE_TOGGLE_EMISSIONS: 'FEATURE_TOGGLE_EMISSIONS'
}
export default {
  middleware: 'meta',
  components: {
    AppHeader,
    AppFooter
  },
  mounted() {
    const featureEmissions = lsGet(MutationTypes.FEATURE_TOGGLE_EMISSIONS)
    // set up local storage
    if (featureEmissions) {
      this.$store.dispatch('featureEmissions', featureEmissions)
    } else {
      lsSet(MutationTypes.FEATURE_TOGGLE_EMISSIONS, false)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.container-fluid {
  margin-bottom: 1rem;
  @include tablet {
    margin-bottom: 3rem;
  }
}
</style>
