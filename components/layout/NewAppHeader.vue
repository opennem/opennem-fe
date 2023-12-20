<template>
  <header>
    <a 
      class="home-link" 
      href="https://openelectricity.org.au">
      <OpenElectricityLogo />
    </a>

    <nav>
      <a 
        v-for="link in links" 
        :key="link.name"
        :href="link.path"
        :class="{ active: link.active }">
        {{ link.name }}
      </a>
    </nav>
  </header>
</template>

<script>
import OpenElectricityLogo from '../ui/OpenElectricityLogo.vue';

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
    path: 'https://openelectricity.org.au/isp'
  },
  {
    name: 'Latest Records',
    path: 'https://openelectricity.org.au/records'
  },
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
    OpenElectricityLogo
  },

  data() {
    return {
      links: topLevelLinks
    };
  },
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
}

nav {
  display: flex;
  justify-content: space-between;
  gap: 2rem;

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
</style>