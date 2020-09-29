<template>
  <figure>
    <img 
      :src="firstPhoto" 
      :alt="`${name} facility`" >
      <!-- <figcaption>
        1 of {{ photos.length }}
      </figcaption> -->
  </figure>
</template>

<script>
export default {
  props: {
    photos: {
      type: Array,
      default: () => []
    },
    name: {
      type: String,
      default: ''
    }
  },

  computed: {
    firstPhoto() {
      console.log(this.photos[0])
      return this.photos.length > 0 ? this.photos[0].photo_url : ''
    }
  }
}
</script>

<style lang="scss" scoped>
$radius: 0.5rem;

img {
  border-radius: $radius;
  max-height: 400px;
  margin: 0 auto;
  display: block;
}
</style>
