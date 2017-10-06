<template>
  <table>
    <thead>
      <tr>
        <th colspan="3">
          <span v-if="showTotals">Total</span>
          <span v-if="!showTotals">{{series[0].date}}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in series">
        <td>
          <div class="colour-sq" v-bind:style="{backgroundColor: item.colour}"></div>
        </td>
        <td>{{item.label}}</td>
        <td v-if="!showTotals" class="value">
          {{item.value}} (0.0%)
        </td>
        <td v-if="showTotals" class="value">{{item.sum}}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
  	series: Array,
    showTotals: Boolean
  }
}

</script>

<style scoped>
table {
  font-size: 0.8rem;
  width: 400px;
  flex: 0 0 400px;
  border-collapse: collapse;
  margin-top: 5px;

  thead th, .value { text-align: right }

  .value {
    padding-left: 10px;
    width: 200px;
  }

  td, th {
    padding: 5px;
    border-bottom: 1px solid #999;
  }

  .colour-sq {
    width: 15px;
    height: 15px;
    background-color: #999;
  }
}
</style>
