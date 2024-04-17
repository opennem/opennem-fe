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
        <strong>{{ viewLabel }}</strong>
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
        v-if="dropdownActive" 
        class="dropdown-menu">
        <div class="dropdown-content">
          <span 
            v-for="view in views"
            :key="view.id">

            <hr 
              class="dropdown-divider"
              v-if="view.id === 'divider'">

            <nuxt-link
              v-else
              v-show="shouldShow(view.id)"
              :to="`/${view.id}${getRegionId(view.id)}`"
              :class="{ 'nuxt-link-active': view.id === currentView }"
              class="dropdown-item"
              @click.native="handleViewClick(view.id)"
            >
              {{ view.label }}
            </nuxt-link>
          </span>
          
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
import VIEWS from '~/constants/views.js'

export default {
  mixins: [clickaway],

  data() {
    return {
      dropdownActive: false,
      views: VIEWS
    }
  },

  computed: {
    regionId() {
      return this.$route.params.region
    },
    emissionsRegionId() {
      return this.$route.name
    },
    currentView() {
      return this.$store.getters.currentView
    },
    viewLabel() {
      const view = this.views.find((d) => d.id === this.currentView)
      return view ? view.label : ''
    }
  },

  methods: {
    handleClick() {
      this.dropdownActive = !this.dropdownActive
      this.$emit('dropdownActive', this.dropdownActive)
    },
    handleViewClick(view) {
      this.$store.dispatch('currentView', view)
    },
    handleClickAway() {
      this.dropdownActive = false
      this.$emit('dropdownActive', this.dropdownActive)
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
.dropdown-menu {
  display: block;
}
</style>
