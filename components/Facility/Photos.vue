<template>
  <section>
    <transition name="fade">
      <figure v-if="hasPhotos">
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
          :style="{ 'height': ratio > 2 ? '180px' : height }"
        >
      </figure>
    </transition>

    <transition name="fade">
      <div 
        v-if="!hasPhotos" 
        class="not-found-card card">
        <i class="fal fa-image"/>
        <span>Image not available</span>
      </div>
    </transition>

  </section>
</template>

<script>
export default {
  props: {
    hasPhotos: {
      type: Boolean,
      default: false
    },
    photos: {
      type: Array,
      default: () => []
    },
    name: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: '250px'
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
    margin: 0 auto;
    display: block;
    object-fit: cover;
    width: 100%;
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
      text-shadow: 1px 1px 1px #999;
    }
  }
}
</style>
