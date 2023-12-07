<template>
  <div class="header-dropdowns">
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
              v-for="(option, i) in options"
              :key="option"
              :class="{
                'is-selected': option === selected,
                'dropdown-item-child dropdown-item-last-child': i === options.length - 1
              }"
              @click="() => handleOptionClick(option)">
              {{ option }}
            </button>
          </div>
        </div>
      </transition>
    </div>
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
$dropdown-border-colour: #dedede;
$dropdown-border-colour-hover: #999;

.header-dropdowns {
  .dropdown {
    font-size: 0.9rem;

    .dropdown-item {
      font-size: 0.9rem;
    }

    .dropdown-trigger {
      font-weight: 400;
      padding-bottom: calc(0.5em - 1px);
      padding-left: 1em;
      padding-right: 1em;
      padding-top: calc(0.5em - 1px);
      margin-right: 0;
    }
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
}


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
