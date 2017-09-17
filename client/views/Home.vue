<template>
  <div class="">
    <h5>Electricity production in
      [region]
      for the week of
      [date selector]
    </h5>

    <FuelTechChart></FuelTechChart>
  </div>
</template>

<script>
import FuelTechChart from 'components/FuelTechChart'

export default {
  components: {
    FuelTechChart
  }
}
</script>

<style>
  h5 {
    text-align: center;
  }
</style>
