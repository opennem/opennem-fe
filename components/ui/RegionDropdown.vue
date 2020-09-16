<template>
  <div
    :class="{'is-active': dropdownActive}"
    class="dropdown">
    <a
      v-on-clickaway="handleClickAway"
      class="dropdown-trigger"
      @click="handleClick">
      <span>
        <strong>{{ regionLabel }}</strong>
        <i class="fal fa-chevron-down" />
      </span>          
    </a>

    <transition name="slide-down-fade">
      <div
        v-show="dropdownActive" 
        class="dropdown-menu">
        <div class="dropdown-content">
          <nuxt-link
            v-show="showRegionLink('all')"
            :to="`/${currentView}/all/`" 
            class="dropdown-item" 
            @click.native="handleClick">All Regions</nuxt-link>
          
          <hr 
            v-show="showRegionLink('all')" 
            class="dropdown-divider">
          
          <nuxt-link
            :to="`/${currentView}/nem/`" 
            class="dropdown-item" 
            @click.native="handleClick">NEM</nuxt-link>

          <nuxt-link
            :to="`/${currentView}/nsw1/`" 
            class="dropdown-item dropdown-item-child dropdown-item-first-child" 
            @click.native="handleClick">New South Wales</nuxt-link>
          <nuxt-link
            :to="`/${currentView}/qld1/`" 
            class="dropdown-item dropdown-item-child" 
            @click.native="handleClick">Queensland</nuxt-link>
          <nuxt-link
            :to="`/${currentView}/sa1/`" 
            class="dropdown-item dropdown-item-child" 
            @click.native="handleClick">South Australia</nuxt-link>
          <nuxt-link
            :to="`/${currentView}/tas1/`" 
            class="dropdown-item dropdown-item-child" 
            @click.native="handleClick">Tasmania</nuxt-link>
          <nuxt-link
            :to="`/${currentView}/vic1/`" 
            class="dropdown-item dropdown-item-child dropdown-item-last-child" 
            @click.native="handleClick">Victoria</nuxt-link>
          <nuxt-link
            v-if="wemEnergy || currentView === 'facilities'"
            :to="`/${currentView}/wem/`" 
            class="dropdown-item" 
            @click.native="handleClick">Western Australia</nuxt-link>
        </div>
      </div>
    </transition> 
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'
import { getEnergyRegions } from '@/constants/energy-regions.js'

export default {
  mixins: [clickaway],

  data() {
    return {
      dropdownActive: false,
      regions: getEnergyRegions()
    }
  },

  computed: {
    ...mapGetters({
      wemEnergy: 'feature/wemEnergy'
    }),
    regionId() {
      return this.$route.params.region
    },
    regionLabel() {
      const region = this.regions.find(d => d.id === this.regionId)
      return region ? region.label : ''
    },
    currentView() {
      return this.$store.getters.currentView
    }
  },

  methods: {
    handleClick() {
      this.dropdownActive = !this.dropdownActive
      this.$store.dispatch('export/title', '')
      this.$store.dispatch('export/description', '')
      this.$store.dispatch('si/emissionsVolumePrefix', '')
    },
    handleClickAway() {
      this.dropdownActive = false
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
$dropdown-border-colour: #dedede;
$dropdown-border-colour-hover: #999;

.dropdown-menu {
  display: block;
}

.dropdown-item-child {
  padding-left: 2rem;

  &::before {
    content: '';
    border-left: 1px dashed $dropdown-border-colour;
    position: absolute;
    top: 1px;
    bottom: 0;
    left: 1.1rem;
  }
  &::after {
    content: '';
    border-bottom: 1px dashed $dropdown-border-colour;
    position: absolute;
    width: 7px;
    top: 0;
    bottom: 17px;
    left: 1.1rem;
  }

  &:hover::before,
  &:hover::after {
    border-color: $dropdown-border-colour-hover;
  }

  &.dropdown-item-first-child::before {
    top: 0px;
  }

  &.dropdown-item-last-child::before {
    bottom: 17px;
  }
}
</style>
