<template>
  <footer class="has-background-warning">
    <div class="left">
      <span class="version">v3 beta</span>
      <div class="sources">
        Sources:
        <a
          href="https://www.aemo.com.au/"
          title="Link to AEMO">AEMO</a>,
        <a
          href="http://www.bom.gov.au/"
          title="Link to BoM">BoM</a>
      </div>
    </div>

    <div class="right">
      <nuxt-link
        class="icon-link"
        to="/features">
        <i class="fal fa-vial" />
      </nuxt-link>
      <a
        class="icon-link"
        href="https://twitter.com/opennem">
        <i class="fab fa-twitter" />
      </a>
      <a
        class="icon-link"
        href="https://github.com/opennem">
        <i class="fab fa-github" />
      </a>
      <nuxt-link to="/about">About OpenNEM</nuxt-link> 
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

footer {
  padding: $app-padding / 4 $app-padding;
  justify-content: space-between;
  font-size: 11px;
  display: none;

  .left,
  .right {
    display: flex;
    align-items: center;
  }

  a {
    border-bottom: 1px dashed $opennem-link-color;
    &:hover {
      border-bottom-style: solid;
    }

    &.icon-link {
      border-bottom-style: none;
      padding-right: 0.5rem;
      font-size: 13px;
    }
  }

  .version {
    font-weight: bold;
    margin-right: 2rem;
  }

  @include tablet {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
  }
}
</style>
