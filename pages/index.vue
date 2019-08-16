<template>
  <section>
    <h1>Loading</h1>
  </section>
</template>

<script>
export default {
  layout: 'default',
  // middleware: 'root-redirect',

  created() {
    switch (this.$route.hash) {
      case '#/region/nsw/energy':
        this.$router.push({ path: 'energy/nsw1' })
        break
      case '#/region/qld/energy':
        this.$router.push({ path: 'energy/qld1' })
        break
      case '#/region/sa/energy':
        this.$router.push({ path: 'energy/sa1' })
        break
      case '#/region/tas/energy':
        this.$router.push({ path: 'energy/tas1' })
        break
      case '#/region/vic/energy':
        this.$router.push({ path: 'energy/vic1' })
        break

      case '#/all-regions/facilities':
        this.$router.push({ path: 'facilities/all' })
        break
      case '#/region/nem/facilities':
        this.$router.push({ path: 'facilities/nem' })
        break
      case '#/region/nsw/facilities':
        this.$router.push({ path: 'facilities/nsw1' })
        break
      case '#/region/qld/facilities':
        this.$router.push({ path: 'facilities/qld1' })
        break
      case '#/region/sa/facilities':
        this.$router.push({ path: 'facilities/sa1' })
        break
      case '#/region/tas/facilities':
        this.$router.push({ path: 'facilities/tas1' })
        break
      case '#/region/vic/facilities':
        this.$router.push({ path: 'facilities/vic1' })
        break
      case '#/region/wa/facilities':
        this.$router.push({ path: 'facilities/wa1' })
        break

      case '#/widget':
      case '#/widget/small':
        this.$router.push({ path: 'widget/small' })
        break
      case '#/widget/large':
        this.$router.push({ path: 'widget/large' })
        break

      case '#/region/all-regions/energy':
      default:
        this.$router.push({ path: 'energy/nem' })
    }
  }
}
</script>
