<template>
  <div 
    :class="{ 'is-active': dropdownActive }" 
    class="dropdown">
    <button
      v-on-clickaway="handleClickAway"
      class="dropdown-trigger button inverted"
      @click="handleClick"
    >
      <span>
        <strong>{{ regionLabel }}</strong>
        <i
          :class="[
            'fal dropdown-trigger-icon',
            dropdownActive ? 'fa-chevron-up' : 'fa-chevron-down'
          ]"
        />
      </span>
    </button>

    <transition name="slide-down-fade">
      <div 
        v-show="dropdownActive" 
        class="dropdown-menu">
        <div class="dropdown-content">
          <nuxt-link
            :to="{ path: `/${currentView}/au/`, query: getQuery(currentView) }"
            class="dropdown-item"
            @click.native="handleClick"
          >All Regions</nuxt-link
          >

          <hr class="dropdown-divider" >

          <nuxt-link
            v-for="link in links"
            :key="link.id"
            :to="{
              path: `/${currentView}/${link.id}/`,
              query: getQuery(currentView)
            }"
            :class="{
              'dropdown-item-child': link.isChild,
              'dropdown-item-first-child': link.isFirstChild,
              'dropdown-item-last-child': link.isLastChild
            }"
            class="dropdown-item"
            @click.native="handleClick"
          >
            {{ link.label }}
          </nuxt-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'
import {
  getEnergyRegions,
  ENERGY_NEM,
  ENERGY_WEM
} from '@/constants/energy-regions.js'
import regionDisplayTzs from '@/constants/region-display-timezones.js'

export default {
  mixins: [clickaway],

  data() {
    return {
      dropdownActive: false,
      regions: getEnergyRegions(),
      links: []
    }
  },

  computed: {
    ...mapGetters({
      currentView: 'currentView',
      query: 'app/query',
      facilitiesQuery: 'app/facilitiesQuery'
    }),
    regionId() {
      return this.$route.params.region
    },
    regionLabel() {
      return this.getRegionLabel(this.regionId)
    }
  },

  watch: {
    regionId(val) {
      const selectedTz =
        val === ENERGY_WEM
          ? regionDisplayTzs[ENERGY_WEM]
          : regionDisplayTzs[ENERGY_NEM]

      this.setDisplayTimeZone(selectedTz)
      this.setRegionTimezoneString(this.getRegionTimezoneString(val))
    },
    currentView(view) {
      this.links = this.getLinks()
    }
  },

  created() {
    const selectedTz =
      this.regionId === ENERGY_WEM
        ? regionDisplayTzs[ENERGY_WEM]
        : regionDisplayTzs[ENERGY_NEM]
    this.setDisplayTimeZone(selectedTz)
    this.setRegionTimezoneString(this.getRegionTimezoneString(this.regionId))
    this.links = this.getLinks()
  },

  methods: {
    ...mapMutations({
      setRegionTimezoneString: 'regionEnergy/regionTimezoneString',
      setDisplayTimeZone: 'displayTimeZone'
    }),
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
    getQuery(view) {
      return view === 'facilities' ? this.facilitiesQuery : this.query
    },
    getRegionLabel(regionId) {
      const region = this.regions.find((d) => d.id === regionId)
      return region ? region.label : ''
    },
    getRegionTimezoneString(regionId) {
      const region = this.regions.find((d) => d.id === regionId)
      return region ? region.timezoneString : null
    },
    handleClick() {
      this.dropdownActive = !this.dropdownActive
      this.$store.dispatch('export/title', '')
      this.$store.dispatch('export/description', '')
    },
    handleClickAway() {
      this.dropdownActive = false
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
