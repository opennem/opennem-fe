<template>
  <div class="ft-region-chart-wrapper">
    <div class="loader" v-if="!chartRendered"></div>
    <div id="ft-region-vis"></div>
  </div>
</template>

<script>
import * as moment from "moment";
import { mapGetters } from "vuex";

export default {
  created() {
    this.$store.dispatch("fetchFtGen");
  },
  data() {
    return {
      chartRendered: false
    }
  },
  computed: {
    ...mapGetters({
      ftGen: "getFtGen"
    })
  },
  watch: {
    ftGen(newData) {
      console.log(newData);
      
      this.chartRendered = true
    }
  }
}

</script>

<style>
#ft-region-vis {
  width: 100%;
  height: 400px;
}
a[title="JavaScript charts"] {
  display: none !important;
}
</style>
