<template>
  <div class="export-header">
    <h3 contenteditable="true">South Australia</h3>
    <h5 contenteditable="true">Description</h5>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'export-png-header',
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters({
    }),
  },
  methods: {
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.export-header {
  padding: 0 0.5rem;
  margin: 0 0 1rem;
}
h3 {
  font-weight: bold;
  font-size: 1.3rem;
  color: $opennem-primary;
}
h5 {
  color: #000;
  font-size: 0.9rem;
}
h3, h5 {
  transition: all .2s ease-in;
  padding: 0 .1rem;
  &:hover {
    background-color: #fff;
  }

}
</style>