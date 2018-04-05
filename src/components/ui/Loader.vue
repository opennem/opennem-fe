<template>
  <span class="loading">
    <svg width="80px" height="60px" viewBox="5 0 80 60">
      <path class="sine-wave"
        fill="none" 
        stroke="#C74523" 
        stroke-width="4"
        stroke-linecap="square">
      </path>
    </svg>
  </span>
</template>

<script>
// inspiration from https://codepen.io/winkerVSbecks/pen/EVJGVj
export default {
  mounted() {
    const path = this.$el.querySelector('.sine-wave');
    const m = 0.512286623256592433;

    function buildWave(w, h) {
      const a = h / 4;
      const y = h / 2;

      const pathData = [
        'M', w * 0, y + (a / 2),
        'c', a * m, 0, -(1 - a) * m, -a, a, -a,
        's', -(1 - a) * m, a, a, a,
        's', -(1 - a) * m, -a, a, -a,
        's', -(1 - a) * m, a, a, a,
        's', -(1 - a) * m, -a, a, -a,
        's', -(1 - a) * m, a, a, a,
        's', -(1 - a) * m, -a, a, -a,
        's', -(1 - a) * m, a, a, a,
        's', -(1 - a) * m, -a, a, -a,
        's', -(1 - a) * m, a, a, a,
        's', -(1 - a) * m, -a, a, -a,
        's', -(1 - a) * m, a, a, a,
        's', -(1 - a) * m, -a, a, -a,
        's', -(1 - a) * m, a, a, a,
        's', -(1 - a) * m, -a, a, -a,
      ].join(' ');

      path.setAttribute('d', pathData);
    }

    buildWave(90, 60);
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.loading {
  align-items: center;
  border: none;
  display: flex;
  height: 19px;
  margin: 0 auto;
  width: 46px;

  @include tablet {
    height: 28px;
  }
}

svg { 
  margin: 0 auto; 
  overflow: hidden;
}

.sine-wave {
  stroke-dasharray: 0 50 101 50;
  animation: moveTheWave 1300ms linear infinite;  
}

@keyframes moveTheWave {
  0% { 
    stroke-dashoffset: 0; 
    transform: translate3d(0, 0, 0);
  }
  100% { 
    stroke-dashoffset: -133;
    transform: translate3d(-90px, 0, 0);
  }
}
</style>
