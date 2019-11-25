<template>
  <div class="container-fluid">
    <app-header />
    <nuxt/>
    <app-footer />
  </div>
</template>

<script>
import AppHeader from '~/components/layout/AppHeader'
import AppFooter from '~/components/layout/AppFooter'

export default {
  middleware: 'meta',
  components: {
    AppHeader,
    AppFooter
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
