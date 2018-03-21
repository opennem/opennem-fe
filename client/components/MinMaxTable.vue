<template>
  <table>
    <tbody>

      <tr>
        <td>{{price[0].value}}</td>
        <td>{{price[1].value}}</td>
      </tr>
      
      <tr>
        <td>{{temperature[0].value}}</td>
        <td>{{temperature[1].value}}</td>
      </tr>

    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    temperature: Array,
    price: Array
  }
}
</script>

