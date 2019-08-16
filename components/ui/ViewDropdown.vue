<template>
  <div
    :class="{'is-active': dropdownActive}"
    class="dropdown">
    <a
      v-on-clickaway="handleClickAway"
      class="dropdown-trigger"
      @click="handleClick">
      <span>
        <strong>{{ viewLabel }}</strong>
        <i class="fal fa-chevron-down" />
      </span>          
    </a>

    <transition name="slide-down-fade">
      <div
        v-if="dropdownActive" 
        class="dropdown-menu">
        <div class="dropdown-content">
          <nuxt-link
            v-for="view in views" 
            v-show="showLink(view.id)"
            :key="view.id" 
            :to="`/${view.id}/${regionId}`"
            class="dropdown-item"
            @click.native="handleClick">
            {{ view.label }}
          </nuxt-link>
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
    currentView() {
      return this.$store.getters.currentView
    },
    viewLabel() {
      const view = this.views.find(d => d.id === this.currentView)
      return view ? view.label : ''
    }
  },

  methods: {
    handleClick() {
      this.dropdownActive = !this.dropdownActive
    },
    handleClickAway() {
      this.dropdownActive = false
    },
    showLink(view) {
      if (
        (this.regionId === 'all' || this.regionId === 'wa1') &&
        view === 'energy'
      ) {
        return false
      }
      return true
    }
  }
}
</script>
