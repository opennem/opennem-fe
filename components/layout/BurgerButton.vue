<template>
  <button
    @click="handleButtonClick">
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="burger"
      :class="{ burgerActive: active }"
    >
      <g>
        <circle 
          cx="1.5" 
          cy="1.5" 
          r="1.5" 
          fill="black" />
        <circle 
          cx="10.5" 
          cy="1.5" 
          r="1.5" 
          fill="black" 
          class="hider" />
        <circle 
          cx="19.5" 
          cy="1.5" 
          r="1.5" 
          fill="black" />

        <circle 
          cx="1.5" 
          cy="10.5" 
          r="1.5" 
          fill="black" 
          class="hider" />
        <circle 
          cx="10.5" 
          cy="10.5" 
          r="1.5" 
          fill="black" />
        <circle 
          cx="19.5" 
          cy="10.5" 
          r="1.5" 
          fill="black" 
          class="hider" />

        <circle 
          cx="1.5" 
          cy="19.5" 
          r="1.5" 
          fill="black" />
        <circle 
          cx="10.5" 
          cy="19.5" 
          r="1.5" 
          fill="black" 
          class="hider" />
        <circle 
          cx="19.5" 
          cy="19.5" 
          r="1.5" 
          fill="black" />

        <line 
          x1="1.5" 
          y1="1.5" 
          x2="19.5" 
          y2="19.5" 
          stroke="black" />
        <line 
          x1="19.5" 
          y1="1.5" 
          x2="1.5" 
          y2="19.5" 
          stroke="black" />
      </g>
    </svg>
  </button>
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleButtonClick() {
      this.$emit('click');
    }
  }
}
</script>

<style lang="scss" scoped>
button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  outline: none;
}
.burger circle {
  opacity: 1;
  transition: opacity 0.5s ease;
}
.burger line {
  transition: all 0.5s ease;
  transform-origin: center;
  transform: scale(0);
}
.burgerActive circle.hider {
  opacity: 0;
}
.burgerActive line {
  transform: scale(1);
}
</style>