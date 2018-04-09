<template>
  <div class="export-footer level is-mobile">
    <div class="level-left">
      <p>
        Sources: <strong>AEMO, BoM, OpenNEM</strong>
      </p>
    </div>
    <div class="level-right">
      <p>
        Shared by <strong contenteditable="true">@name</strong>
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'export-png-footer',
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

.export-footer {
  padding: 0 0.5rem;
  margin: 1rem 0 0;
  font-size: 0.8rem;
}
strong {
  color: $opennem-primary;
  display: inline-block;

  &[contenteditable] {
    transition: all .2s ease-in;
    padding: 0 .1rem;
    &:hover {
      background-color: #fff;
    }
  }
}
</style>