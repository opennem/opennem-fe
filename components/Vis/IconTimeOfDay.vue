<template>
  <svg 
    width="75" 
    height="78" 
    viewBox="0 0 75 78" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg">
    <line 
      x1="1.5" 
      y1="6.55668e-08" 
      x2="1.5" 
      y2="75" 
      :stroke="axisColour"
      stroke-width="3"/>
    <line 
      x1="75" 
      y1="76.5" 
      x2="-1.31134e-07" 
      y2="76.5" 
      :stroke="axisColour"
      stroke-width="3"/>
    <line 
      y1="16.5" 
      x2="10" 
      y2="16.5" 
      :stroke="axisColour"
      stroke-width="3"/>
    <line 
      y1="36.5" 
      x2="10" 
      y2="36.5" 
      :stroke="axisColour"
      stroke-width="3"/>
    <line 
      y1="56.5" 
      x2="10" 
      y2="56.5" 
      :stroke="axisColour"
      stroke-width="3"/>
    <path 
      d="M5 70.8159C18.3748 75.0152 19.7321 6 38 6C56.2679 6 53.6825 69.4124 71 70.8159" 
      :stroke="strokeColour"
      stroke-width="2" 
      stroke-linecap="round"/>
    <path 
      d="M5 70.7901C18.3748 74.9815 19.7321 15 38 15C56.2679 15 53.6825 69.3894 71 70.7901" 
      :stroke="strokeColour"
      stroke-width="2" 
      stroke-linecap="round"/>
    <path 
      d="M5 70.4141C18.3748 74.4858 19.7321 56 38 56C56.2679 56 53.6825 69.0534 71 70.4141" 
      :stroke="strokeColour"
      stroke-width="2" 
      stroke-linecap="round"/>
    <path 
      d="M5 70.6901C18.3748 74.8908 31.5179 35 49.7857 35C68.0536 35 53.6825 69.2862 71 70.6901" 
      :stroke="strokeColour"
      stroke-width="2" 
      stroke-linecap="round"/>
    <path 
      d="M5 70.7344C18.3748 74.8855 19.7321 29 38 29C56.2679 29 53.6825 69.3471 71 70.7344" 
      :stroke="averageColour" 
      stroke-width="4" 
      stroke-linecap="round"/>
    <path 
      d="M5 70.7684C18.3748 74.9525 32 14 36.5 12.5" 
      :stroke="todayColour"
      stroke-width="4" 
      stroke-linecap="round"/>
  </svg>
</template>

<script>
export default {
  props: {
    selected: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    axisColour() {
      return this.selected ? '#ccc' : '#333'
    },
    strokeColour() {
      return this.selected ? '#aaa' : '#bbb'
    },
    todayColour() {
      return this.selected ? '#eee' : '#000'
    },
    averageColour() {
      return this.selected ? '#fff' : '#C74523'
    }
  }
}
</script>