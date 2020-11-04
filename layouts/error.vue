<template>
  <section>
    redirecting...
  </section>
</template>

<script>
export default {
  created() {
    this.$router.push({
      path: `${this.$route.path}/`
    })
  }
}
</script>
