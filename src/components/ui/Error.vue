<template>
  <transition name="slide-fade">
    <div class="notification is-primary" v-if="fetchError">
      {{fetchErrorMessage}}
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
      fetchError: 'fetchError',
      fetchErrorMessage: 'fetchErrorMessage',
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
