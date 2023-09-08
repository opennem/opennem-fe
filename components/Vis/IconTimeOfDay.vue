<template>
  <svg 
    width="70" 
    height="68" 
    viewBox="0 0 70 68" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M2 65.8159C15.3748 70.0152 16.7321 1 35 1C53.2679 1 50.6825 64.4124 68 65.8159" 
      :stroke="strokeColour" 
      stroke-width="2" 
      stroke-linecap="round"/>
    <path 
      d="M2 65.4141C15.3748 69.4858 16.7321 51 35 51C53.2679 51 50.6825 64.0534 68 65.4141" 
      :stroke="strokeColour" 
      stroke-width="2" 
      stroke-linecap="round"/>
    <path 
      d="M2 65.7344C15.3748 69.8855 16.7321 24 35 24C53.2679 24 50.6825 64.3471 68 65.7344" 
      :stroke="averageColour" 
      stroke-width="4" 
      stroke-linecap="round"/>
    <path 
      d="M2 65.8944C16.0117 68.041 30.2857 36.7696 35 36" 
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