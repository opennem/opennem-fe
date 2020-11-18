<template>
  <div class="container-fluid">
    <transition name="slide-down-fade">
      <FeatureToggle 
        v-if="showFeatureToggle"
        class="features"
        @done="setShowFeatureToggle(false)" />
    </transition>
    <app-header />
    <nuxt/>
    <app-footer @showFeatureToggle="setShowFeatureToggle(true)" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import _debounce from 'lodash.debounce'

import AppHeader from '~/components/layout/AppFacilityHeader'
import AppFooter from '~/components/layout/AppFooter'
import FeatureToggle from '@/components/FeatureToggle'

export default {
  components: {
    AppHeader,
    AppFooter,
    FeatureToggle
  },

  computed: {
    ...mapGetters({
      showFeatureToggle: 'app/showFeatureToggle'
    })
  },

  mounted() {
    this.setWindowWidth(window.innerWidth)
    this.$nextTick(() => {
      window.addEventListener(
        'resize',
        _debounce(() => {
          this.setWindowWidth(window.innerWidth)
        }, 200)
      )
    })
  },

  methods: {
    ...mapMutations({
      setWindowWidth: 'app/windowWidth',
      setShowFeatureToggle: 'app/showFeatureToggle'
    })
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.container-fluid {
  max-width: 1400px;
  margin: 0 auto 1rem;
  @include tablet {
    margin-bottom: 3rem;
  }

  .features {
    position: fixed;
    z-index: 99999;
    width: 300px;
    left: 50%;
    margin-left: -150px;
  }
}
</style>
