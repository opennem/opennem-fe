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
  position: absolute;
  width: 30%;
  margin: 0 auto;
  top: 30vh;
  left: 0;
  right: 0;
}

</style>
