<template>
  <footer>
    <div class="footer">
      <div class="level is-mobile footer-wrapper" v-if="isAbout">
        <div class="level-left">
          <p>
          </p>
        </div>
        <div class="level-right">
          <p>OpenNEM is a project of the <a href="http://energy-transition-hub.org/">Energy Transition Hub</a></p>
        </div>
      </div>

      <div class="level is-mobile footer-wrapper" v-else>
        <div class="level-left">
          <p>
            <span>Sources:</span>
            <a href="https://www.aemo.com.au/">AEMO</a>,
            <a href="http://www.bom.gov.au/">BoM</a>
          </p>
        </div>
        <div class="level-right">
          <p><router-link to="/about">About OpenNEM</router-link></p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  computed: {
    isAbout() {
      return this.$route.name === 'about';
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

a {
  color: #fff;
  border-bottom: 1px dashed #fff;
  padding-bottom: 0;
}
.footer {
  width: 100%;
  color: $opennem-primary-invert;
  font-size: 0.8rem;
  margin-top: 2rem;
  padding: 0.3rem 0 0.7rem;

  @include tablet {
    padding: 0;
  }
}

.footer-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.3rem 1rem 0.4rem;
}
</style>
