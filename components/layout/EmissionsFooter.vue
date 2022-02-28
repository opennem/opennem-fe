<template>
  <div>
    <footer class="">
      <div class="left">
        <div class="version">
          <span
            v-if="isDev"
            class="tag">DEV</span>
          <strong>v{{ version }}</strong>
        </div>
        
        <div class="sources">
          <span v-if="showAnnualSource">
            Annual:
            <a
              target="_blank"
              href="https://www.industry.gov.au/data-and-publications/australias-emissions-projections-2020"
              title="Link to Australia’s emissions projections 2020">Australia’s emissions projections 2020</a>,
              Department of Industry, Science, Energy and Resources
          </span>
          <span v-else>
            Quarterly:
            <a
              target="_blank"
              href="https://www.industry.gov.au/data-and-publications/national-greenhouse-gas-inventory-quarterly-update-september-2021"
              title="Link to National Greenhouse Gas Inventory Quarterly Update: September 2021">National Greenhouse Gas Inventory Quarterly Update: September 2021</a>,
              Department of Industry, Science, Energy and Resources
          </span>
          
          
        </div>
      </div>

      <div class="right">
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
        <nuxt-link
          to="/about/"
          class="about-link">About OpenNEM</nuxt-link>
      </div>
    </footer>
  </div>

</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    showAnnualSource: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      version: this.$config.version
    }
  },

  computed: {
    ...mapGetters({
      hostEnv: 'hostEnv'
    }),

    isDev() {
      return this.hostEnv === 'dev'
    }
  },

  methods: {}
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.features.panel {
  position: absolute;
  z-index: 99999;
  width: 300px;
  right: 125px;
  bottom: 6px;
  font-size: 1.1em;

  @include mobile {
    right: 40px;
    bottom: 25px;
    text-align: left;
  }
}

footer {
  padding: $app-padding / 4 $app-padding;
  justify-content: space-between;
  font-size: 11px;
  background-color: $opennem-link-color-dark;
  color: #fff;

  display: flex;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;

  strong {
    color: #fff;
  }

  .left,
  .right {
    display: flex;
    align-items: center;
    position: relative;
  }

  a {
    color: #fff;
    border-bottom: 1px dashed #fff;
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
    margin-right: 2rem;

    .tag {
      padding: 1px 4px;
      font-size: 9px;
      font-weight: 700;
      height: auto;
      margin-right: 5px;
    }
  }

  @include tablet {
  }
}
</style>
