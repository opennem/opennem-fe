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
          v-tooltip="'OpenNEM status page'"
          rel="external"
          class="icon-link"
          target="_blank"
          href="https://status.opennem.org.au/">
          <i class="fal fa-fw fa-clipboard-list-check"/>
        </a>
        <a
          v-tooltip="'Developer documentation'"
          rel="external"
          class="icon-link"
          target="_blank"
          href="https://developers.opennem.org.au/">
          <i class="fal fa-fw fa-book"/>
        </a>
        <strong v-show="hasAPIversion && !isEmissionsAuRegion">API: {{ apiVersion }}</strong>
      </div>

      <div 
        v-show="isEmissionsAuRegion" 
        class="sources">
        <span v-if="showAnnualSource">
          Annual:
          <a
            target="_blank"
            href="https://www.industry.gov.au/data-and-publications/australias-emissions-projections-2021"
            title="Link to Australia’s emissions projections 2021">Australia’s emissions projections 2021 (fig. 7)</a>,
            Department of Industry, Science, Energy and Resources
        </span>
        <span v-else>
          Quarterly:
          <a
            target="_blank"
            href="https://www.industry.gov.au/data-and-publications/national-greenhouse-gas-inventory-quarterly-update-september-2021"
            title="Link to National Greenhouse Gas Inventory Quarterly Update: September 2021">National Greenhouse Gas Inventory Quarterly Update: September 2021</a>,
            Department of Industry, Science, Energy and Resources
        </span>          
      </div>

      <div 
        v-show="isEmissionsWorldRegion" 
        class="sources">
        <a
          target="_blank"
          href="https://doi.org/10.5281/zenodo.5494497"
          title="Link to dataset used by this visualisation">PRIMAP-hist (HISTCR; Kyoto GHG (AR4); Total excl. Landuse)</a>,
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

      <a
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
      </a>
      <nuxt-link
        to="/about/"
        class="about-link">About OpenNEM</nuxt-link>
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

      showAnnualSource: 'emissionsPage/showAnnualSource'
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

  watch: {
    showAnnualSource(val) {
      console.log(val)
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
  background-color: $opennem-link-color-dark;
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
