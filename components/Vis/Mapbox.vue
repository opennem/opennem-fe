<template>
  <section class="mapbox">
    <no-ssr>
      <MglMap 
        :access-token="accessToken" 
        :map-style="mapStyle" />
    </no-ssr>
  </section>
</template>

<script>
const ACCESS_TOKEN = process.env.mapboxToken

export default {
  data() {
    return {
      accessToken: ACCESS_TOKEN,
      mapStyle: 'mapbox://styles/mapbox/streets-v11'
    }
  }
}
</script>

<style lang="scss" scoped>
.mapbox {
  height: 150px;

  ::v-deep .mapboxgl-map {
    border-radius: 10px;
  }
}
</style>
