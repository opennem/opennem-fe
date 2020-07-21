<template>
  <div class="drawer">
    <div 
      class="drawer-header" 
      @click="close">
      <logo class="header-logo" />
      <!-- <span class="close-button">
        <i class="fal fa-times" />
      </span> -->
    </div>

    <div class="menu">
      <nuxt-link
        v-for="view in views"
        v-show="showViewLink(view.id)"
        :key="view.id"
        :to="`/${view.id}/${regionId}/`"
        class="menu-item"
      >
        {{ view.label }}
        <span class="icon">
          <i class="fal fa-chevron-right" />
        </span>
      </nuxt-link>
    </div>

    <div class="menu">
      <nuxt-link
        v-show="showRegionLink('all')"
        :to="`/${currentView}/all/`" 
        class="menu-item">
        All Regions
        <span class="icon">
          <i class="fal fa-chevron-right" />
        </span>
      </nuxt-link>
          
      <hr 
        v-show="showRegionLink('all')" 
        class="dropdown-divider">
          
      <nuxt-link
        :to="`/${currentView}/nem/`" 
        class="menu-item">
        NEM
        <span class="icon">
          <i class="fal fa-chevron-right" />
        </span>
      </nuxt-link>

      <nuxt-link
        :to="`/${currentView}/nsw1/`" 
        class="menu-item menu-item-child menu-item-first-child">
        New South Wales
        <span class="icon">
          <i class="fal fa-chevron-right" />
        </span>
      </nuxt-link>
      <nuxt-link
        :to="`/${currentView}/qld1/`" 
        class="menu-item menu-item-child">
        Queensland
        <span class="icon">
          <i class="fal fa-chevron-right" />
        </span>
      </nuxt-link>
      <nuxt-link
        :to="`/${currentView}/sa1/`" 
        class="menu-item menu-item-child">
        South Australia
        <span class="icon">
          <i class="fal fa-chevron-right" />
        </span>
      </nuxt-link>
      <nuxt-link
        :to="`/${currentView}/tas1/`" 
        class="menu-item menu-item-child">
        Tasmania
        <span class="icon">
          <i class="fal fa-chevron-right" />
        </span>
      </nuxt-link>
      <nuxt-link
        :to="`/${currentView}/vic1/`" 
        class="menu-item menu-item-child menu-item-last-child">
        Victoria
        <span class="icon">
          <i class="fal fa-chevron-right" />
        </span>
      </nuxt-link>
      <nuxt-link
        :to="`/${currentView}/wem/`" 
        class="menu-item">
        Western Australia
        <span class="icon">
          <i class="fal fa-chevron-right" />
        </span>
      </nuxt-link>
    </div>

    <div class="app-options">
      <div class="control">
        <label>Contribution to</label>
        <consumption-generation-toggle />
      </div>
    </div>
  </div>
</template>

<script>
import VIEWS from '~/constants/views.js'
import REGIONS from '~/constants/regions.js'
import Logo from '~/components/ui/Logo'
import ConsumptionGenerationToggle from '~/components/ui/ConsumptionGenerationToggle'

export default {
  components: {
    Logo,
    ConsumptionGenerationToggle
  },

  props: {
    open: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      drawer: true,
      views: VIEWS,
      regions: REGIONS
    }
  },

  computed: {
    regionId() {
      return this.$route.params.region
    },
    currentView() {
      return this.$store.getters.currentView
    }
  },

  watch: {
    open(value) {
      this.drawer = value
    }
  },

  methods: {
    close() {
      window.scrollTo(0, 0)
      this.$emit('close')
    },

    showViewLink(view) {
      if (this.regionId === 'all' && view === 'energy') {
        return false
      }
      return true
    },

    showRegionLink(regionId) {
      if (regionId === 'all' && this.currentView === 'energy') {
        return false
      }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

$menu-border-colour: #ccc;
$menu-border-colour-hover: #999;

.drawer {
  padding-bottom: 30px;
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
    position: relative;
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
