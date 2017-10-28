<template>
  <table>
    <thead>
    </thead>
    <tbody>
       <tr v-for="item in fuelTechSeries">
        <td>{{item.date}}</td>
        <td>{{item.wind}}</td>
      </tr>
    </tbody>
    
  </table>
</template>

<script>
import numeral from 'numeral'

export default {
  props: {
  	fuelTechSeries: Array,
    priceSeries: Object,
    showTotals: Boolean
  },
  data() {
    return {}
  },
  methods: {
    
  }
}

</script>

<style scoped>

</style>
