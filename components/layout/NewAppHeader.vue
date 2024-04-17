<template>
  <header>
    <a 
      class="home-link" 
      href="https://openelectricity.org.au">
      <OpenElectricityLogo />
    </a>

    <nav :class="{ active: mobileNavActive }">
      <a 
        v-for="link in links" 
        :key="link.name"
        :href="link.path"
        :class="{ active: link.active }">
        {{ link.name }}
      </a>
    </nav>

    <BurgerButton 
      class="mobile-nav"
      :active="mobileNavActive" 
      @click="() => mobileNavActive = !mobileNavActive" />
  </header>
</template>

<script>
import OpenElectricityLogo from '../ui/OpenElectricityLogo.vue';
import BurgerButton from './BurgerButton.vue';

const topLevelLinks = [
  {
    name: 'Data Tracker',
    path: '/energy',
    active: true
  },
  {
    name: 'Facilities Map',
    path: '/facilities/nem'
  },
  {
    name: 'Future Scenarios',
    path: 'https://openelectricity.org.au/future-scenarios'
  },
  // {
  //   name: 'Latest Records',
  //   path: 'https://openelectricity.org.au/records'
  // },
  {
    name: 'Analysis',
    path: 'https://openelectricity.org.au/analysis',
    active: false
  },
  {
    name: 'About',
    path: 'https://openelectricity.org.au/content/about'
  }
];

export default {
  components: {
    OpenElectricityLogo,
    BurgerButton
  },

  data() {
    return {
      links: topLevelLinks
    };
  },

  computed: {
    mobileNavActive: {
      get() {
        return this.$store.state.app.mobileNavActive;
      },
      set(value) {
        this.$store.commit('app/mobileNavActive', value);
      }
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
  z-index: 100;
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
  gap: 2rem;

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
    color: rgb(53, 53, 53);

    &::after {
      content: "";
      display: block;
      width: 8px;
      height: 8px;
      border: .1rem solid #000000;
      margin-left: 10px;
      opacity: 0;
    }
  }

  a.active {
    font-weight: 700;

    &::after {
      border-color: #c74523;
      background-color: #c74523;
      opacity: 1;
    }
  }
}

.mobile-nav {
  display: none;
  @media screen and (max-width: 1036px) {
    display: block;
  }
}
</style>