<template>
  <div class="fuel-tech-chart-wrapper">
    <echart class="combineChart" :eData="eData"></echart>
  </div>
</template>

<script>
import echartDataTransform from 'components/chart/echart-data-transform'
import echart from 'components/chart/echarts'

export default {
  components: {
    echart
  },
  props: {
  	genData: Object
  },
  data() {
  	return {
  		id: `fuel-tech-${this._uid}`,
      type: 'area-spline',
      colgroups: null,
      eData: null
  	}
  },
  watch: {
    genData: function() {
      this.eData = echartDataTransform(this.genData)
    }
  }
}

</script>

<style>
  
</style>
