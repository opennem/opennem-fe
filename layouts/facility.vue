<template>
  <div class="container-fluid">
    <!-- showBanner -->
    <!-- <article
      class="message"
      style="background-color: black; color: white; border-radius: 0; position: relative;"
    >
      <div
        class="message-body open-electricity-banner"
        style="display: flex; padding: 10px 30px; justify-content: center;"
      >
        <p style="color: white;">
          🔮 <a
            href="https://forms.gle/oHzViVX2ePhHtaFX6"
            target="_blank">Have your say</a> on the future of Open Electricity
        </p>
      </div>
    </article> -->

    <!-- <h1>
      You are viewing data and features that are still in
      <strong>development</strong>.
    </h1> -->

    <!-- <article 
      class="message" 
      style="background-color: black; border-radius: 0; position: relative; "
    >
      <div 
        class="message-body open-electricity-banner" 
        style="padding: 13px 20px; justify-content: center;"
      >
        <p style="text-align: center; color: white;">
          ⚡️ Sign up for Open Electricity updates - direct to your inbox 📬.
          <a 
          href="https://openelectricity.org.au/newsletter">Subscribe now</a>.
        </p>
      </div>
    </article> -->

    <article
      class="message facility-deprecation-banner"
      style="background-color: black; color: white; border-radius: 0; position: relative;"
    >
      <div
        class="message-body open-electricity-banner"
        style="display: flex; padding: 10px 30px; justify-content: center; flex-wrap: wrap; gap: 0.35rem;"
      >
        <p style="color: white; text-align: center;">
          A new version of this facility page is now available on Open Electricity.
          This page will be retired in the future.
          <a
            :href="newFacilityUrl"
            target="_blank"
            rel="noopener noreferrer"
          >View on Open Electricity →</a>
        </p>
      </div>
    </article>

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
    }),

    newFacilityUrl() {
      return `https://openelectricity.org.au/facility/${this.$route.params.facilityCode}`
    }
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

  .facility-deprecation-banner {
    margin-bottom: 0;

    .message-body {
      border-left: 0;
    }

    p {
      margin: 0;
    }

    a {
      color: white;
      text-decoration: underline;
      font-weight: 600;
      white-space: nowrap;

      &:hover {
        color: white;
        opacity: 0.85;
      }
    }
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
