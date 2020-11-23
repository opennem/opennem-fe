<template>
  <div class="">
    <AppLogo class="logo" />
    <ul>
      <li>
        <nuxt-link :to="{ path: `/experiments/heatmap/all/` }">
          heat map
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
import AppLogo from '~/components/ui/Logo'
import HeatColumns from '@/components/Vis/_wip/HeatColumns'

export default {
  components: {
    AppLogo
  },

  head: {
    titleTemplate: 'OpenNEM Experiments'
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.container-fluid {
  margin-top: 1rem;
}
::v-deep .logo img {
  max-height: 50px;
}
</style>
