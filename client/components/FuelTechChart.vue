<template>
  <div class="fuel-tech-chart-wrapper">
    <billboardChart
      :id="id"
      :type="type"
      :colgroups="colgroups"
    >       
    </billboardChart>
  </div>
</template>

<script>
import billboardDataTransform from 'components/chart/billboard-data-transform'
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
  		id: `fuel-tech-${this._uid}`,
      type: 'area-spline',
      colgroups: null,
  	}
  },
  watch: {
    genData: function() {
      this.colgroups = billboardDataTransform(this.genData)
    }
  }
}

</script>
