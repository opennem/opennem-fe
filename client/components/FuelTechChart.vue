<template>
  <div class="fuel-tech-chart-wrapper">
    <echart class="combineChart" :eData="eData"></echart>

<!--     <billboardChart
      :id="id"
      :type="type"
      :colgroups="colgroups"
    >       
    </billboardChart>
 -->
  </div>
</template>

<script>
// import billboardDataTransform from 'components/chart/billboard-data-transform'
// import billboardChart from 'components/chart/billboard'

import echartDataTransform from 'components/chart/echart-data-transform'
import echart from 'components/chart/echarts'

export default {
  components: {
    // billboardChart,
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
      // this.colgroups = billboardDataTransform(this.genData)
      this.eData = echartDataTransform(this.genData)
    }
  }
}

</script>

<style>
  
</style>
