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
    
    <app-header />
    <nuxt/>
    <app-footer />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AppHeader from '~/components/layout/AppHeader'
import AppFooter from '~/components/layout/AppFooter'

export default {
  components: {
    AppHeader,
    AppFooter
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
      errorMessage: 'app/errorMessage'
    })
  },

  methods: {
    ...mapActions({
      doClearError: 'app/doClearError'
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
