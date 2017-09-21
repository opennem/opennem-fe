<template>
  <div class="fuel-tech-chart-wrapper">
    <billboardChart name="fuel-tech" :dMe="d"></billboardChart>
  </div>
</template>

<script>
import billboardChart from 'components/chart/billboard'

export default {
  components: {
    billboardChart
  },
  props: {
  	genData: Object
  },
  data() {
  	return {
  		d: {}
  	}
  },
  mounted() {
  	this.d = this.$props.genData

  	console.log(this.d)
  }
}
</script>

<style>

</style>
