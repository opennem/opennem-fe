<template>
  <svg 
    width="66" 
    height="65" 
    viewBox="0 0 66 65" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg">
    <rect 
      width="66" 
      height="65" 
      :fill="fillColour"
    />
    
    <path 
      d="M0 9L11.7534 10.8586L22.6027 18.2929L33.4521 14.1111L44.3014 18.2929L55.1507 10.8586L66 14.1111V55H0V9Z" 
      :fill="areaColour"
    />
    <path 
      d="M0 24.5385L11.3014 23L22.1507 32.3846L33 24.5385L44.3014 27.9231L55.1507 32.3846L66 23V55H0V24.5385Z" 
      :fill="highlightColour"
    />
    <path 
      d="M0 48.8173L11.3014 48L22.1507 52.9856L33 48.8173L44.3014 50.6154L55.1507 52.9856L66 48V65H0V48.8173Z" 
      :fill="areaColour"
    />
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
    fillColour() {
      return this.selected ? '#C74523' : '#F8F8F8'
    },
    areaColour() {
      return this.selected ? '#AF7C7C' : '#c3c3c3'
    },
    highlightColour() {
      return this.selected ? '#8D2B11' : '#8D2B11'
    }
  }
}
</script>