<template>
  <transition name="slide-fade">
    <div class="notification is-warning" v-if="warning">
      <button class="delete" @click="onCloseWarningButtonClicked"></button>
      {{warningMessage}}
    </div>
  </transition>
</template>

<script>
import moment from 'moment';
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters({
      warning: 'warning',
    }),
  },
  data() {
    return {
      warningMessage: 'Rooftop solar generation is not yet available before January 2017 at this resolution.'
    }
  },
  methods: {
    onCloseWarningButtonClicked() {
      this.$store.dispatch('warning', false);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.notification {
  padding: 3px;
  text-align: center;
  margin: 0;

  button.delete {
    top: 0.3rem;
  }
}

</style>
