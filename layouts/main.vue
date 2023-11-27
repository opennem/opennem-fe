<template>
  <div class="container-fluid">
    <transition name="slide-down-fade">
      <article 
        v-if="showError" 
        class="error-message message is-warning">
        <div class="message-header">
          <p>{{ errorHeader }}</p>
          <button 
            class="delete" 
            aria-label="delete" 
            @click="doClearError" />
        </div>
        <div 
          class="message-body" 
          v-html="errorMessage" />
      </article>
    </transition>

    <transition name="slide-down-fade">
      <article 
        v-if="siteAnnouncement && isAuOrWem && isEnergyPage" 
        class="message is-primary"
        style="font-size: 11px;">
        <div 
          class="message-body" 
          style="padding: 10px"
          v-html="siteAnnouncement" />
      </article>
    </transition>

    <NewAppHeader />
    <app-header />
    <nuxt />
    <app-footer v-if="!tabletBreak" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AppHeader from '~/components/layout/AppHeader'
import AppFooter from '~/components/layout/AppFooter'
import NewAppHeader from '~/components/layout/NewAppHeader.vue'

export default {
  components: {
    AppHeader,
    AppFooter,
    NewAppHeader
  },

  data() {
    return {
      bannerText: 'Error'
    }
  },

  computed: {
    ...mapGetters({
      showError: 'app/showError',
      errorHeader: 'app/errorHeader',
      errorMessage: 'app/errorMessage',
      tabletBreak: 'app/tabletBreak',
      siteAnnouncement: 'app/siteAnnouncement'
    }),

    routeName() {
      return this.$route.name
    },
    regionId() {
      return this.$route.params.region
    },

    isEnergyPage() {
      return this.routeName === 'energy-region'
    },
    isAuOrWem() {
      return this.regionId === 'au' || this.regionId === 'wem'
    }
  },

  methods: {
    ...mapActions({
      doClearError: 'app/doClearError'
    })
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.container-fluid {
  margin-bottom: 1rem;
  @include tablet {
    margin-bottom: 7rem;
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

  .error-message {
    position: absolute;
    top: 3rem;
    width: 500px;
    left: 50%;
    margin-left: -250px;
    z-index: 99999;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .message {
    margin-bottom: 0.5rem;
  }

  .message-body {
    border-left: 0;
    text-align: center;
  }
}
</style>
