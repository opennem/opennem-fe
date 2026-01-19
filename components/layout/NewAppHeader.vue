<template>
  <header>
    <a 
      class="home-link" 
      href="https://openelectricity.org.au">
      <OpenElectricityLogo />
    </a>

    <nav :class="{ active: mobileNavActive }">
      <template v-for="link in links">
        <button 
          type="button"
          v-if="link.children" 
          :key="`dropdown-${link.name}`"
          class="dropdown"
          @mouseenter="toggleDropdown(link.name)"
          @mouseleave="closeDropdown"
          :class="{ 'is-active': activeDropdown === link.name }"
          v-on-clickaway="closeDropdown"
        >
          <div class="dropdown-trigger">
            <a 
              :class="{ active: checkActive(link.name) }"
              aria-haspopup="true" 
              aria-controls="dropdown-menu">
              <span>{{ link.name }}</span>
              <span class="icon">
                <svg
                  class="dropdown-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :class="{ 'is-active': activeDropdown === link.name }"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </a>
          </div>
          <div
            class="dropdown-menu"
            id="dropdown-menu"
            role="menu">
            <div class="dropdown-content">
              <a 
                v-for="child in link.children"
                :key="child.name"
                :href="child.path"
                :class="{ 'active': child.name === 'Map' && isFacilitiesView }"
                class="dropdown-item">
                {{ child.name }}

                <span
                  v-if="child.name === 'Timeline'"
                  class="beta-badge">Beta</span>
              </a>
            </div>
          </div>
        </button>

        <a 
          v-else
          :key="`link-${link.name}`"
          :href="link.path"
          :class="{ active: checkActive(link.name) }">
          {{ link.name }}
        </a>
      </template>
    </nav>

    <BurgerButton 
      class="mobile-nav"
      :active="mobileNavActive" 
      @click="() => mobileNavActive = !mobileNavActive" />

    <div 
      class="footer-links" 
    >
      <AppFooter />
    </div>
  </header>
</template>

<script>
import {mapGetters} from 'vuex';
import { mixin as clickaway } from 'vue-clickaway';
import OpenElectricityLogo from '../ui/OpenElectricityLogo.vue';
import BurgerButton from './BurgerButton.vue';
import AppFooter from './AppFooter.vue';

const topLevelLinks = [
  {
    name: 'Tracker',
    path: '/energy',
    active: true
  },
  {
    name: 'Facilities',
    path: '/facilities/nem/?status=operating'
  },
  {
    name: 'Scenarios',
    path: 'https://openelectricity.org.au/scenarios'
  },
  {
    name: 'Records',
    path: 'https://openelectricity.org.au/records'
  },
  {
    name: 'Analysis',
    path: 'https://openelectricity.org.au/analysis',
    active: false
  },
  {
    name: 'About',
    path: 'https://openelectricity.org.au/about'
  }
];

export default {
  mixins: [clickaway],
  components: {
    OpenElectricityLogo,
    BurgerButton,
    AppFooter
  },

  data() {
    return {
      links: topLevelLinks,
      activeDropdown: null
    };
  },

  computed: {
    ...mapGetters({
      isEnergyView: 'isEnergyView',
      isFacilitiesView: 'isFacilitiesView'
    }),
    mobileNavActive: {
      get() {
        return this.$store.state.app.mobileNavActive;
      },
      set(value) {
        this.$store.commit('app/mobileNavActive', value);
      }
    }
  },

  methods: {
    checkActive(name) {
      if (this.isFacilitiesView && name === 'Facilities') {
        return true;
      } else if (this.isEnergyView && name === 'Tracker') {
        return true;
      } 
      return false
    },
    toggleDropdown(name) {
      this.activeDropdown = this.activeDropdown === name ? null : name;
    },
    closeDropdown() {
      this.activeDropdown = null;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

header {
  background-color: #fff;
  border-bottom: 1px solid $border-colour;
  padding: 1rem 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1000;
  height: 70px;

  .home-link {
    display: flex;
    align-items: center;
  }

  @media screen and (max-width: 1036px) {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    padding: 20px;
    border-bottom: 0;
    z-index: 1000;
  }
}

nav {
  display: flex;
  justify-content: space-between;
  gap: 40px;

  @media screen and (max-width: 1036px) {
    flex-direction: column;
    gap: 20px;
    position: fixed;
    justify-content: flex-start;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1001;
    background-color: #fff;
    font-weight: 500;
    font-size: 20px;
    padding: 20px;
    display: none;

    &.active {
      display: flex;
    }
  }

  a {
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #6A6A6A;

    &:hover {
      text-decoration: underline;

      .icon {
        text-decoration: none;
      }
    }

    // &::after {
    //   content: "";
    //   display: block;
    //   width: 8px;
    //   height: 8px;
    //   border: .1rem solid #000000;
    //   margin-left: 10px;
    //   opacity: 0;
    // }
  }

  a.active {
    font-weight: 700;
    color: #000;

    /** &::after {
      border-color: #c74523;
      background-color: #c74523;
      opacity: 1;
    }*/
  }
}

.mobile-nav {
  display: none;
  @media screen and (max-width: 1036px) {
    display: block;
  }
}

.beta-badge {
  background-color: #e87809;
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 0.5rem;
  text-transform: lowercase;
  font-family: $font-stack;
}

  .footer-links {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .dropdown {
    background-color: transparent;
    border: 0;
    padding: 0;
    margin: 0;
    cursor: pointer;

    .dropdown-trigger {
      a {
        gap: 0.2rem;
      }
      
      .dropdown-icon {
        transition: transform 0.2s ease;
        &.is-active {
          transform: rotate(180deg);
        }
      }
    }

    .dropdown-menu { 
      min-width: 7.5rem;

      .dropdown-content {
        width: 9rem;
        padding: 0;
        background-color: #fff;
        border-radius: 0.625rem;
        border: 1px solid #F1F0ED;
        box-shadow: 0 1px 0 0 rgba(10, 10, 10, 0.1);
      }

      .dropdown-item {
        display: flex;
        justify-content: space-between;
        width: auto;
        padding: 0.55rem 1rem;
        font-size: 1rem;
        color: #4a4a4a;
        border-bottom: 1px solid #F1F0ED;

        &:last-child {
          border-bottom: 0;
        }
        
        &:hover {
          text-decoration: none;
          background-color: #f5f5f5;
        }
      }
    }
  }

  @media screen and (max-width: 1036px) {
    .dropdown {
      width: 100%;
      display: block;

      .dropdown-trigger {
        width: 100%;
        a {
          width: 100%;
          justify-content: start;
          font-size: 20px;
        }
      }

      .dropdown-menu {
        position: static;
        width: 100%;
        display: none;

        .dropdown-content {
          box-shadow: none;
          padding: 0;
          width: 100%;
          margin-top: 0.5rem;
        }

        .dropdown-item {
          font-size: 16px;
          justify-content: start;
          gap: 1rem;
        }
      }

      

      &.is-active .dropdown-menu {
        display: block;
      }
    }
  }
</style>