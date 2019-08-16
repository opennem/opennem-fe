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
        <nuxt-link
          v-for="view in views"
          v-show="showViewLink(view.id)"
          :key="view.id" 
          :to="`/${view.id}/${regionId}`"
          class="menu-item">
          {{ view.label }}
          <span class="icon">
            <i class="fal fa-chevron-right" />
          </span>
        </nuxt-link>
      </div>

      <div class="menu">
        <nuxt-link
          v-for="region in regions"
          v-show="showRegionLink(region.id)"
          :key="region.id" 
          :to="`/${currentView}/${region.id}`"
          :class="{'has-divider': region.id === 'nem'}"
          class="menu-item">
          {{ region.label }}
          <span class="icon">
            <i class="fal fa-chevron-right" />
          </span>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import VIEWS from '~/constants/views.js'
import REGIONS from '~/constants/regions.js'
import Logo from '~/components/ui/Logo'

export default {
  components: {
    Logo
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
      if (
        (this.regionId === 'all' || this.regionId === 'wa1') &&
        view === 'energy'
      ) {
        return false
      }
      return true
    },

    showRegionLink(regionId) {
      if (
        (regionId === 'all' || regionId === 'wa1') &&
        this.currentView === 'energy'
      ) {
        return false
      }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

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
}
</style>
