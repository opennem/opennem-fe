<template>
  <div 
    class="container-fluid" 
    :style="`margin-bottom: ${isFacilityPage ? 0 : '7rem'}`">
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

    <article 
      v-if="showBanner && !mobileNavActive"
      class="message" 
      style="background-color: black; border-radius: 0; position: relative;"
    >
      <div 
        class="message-body open-electricity-banner" 
      >
        <div>
          <strong>OpenNEM</strong> is now
          <strong>Open Electricity</strong>.
        </div>
        <div>
          <a href="https://openelectricity.org.au/analysis/welcome-open-electricity">Read</a> about the update.
        </div>
      </div>

      <button 
        class="banner-close" 
        @click="handleClick"><i class="fal fa-times"/></button>
    </article>

    <!-- <article 
      v-if="showBanner && !mobileNavActive"
      class="message" 
      style="background-color: black; border-radius: 0; position: relative;"
    >
      <div 
        class="message-body open-electricity-banner" 
        style="padding: 10px 30px; justify-content: start;"
      >
        Due to recent changes to data conventions for reporting battery charge and discharge,
        OpenElectricty is currently under-reporting activity for some batteries.
        <br>
        We are working to resolve this as soon as possible.
      </div>
    </article> -->

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

    <div style="border-top: 1px solid #e5e5e5">
      <Toolbar />
      <!-- <app-header /> -->
      <nuxt />
    </div>
    
    <app-footer v-if="!tabletBreak" />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import AppHeader from '~/components/layout/AppHeader'
import Toolbar from '~/components/layout/Toolbar'
import AppFooter from '~/components/layout/AppFooter'
import NewAppHeader from '~/components/layout/NewAppHeader.vue'

export default {
  components: {
    AppHeader,
    AppFooter,
    Toolbar,
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
      siteAnnouncement: 'app/siteAnnouncement',
      showBanner: 'feature/showBanner'
    }),

    mobileNavActive() {
      return this.$store.state.app.mobileNavActive;
    },

    currentView() {
      return this.$store.getters.currentView
    },

    routeName() {
      return this.$route.name
    },
    regionId() {
      return this.$route.params.region
    },

    isEnergyPage() {
      return this.routeName === 'energy-region'
    },
    isFacilityPage() {
      return this.currentView === 'facilities'
    },
    isAuOrWem() {
      return this.regionId === 'au' || this.regionId === 'wem'
    }
  },

  methods: {
    ...mapActions({
      doClearError: 'app/doClearError'
    }),

    ...mapMutations({
      setShowBanner: 'feature/showBanner'
    }),

    handleClick() {
      this.setShowBanner(false)
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
    margin-bottom: 0;
  }

  .message-body {
    border-left: 0;
    text-align: center;
  }

  .open-electricity-banner {
    color: white;
    padding: 10px 20px;
    display: block;
    text-align: left;

    @include tablet {
      padding: 14px 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.45rem;
    }
  }

  .banner-close {
    cursor: pointer;
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1;
    background: none;
    border: 0; 
    color: white;
    font-size: 18px;

    @include tablet {
      right: 8px;
      top: 8px;
    }
  }
}
</style>
