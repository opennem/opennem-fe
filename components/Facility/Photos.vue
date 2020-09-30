<template>
  <figure>
    <v-popover 
      class="wiki-link-text" 
      placement="auto">
      <i class="fal fa-info-circle"/>
      <template slot="popover">
        Photo by <a :href="photo.author_link">{{ photo.author }}</a>
      </template>
    </v-popover>

    <img 
      :src="photo.photo_url" 
      :alt="`${name} facility`"
      :style="{ 'height': ratio > 2 ? '180px' : 'auto'}"
    >

    
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

figure {
  position: relative;
  img {
    border-radius: $radius;
    max-height: 400px;
    margin: 0 auto;
    display: block;
    object-fit: cover;
  }

  .wiki-link-text {
    position: absolute;
    bottom: 8px;
    right: 12px;
    color: #fff;
    font-size: 1.2em;

    i {
      position: relative;
      top: 2px;
    }
  }
}
</style>
