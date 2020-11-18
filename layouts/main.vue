<template>
  <div class="container-fluid">
    <transition name="slide-down-fade">
      <article 
        v-if="showError" 
        class="error-message message is-warning">
        <div class="message-header">
          <p>{{ errorHeader }}</p>
          <button 
            class="delete" 
            aria-label="delete"
            @click="doClearError"/>
        </div>
        <div 
          class="message-body" 
          v-html="errorMessage" />
      </article>  
    </transition>

    <transition name="slide-down-fade">
      <FeatureToggle 
        v-if="showFeatureToggle"
        class="features"
        @done="setShowFeatureToggle(false)" />
    </transition>
    
    <app-header />
    <nuxt />
    <app-footer @showFeatureToggle="setShowFeatureToggle(true)" />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import AppHeader from '~/components/layout/AppHeader'
import AppFooter from '~/components/layout/AppFooter'
import FeatureToggle from '@/components/FeatureToggle'

export default {
  components: {
    AppHeader,
    AppFooter,
    FeatureToggle
  },

  data() {
    return {
      bannerText: 'Error'
    }
  },

  computed: {
    ...mapGetters({
      showError: 'app/showError',
      errorHeader: 'app/errorHeader',
      errorMessage: 'app/errorMessage',
      showFeatureToggle: 'app/showFeatureToggle'
    })
  },

  methods: {
    ...mapActions({
      doClearError: 'app/doClearError'
    }),
    ...mapMutations({
      setShowFeatureToggle: 'app/showFeatureToggle'
    })
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.container-fluid {
  margin-bottom: 1rem;
  @include tablet {
    margin-bottom: 3rem;
  }

  .features {
    position: fixed;
    z-index: 99999;
    width: 300px;
    top: 1rem;
    left: 50%;
    margin-left: -150px;
  }

  .error-message {
    position: absolute;
    top: 3rem;
    width: 500px;
    left: 50%;
    margin-left: -250px;
    z-index: 99999;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
