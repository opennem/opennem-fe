<template>
  <figure>
    <img 
      :src="photo.photo_url" 
      :alt="`${name} facility`"
      :style="{ 'height': ratio > 4 ? '150px' : 'auto'}"
    >
    <!-- <figcaption>
      1 of {{ ratio }}
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
      return this.photos[photoIndex]
    },
    ratio() {
      return this.photo.width / this.photo.height
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
  object-fit: cover;
}
</style>
