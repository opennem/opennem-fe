<template>
  <div class="">
    <AppLogo class="logo" />
  </div>
</template>

<script>
import AppLogo from '~/components/ui/Logo'

export default {
  components: {
    AppLogo
  },

  head: {
    titleTemplate: 'Open Electricity Experiments'
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.container-fluid {
  margin-top: 1rem;
}
:deep(.logo img) {
  max-height: 50px;
}
</style>
