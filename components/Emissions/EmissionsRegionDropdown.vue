<template>
  <div
    :class="{'is-active': dropdownActive}"
    class="dropdown">
    <button
      v-on-clickaway="handleClickAway"
      class="dropdown-trigger button inverted"
      @click="handleClick">
      <span>
        <strong>{{ regionLabel }}</strong>
        <i
          :class="['fal dropdown-trigger-icon', dropdownActive ? 'fa-chevron-up' : 'fa-chevron-down']"
        />
      </span>
    </button>

    <transition name="slide-down-fade">
      <div
        v-show="dropdownActive"
        class="dropdown-menu">
        <div class="dropdown-content">
          <nuxt-link
            v-for="link in regions"
            :key="link.id"
            :to="{ name: link.id }"
            class="dropdown-item"
            @click.native="handleClick">
            {{ link.label }}
          </nuxt-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
import {
  getEmissionsRegions,
  getEmissionsRegionLabel
} from '@/constants/emissions-regions.js'

export default {
  mixins: [clickaway],

  data() {
    return {
      dropdownActive: false,
      regions: getEmissionsRegions()
    }
  },

  computed: {
    regionId() {
      return this.$route.name
    },
    regionLabel() {
      return getEmissionsRegionLabel(this.regionId)
    }
  },

  created() {},

  methods: {
    handleClick() {
      this.dropdownActive = !this.dropdownActive
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
