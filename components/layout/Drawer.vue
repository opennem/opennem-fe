<template>
  <div 
    :class="{ open: drawer }" 
    class="drawer-wrapper" 
    @click="close">
    <div class="drawer">
      <div 
        class="drawer-header" 
        @click="close">
        <logo class="header-logo" />
        <span class="close-button">
          <i class="fal fa-times" />
        </span>
      </div>

      <div class="menu">

        <div 
          v-for="view in views"
          :key="view.id">

          <hr 
            v-if="view.id === 'divider'" 
            style="margin: 0; height: 20px;border-bottom: 1px solid #dedede; background: transparent;">

          <nuxt-link
            v-else
            v-show="shouldShow(view.id)"
            :to="`/${view.id}${getRegionId(view.id)}`"
            :class="{ 'nuxt-link-active': view.id === currentView }"
            class="menu-item"
          >
            {{ view.label }}
            <span class="icon">
              <i class="fal fa-chevron-right" />
            </span>
          </nuxt-link>
        </div>
        <!-- 
        <nuxt-link
          v-for="view in views"
          :key="view.id"
          :to="`/${view.id}${getRegionId(view.id)}`"
          :class="{ 'nuxt-link-active': view.id === currentView }"
          class="menu-item"
        >
          {{ view.label }}
          <span class="icon">
            <i class="fal fa-chevron-right" />
          </span>
        </nuxt-link> -->
      </div>

      <div 
        v-show="isEmissionsView" 
        class="menu">
        <nuxt-link 
          :to="`/${currentView}/au/`" 
          class="menu-item">
          Australia
          <span class="icon">
            <i class="fal fa-chevron-right" />
          </span>
        </nuxt-link>

        <nuxt-link 
          :to="`/${currentView}/world/`" 
          class="menu-item">
          World
          <span class="icon">
            <i class="fal fa-chevron-right" />
          </span>
        </nuxt-link>
      </div>

      <div 
        v-show="!isEmissionsView && !isCompareView" 
        class="menu">
        <nuxt-link 
          :to="`/${currentView}/au/`" 
          class="menu-item">
          All Regions
          <span class="icon">
            <i class="fal fa-chevron-right" />
          </span>
        </nuxt-link>

        <hr class="dropdown-divider" >

        <nuxt-link
          v-for="link in links"
          :key="link.id"
          :to="`/${currentView}/${link.id}/`"
          :class="{
            'menu-item-child': link.isChild,
            'menu-item-first-child': link.isFirstChild,
            'menu-item-last-child': link.isLastChild
          }"
          class="menu-item"
        >
          {{ link.label }}
          <span class="icon">
            <i class="fal fa-chevron-right" />
          </span>
        </nuxt-link>
      </div>

      <div 
        v-show="!isEmissionsView && !isCompareView"
        class="app-options">
        <div class="control">
          <label>Contribution to</label>
          <consumption-generation-toggle />
        </div>
      </div>

      <app-footer />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import VIEWS from '~/constants/views.js'
import { getEnergyRegions } from '@/constants/energy-regions.js'
import Logo from '~/components/ui/Logo'
import ConsumptionGenerationToggle from '~/components/ui/ConsumptionGenerationToggle'
import AppFooter from '~/components/layout/AppFooter'

export default {
  components: {
    Logo,
    ConsumptionGenerationToggle,
    AppFooter
  },

  props: {
    open: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      drawer: false,
      views: VIEWS,
      regions: getEnergyRegions(),
      links: []
    }
  },

  computed: {
    ...mapGetters({
      currentView: 'currentView',
      showFeatureToggle: 'app/showFeatureToggle',
    }),
    regionId() {
      return this.$route.params.region
    },
    isEmissionsView() {
      return this.currentView === 'emissions'
    },
    isCompareView() {
      return this.currentView === 'compare'
    }
  },

  watch: {
    open(value) {
      this.drawer = value
    },
    currentView(view) {
      this.links = this.getLinks()
    },
    showFeatureToggle(show) {
      if (!show) {
        this.drawer = false
      }
    }
  },

  created() {
    this.links = this.getLinks()
  },

  methods: {
    getLinks() {
      // create links without 'all' since a divider is needed
      return this.regions
        .map((r) => {
          const isChild = r.parentRegion ? true : false
          const isFirstChild = r.parentFirstChild ? true : false
          const isLastChild = r.parentLastChild ? true : false

          return {
            id: r.id,
            label: r.label,
            isChild,
            isFirstChild,
            isLastChild
          }
        })
        .filter((r) => r.id !== 'au')
    },

    close() {
      window.scrollTo(0, 0)
      this.$emit('close')
    },

    getRegionId(viewId) {
      if (viewId === 'compare') return '/'
      const regionId = this.regionId || 'nem'
      return viewId === 'emissions' ? '/au/' : `/${regionId}/`
    },

    shouldShow(viewId) {
      return true
      // if (viewId !== 'compare') {
      //   return true
      // }
      // return this.featureCompare && viewId === 'compare'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

$menu-border-colour: #ccc;
$menu-border-colour-hover: #999;

.drawer-wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  left: -100%;
  transition: all 0.3s linear;

  .drawer {
    position: fixed;
    top: 0;
    bottom: 0;
    left: -100%;
    width: 300px;
    background-color: #eee;
    transition: all 0.2s ease-in-out;
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
  }

  .close-button {
    padding: 0.7rem 1.5rem;
    font-size: 1.5rem;
    color: $opennem-link-color;
  }

  &.open {
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.85);

    .drawer {
      left: 0;
    }
  }

  :deep(footer) {
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    .version {
      margin-top: 3px;
      margin-right: 0;
      float: right;
      &:first-of-type {
        float: left;
      }
    }

    .sources {
      clear: both;
      padding: 5px 0;
    }

    .left,
    .right {
      display: block;
    }

    .right {
      text-align: right;
    }

    .about-link {
      float: left;
      margin-right: 10px;
    }
  }
}

.header-logo {
  width: 2.3rem;
  max-height: 2.3rem;
  margin: 0.2rem $app-padding / 2;
  position: relative;
  top: 10px;
  left: 10px;
}

.menu {
  margin: 20px 0;

  .menu-item {
    display: block;
    padding: 4px 20px;
    color: #000;
    border-bottom: 1px solid #dedede;

    &.has-divider {
      border-bottom-color: #aaa;
    }

    &:hover {
      background: #dedede;
    }

    &.nuxt-link-active {
      font-weight: 600;
      border-right: 6px solid $opennem-link-color;
      color: $opennem-link-color;

      .icon {
        display: none;
      }
    }

    .icon {
      position: absolute;
      right: 15px;
      color: rgba(100, 100, 100, 0.5);
    }
  }

  .menu-item-child {
    padding-left: 2.5rem;
    position: relative;

    &::before {
      content: '';
      border-left: 1px dashed $menu-border-colour;
      position: absolute;
      top: 1px;
      bottom: 0;
      left: 1.5rem;
    }
    &::after {
      content: '';
      border-bottom: 1px dashed $menu-border-colour;
      position: absolute;
      width: 7px;
      top: 0;
      bottom: 14px;
      left: 1.5rem;
    }

    &.nuxt-link-active::after {
      border-color: $opennem-link-color;
    }

    &:hover::before,
    &:hover::after {
      border-color: $menu-border-colour-hover;
    }

    &.menu-item-first-child::before {
      top: 0px;
    }

    &.menu-item-last-child::before {
      bottom: 14px;
    }
  }
}
.app-options {
  padding: 0.5rem 0.6rem;
  margin: 0.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;

  .control {
    display: flex;
    justify-content: space-between;
    align-items: center;

    label {
      font-size: 0.8em;
      font-family: $family-secondary;
      font-weight: bold;
      color: #333;
    }
  }
}
</style>
