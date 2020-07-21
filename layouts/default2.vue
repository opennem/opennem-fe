<template>
  <div class="opennem-container">
    <section class="aside aside--left">
      <app-menu />
    </section>

    <nuxt class="content" />

    <app-footer />
  </div>
</template>

<script>
import AppFooter from '~/components/layout/AppFooter'
import AppMenu from '@/components/layout/v2/Menu'
export default {
  components: {
    AppFooter,
    AppMenu
  }
}
</script>

<style lang="scss" scoped>
.opennem-container {
  display: flex;
  align-items: stretch;
  height: 100%;

  section,
  .content {
    width: 100%;
    height: 100%;
  }

  .aside {
    width: 40%;
    background-color: transparent;
    position: sticky;
    top: 0;
  }
}
</style>
