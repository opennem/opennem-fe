<template>
  <transition name="slide-fade">
    <div class="notification is-warning" v-if="warning">
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
      warningMessage: 'Dataset has missing rooftop solar data'
    }
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.notification {
  padding: 3px;
  text-align: center;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

</style>
