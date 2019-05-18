<template>
  <footer>
    <div class="footer has-background-warning">
      <div class="level is-mobile footer-wrapper" v-if="isAbout">
        <div class="level-left">
          <p>
          </p>
        </div>
        <div class="level-right">
          <p>
            <a class="icon-link" href="https://twitter.com/opennem">
              <font-awesome-icon class="fal fa-lg" :icon="iconTwitter" />
            </a>
          </p>
          <p>
            <a class="icon-link" href="https://github.com/opennem">
              <font-awesome-icon class="fal fa-lg" :icon="iconGitHub" />
            </a>
          </p>
          <p>OpenNEM is a project of the <a href="http://energy-transition-hub.org/">Energy Transition Hub</a></p>
        </div>
      </div>

      <div class="level footer-wrapper" v-else>
        <div class="level-left">
          <p class="version">v2.2 beta</p>
          <p>
            <span>Sources:</span>
            <a href="https://www.aemo.com.au/">AEMO</a>,
            <a href="http://www.bom.gov.au/">BoM</a>
          </p>
        </div>
        <div class="level-right">
          <p v-if="isDev">
            <a class="icon-link" href="/#/features">
              <font-awesome-icon class="fal fa-lg" :icon="iconFeatures" />
            </a>
          </p>
          <p>
            <a class="icon-link" href="https://twitter.com/opennem">
              <font-awesome-icon class="fal fa-lg" :icon="iconTwitter" />
            </a>
          </p>
          <p>
            <a class="icon-link" href="https://github.com/opennem">
              <font-awesome-icon class="fal fa-lg" :icon="iconGitHub" />
            </a>
          </p>
          <p><router-link to="/about">About OpenNEM</router-link></p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faGithub, faTwitter } from '@fortawesome/fontawesome-free-brands';
import { faVial } from '@fortawesome/fontawesome-pro-light';

export default {
  components: {
    FontAwesomeIcon,
  },
  computed: {
    isAbout() {
      return this.$route.name === 'about';
    },
    iconGitHub() {
      return faGithub;
    },
    iconTwitter() {
      return faTwitter;
    },
    iconFeatures() {
      return faVial;
    },
    isDev() {
      const hostname = window.location.hostname;
      const localhost = 'localhost';
      const dev = 'dev.opennem.org.au';

      return hostname.includes(localhost) || hostname.includes(dev);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

a {
  // color: #fff;
  border-bottom: 1px dashed $opennem-primary;
  padding-bottom: 0;

  &.icon-link {
    border-bottom: none;
    margin-right: 0.75rem;
    position: relative;
    top: 1px;
  }
}

.version {
  font-weight: 600;
  display: block;
}

.level-right {
  @include mobile {
    display: flex;
    justify-content: flex-start;
    margin-top: 0.2rem;
  }
}

.footer {
  width: 100%;
  font-size: 0.8rem;
  padding: 0.3rem 0 0.7rem;
  display: none;

  @include tablet {
    margin-top: 2rem;
    display: block;
  }

  @include desktop {
    padding: 0;
    position: fixed;
    bottom: 0;
    z-index: 999;
  }
}

.footer-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.3rem 1rem 0.4rem;
  align-items: flex-start;
}

.map-attribution {
  @include desktop {
    margin-left: 2rem;
  }
  @include mobile {
    margin-bottom: 1rem;
  }
}
.level-left {
  @include tablet {
    display: flex;
  }
  @include desktop {
    display: flex;
  }
}

@media only screen and (min-width: 500px) {
  .level {
    display: flex;
  }
  .version {
    margin-right: 20px;
  }
}
</style>
