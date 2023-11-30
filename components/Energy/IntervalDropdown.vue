<template>
  <div 
    :class="{ 'is-active': dropdownActive }" 
    class="dropdown">
    <button
      v-on-clickaway="handleClickAway"
      class="dropdown-trigger button inverted is-selected"
      @click="handleClick"
    >
      <span class="selected">
        {{ selected }}
        <i
          v-if="showCaret"
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
        class="filter-menu dropdown-menu">
        <div class="dropdown-content">
          <button 
            v-for="option in options"
            :key="option"
            :class="{ 'is-selected': option === selected }"
            @click="() => handleOptionClick(option)">
            {{ option }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'

export default {
  mixins: [clickaway],

  props: {
    selected: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    showCaret: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      dropdownActive: false
    }
  },

  computed: {

  },

  watch: {
    options() {
      this.dropdownActive = false
    }
  },

  methods: {
    handleClick() {
      this.dropdownActive = !this.dropdownActive
    },
    handleOptionClick(option) {
      this.$emit('option-change', option)
    },
    handleClickAway() {
      this.dropdownActive = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

button.button.is-selected {
  box-shadow: none;
}
</style>
