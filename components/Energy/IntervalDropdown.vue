<template>
  <div 
    :class="{ 'is-active': dropdownActive, 'mobile': mobile }" 
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
            class="dropdown-item"
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
    },
    mobile: {
      type: Boolean,
      default: false
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

.mobile {
  &.dropdown {
    width: 100%;
    display: block;
  }

  button.dropdown-trigger {
    display: block;
    min-width: auto;
    width: 100%;
    border: 1px solid #6A6A6A;
    color: #353535;

    &:focus:not(:active) {
      box-shadow: none;
    }
    
    span {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
