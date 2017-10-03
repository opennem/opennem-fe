<template>
  <table>
    <thead>
      <tr>
        <th colspan="3">{{series[0].date}}</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in series">
        <td>
          <div class="colour-sq" v-bind:style="{backgroundColor: item.colour}"></div>
        </td>
        <td>{{item.label}}</td>
        <td class="value">{{item.value}}</td>
        <td class="value">{{item.sum}}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
  	series: Array
  }
}

</script>

<style scoped>
table {
  font-size: 0.8rem;
  width: 330px;
  flex: 0 0 400px;
  border-collapse: collapse;
  margin-top: 5px;

  thead th, .value { text-align: right }

  .value {
    padding-left: 10px;
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
