<template>
  <div class="container-fluid">
    <div 
      class="banner has-background-warning"
      v-html="bannerText" />
    <app-header />
    <nuxt/>
    <app-footer />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import intervalToDuration from 'date-fns/intervalToDuration'
import formatDuration from 'date-fns/formatDuration'
import AppHeader from '~/components/layout/AppHeader'
import AppFooter from '~/components/layout/AppFooter'

export default {
  components: {
    AppHeader,
    AppFooter
  },

  data() {
    return {
      bannerText: 'You are viewing a locally stored copy of the data'
    }
  },

  computed: {
    ...mapGetters({
      showBanner: 'app/showBanner',
      isCachedData: 'regionEnergy/isCachedData',
      cachedDate: 'regionEnergy/cachedDate'
    })
  },

  watch: {
    isCachedData(cached) {
      if (cached) {
        const start = this.cachedDate
        const end = new Date()

        const duration = intervalToDuration({ start, end })
        const formatted = formatDuration(duration)

        this.bannerText = `You are viewing a locally stored copy of the data. (stored ${formatted} ago)`
      }
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

  .banner {
    text-align: center;
    background-color: #fff;
    vertical-align: middle;
    padding: 3px;
    font-size: 0.8em;
    font-weight: bold;
  }
}
</style>
