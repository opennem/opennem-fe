<template>
  <section class="facility-meta card">
    <table>
      <tbody>
        <tr>
          <th>Code</th>
          <td>{{ facilityId }}</td>
        </tr>
        <tr>
          <th>State</th>
          <td>{{ facilityState }}</td>
        </tr>
        <tr>
          <th>Number of units</th>
          <td>{{ unitsNum }}</td>
        </tr>
        <tr>
          <th>Participant</th>
          <td>{{ participantName }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>
export default {
  props: {
    facilityId: {
      type: String,
      default: ''
    },
    facilityState: {
      type: String,
      default: ''
    },
    unitsNum: {
      type: Number,
      default: 0
    },
    participantName: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped></style>
