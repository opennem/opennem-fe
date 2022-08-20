<template>
  <div class="container-fluid">
    <h1>
      You are viewing data and features that are still in
      <strong>development</strong>.
    </h1>

    <app-header />
    <nuxt />
    <app-footer v-if="!widthBreak" />
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
import _debounce from 'lodash.debounce'

import AppHeader from '~/components/layout/AppFacilityHeader'
import AppFooter from '~/components/layout/AppFooter'

export default {
  components: {
    AppHeader,
    AppFooter
  },

  computed: {
    ...mapGetters({
      widthBreak: 'app/widthBreak'
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
      setWindowWidth: 'app/windowWidth'
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

  h1 {
    background-color: #ffdd57;
    width: 100%;
    font-size: 12px;
    padding: 3px;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 9999;
  }
}
</style>
