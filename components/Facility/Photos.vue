<template>
  <figure>
    <img 
      :src="photo" 
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
    photo() {
      let width = this.photos[0].width
      let photoIndex = 0
      this.photos.forEach((d, i) => {
        if (d.width > width) {
          width = d.width
          photoIndex = i
        }
      })
      return this.photos[photoIndex].photo_url
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