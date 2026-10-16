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

    <aside
      v-if="!mobileNavActive"
      class="tracker-banner"
      aria-label="New electricity tracker">
      <p>
        ⚡️
        <span class="copy-long">
          The next version of the Tracker is almost ready — be one of the
          first to explore it.
        </span>
        <span class="copy-short">The next Tracker is almost here.</span>
        <a
          href="https://openelectricity.org.au/tracker"
          target="_blank"
          rel="noopener noreferrer">
          Try it now <span aria-hidden="true">→</span>
        </a>
      </p>
    </aside>

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
import { mapGetters, mapActions } from 'vuex'
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

  computed: {
    ...mapGetters({
      showError: 'app/showError',
      errorHeader: 'app/errorHeader',
      errorMessage: 'app/errorMessage',
      tabletBreak: 'app/tabletBreak',
      siteAnnouncement: 'app/siteAnnouncement'
    }),

    mobileNavActive() {
      return this.$store.state.app.mobileNavActive
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
    margin-bottom: 0;
  }

  .message-body {
    border-left: 0;
    text-align: center;
  }

  .tracker-banner {
    background-color: black;
    color: white;
    padding: 12px 20px;
    text-align: center;

    .copy-long {
      @include mobile {
        display: none;
      }
    }

    .copy-short {
      @include tablet {
        display: none;
      }
    }

    a {
      color: white;
      font-weight: 600;
      text-decoration: underline;
      white-space: nowrap;

      &:hover {
        text-decoration-thickness: 2px;
      }

      &:focus-visible {
        outline: 2px solid white;
        outline-offset: 4px;
      }
    }
  }
}
</style>
