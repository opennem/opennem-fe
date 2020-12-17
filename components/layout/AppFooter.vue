<template>
  <div>
    <footer class="has-background-warning">
      <div class="left">
        <div class="version">
          <span
            v-if="isDev"
            class="tag">DEV</span>
          <strong>v{{ version }} beta</strong>
        </div>
        <div
          v-if="hasAPIversion"
          class="version">
          API: <strong>{{ apiVersion }}</strong>
        </div>
        <div class="sources">
          Sources:
          <a
            href="https://www.aemo.com.au/"
            title="Link to AEMO">AEMO</a>,
          <a
            href="http://apvi.org.au/"
            title="Link to APVI">APVI</a>,
          <a
            href="http://www.bom.gov.au/"
            title="Link to BoM">BoM</a>
        </div>
      </div>

      <div class="right">

        <!-- :style="{ right: `${featureRightPos}px`, bottom: `${featrueBottomPos}px` }" -->

        <transition name="slide-up-fade">
          <FeatureToggle
            v-if="showFeatureToggle"

            class="features"
            @done="setShowFeatureToggle(false)" />
        </transition>

        <a
          ref="featureElement"
          class="icon-link"
          @click.stop="handleFeatureToggleClick">
          <i class="fal fa-vial" />
        </a>

        <a
          class="icon-link"
          href="https://twitter.com/opennem">
          <i class="fab fa-twitter" />
        </a>
        <a
          class="icon-link"
          href="https://github.com/opennem">
          <i class="fab fa-github" />
        </a>
        <nuxt-link
          to="/about/"
          class="about-link">About OpenNEM</nuxt-link>
      </div>
    </footer>
  </div>

</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import FeatureToggle from '@/components/FeatureToggle'

export default {
  components: {
    FeatureToggle
  },

  data() {
    return {
      version: this.$config.version
    }
  },

  computed: {
    ...mapGetters({
      hostEnv: 'hostEnv',
      apiVersion: 'app/apiVersion',
      showFeatureToggle: 'app/showFeatureToggle'
    }),

    isDev() {
      return this.hostEnv === 'dev'
    },

    hasAPIversion() {
      return this.apiVersion
    }
  },

  methods: {
    ...mapMutations({
      setShowFeatureToggle: 'app/showFeatureToggle'
    }),
    handleFeatureToggleClick() {
      this.setShowFeatureToggle(true)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.features.panel {
  position: absolute;
  z-index: 99999;
  width: 300px;
  right: 125px;
  bottom: 6px;
  font-size: 1.1em;

  @include mobile {
    right: 40px;
    bottom: 25px;
  }
}

footer {
  padding: $app-padding / 4 $app-padding;
  justify-content: space-between;
  font-size: 11px;
  display: none;

  .left,
  .right {
    display: flex;
    align-items: center;
    position: relative;
  }

  a {
    border-bottom: 1px dashed $opennem-link-color;
    &:hover {
      border-bottom-style: solid;
    }

    &.icon-link {
      border-bottom-style: none;
      padding-right: 0.5rem;
      font-size: 13px;
    }
  }

  .version {
    margin-right: 2rem;

    .tag {
      padding: 1px 4px;
      font-size: 9px;
      font-weight: 700;
      height: auto;
      margin-right: 5px;
    }
  }

  @include tablet {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
  }
}
</style>
