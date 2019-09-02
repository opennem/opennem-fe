<template>
  <nav>
    <nuxt-link to="/">Home</nuxt-link> |
    <nuxt-link to="/energy/nem">NEM</nuxt-link>
    <!-- <nuxt-link to="/datacheck">Data Check</nuxt-link> |
    <nuxt-link to="/vis">Vis</nuxt-link> |
    <nuxt-link to="/allregions">All Regions</nuxt-link> |
    <nuxt-link to="/nsw">Region: NSW</nuxt-link> |
    <nuxt-link to="/qld">Region: QLD</nuxt-link> |
    <nuxt-link to="/sa">Region: SA</nuxt-link> |
    <nuxt-link to="/tas">Region: TAS</nuxt-link> |
    <nuxt-link to="/vic">Region: VIC</nuxt-link> |
    <nuxt-link to="/dailyreport">Daily Report</nuxt-link> -->
  </nav>
</template>

<style lang="scss" scoped>
nav {
  background-color: #333;
  text-align: left;
  padding: 0.3rem;
  color: #999;

  a {
    color: #999;
    text-decoration: none;

    &.nuxt-link-exact-active {
      color: #fff;
    }
  }
}
</style>
