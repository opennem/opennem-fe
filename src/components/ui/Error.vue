<template>
  <transition name="slide-fade">
    <div class="notification is-primary" v-if="error">
      {{errorMessage}}
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    message: String,
  },
  computed: {
    ...mapGetters({
      error: 'error',
      errorMessage: 'errorMessage',
    }),
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.notification {
  text-align: center;
}

</style>
