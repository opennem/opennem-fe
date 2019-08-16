<template>
  <div class="container">
    <header>
      <app-logo class="app-logo" />
      <h1>National Electricity Market</h1>
    </header>
    <nuxt/>
  </div>
</template>

<script>
import AppLogo from '~/components/ui/Logo'

export default {
  components: {
    AppLogo
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
.container {
  border-top: 1px solid $opennem-link-color;
  max-width: 650px;
}

header {
  display: flex;
  align-items: center;

  .app-logo {
    width: 30px;
    margin: 4px 4px 0;
  }

  h1 {
    font-family: $header-font-family;
    font-weight: 600;
    position: relative;
    top: -2px;
  }
}
</style>
