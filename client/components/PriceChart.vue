<template>
  <div class="price-chart-wrapper">
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
  	priceData: Object
  },
  data() {
  	return {
  		id: `price-${this._uid}`,
      type: 'line',
      colgroups: null,
  	}
  },
  watch: {
    priceData: function() {
      this.colgroups = billboardDataTransform(this.priceData)
    }
  }
}

</script>
