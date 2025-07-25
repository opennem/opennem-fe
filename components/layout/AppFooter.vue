<template>
  <footer class="">
    <div class="left">
      <div class="version">
        <span 
          v-if="isDev" 
          class="tag">DEV</span>
        <strong>v{{ version }}</strong>
      </div>

      <div class="version">
        <a 
          v-tooltip="'Open Electricity status page'" 
          rel="external" 
          class="icon-link" 
          target="_blank"
          href="https://status.opennem.org.au/">
          <i class="fal fa-fw fa-clipboard-list-check" />
        </a>
        <a 
          v-tooltip="'Developer documentation'" 
          rel="external" 
          class="icon-link" 
          target="_blank"
          href="https://developers.opennem.org.au/">
          <i class="fal fa-fw fa-book" />
        </a>
        <strong v-show="hasAPIversion && !isEmissionsAuRegion">API: {{ apiVersion }}</strong>
      </div>

      <div 
        v-show="isEmissionsAuRegion" 
        class="sources">
        Source:

        <a 
          :href="footerSourceUrl" 
          :title="`Link to ${footerSourceLabel}`" 
          target="_blank">{{ footerSourceLabel }}</a>
      </div>

      <div 
        v-show="isEmissionsWorldRegion" 
        class="sources">
        <a 
          target="_blank" 
          href="https://zenodo.org/records/13752654"
          title="Link to dataset used by this visualisation">Gütschow, J.; Busch, D.; Pflüger, M. (2024): The PRIMAP-hist national historical emissions time series v2.6 (1750-2023). zenodo. doi:10.5281/zenodo.13752654.</a>
      </div>

      <div 
        v-show="!isEmissionsAuRegion && !isEmissionsWorldRegion" 
        class="sources">
        Sources:
        <a 
          rel="external" 
          href="https://www.aemo.com.au/" 
          title="Link to AEMO">AEMO</a>,
        <a 
          rel="external" 
          href="http://apvi.org.au/" 
          title="Link to APVI">APVI</a>,
        <a 
          rel="external" 
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
        v-tooltip="'Experimental features'" 
        ref="featureElement" 
        class="icon-link" 
        target="_blank"
        @click.stop="handleFeatureToggleClick">
        <i class="fal fa-fw fa-vial" />
      </a>

      <!-- <a 
        v-tooltip="'Twitter'" 
        rel="external" 
        class="icon-link" 
        target="_blank" 
        href="https://twitter.com/opennem">
        <i class="fab fa-fw fa-twitter" />
      </a>
      <a 
        v-tooltip="'Github'" 
        rel="external" 
        class="icon-link" 
        target="_blank" 
        href="https://github.com/opennem">
        <i class="fab fa-fw fa-github" />
      </a> -->
      <a 
        v-tooltip="'Creative Commons Attribution 4.0 International License (CC BY 4.0)'" 
        rel="external" 
        class="icon-link" 
        target="_blank" 
        href="https://creativecommons.org/licenses/by/4.0/">
        <i class="fab fa-fw fa-brands fa-creative-commons" />
        <i class="fab fa-fw fa-brands fa-creative-commons-by" />
      </a>
      
    </div>
  </footer>
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
      currentView: 'currentView',
      apiVersion: 'app/apiVersion',
      showFeatureToggle: 'app/showFeatureToggle',

      footerSourceLabel: 'emissionsPage/footerSourceLabel',
      footerSourceUrl: 'emissionsPage/footerSourceUrl'
    }),

    isDev() {
      return this.hostEnv === 'dev'
    },

    hasAPIversion() {
      return this.apiVersion
    },

    isEmissionsAuRegion() {
      return this.$route.name === 'emissions-au'
    },

    isEmissionsWorldRegion() {
      return this.$route.name === 'emissions-world'
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
    text-align: left;
  }
}

footer {
  padding: $app-padding / 4 $app-padding;
  justify-content: space-between;
  font-size: 11px;
  display: none;
  background-color: black;
  color: #fff;

  strong {
    color: #fff;
  }

  .left,
  .right {
    display: flex;
    align-items: center;
    position: relative;
  }

  a {
    color: #fff;
    border-bottom: 1px dashed #fff;

    &:hover {
      border-bottom-style: solid;
    }

    &.icon-link {
      border-bottom-style: none;
      margin-right: 5px;
      font-size: 13px;
    }
  }

  .version {
    margin-right: 1rem;

    .tag {
      padding: 1px 4px;
      font-size: 9px;
      font-weight: 700;
      height: auto;
      margin-right: 5px;
    }
  }

  @include mobile {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
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
