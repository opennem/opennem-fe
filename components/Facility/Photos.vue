<template>
  <section
    :class="{ 'full-screen': isFullScreen }"
    class="photobox"
    @click.self="handleExpandClick">
    <!-- <transition name="fade">
      <figure v-if="hasPhotos">
        <v-popover
          v-if="hasPhotoAuthor(primaryPhoto.author)"
          class="wiki-link-text"
          placement="auto">
          <i class="fal fa-info-circle"/>
          <template slot="popover">
            Photo by <a :href="primaryPhoto.author_link">{{ primaryPhoto.author }}</a>
          </template>
        </v-popover>

        <img
          :src="primaryPhoto.photo_url"
          :alt="`${name} facility`"
          :style="{ 'height': ratio > 2 ? '180px' : height }"
        >
      </figure>
    </transition> -->

    <transition name="fade">
      <VueperSlides
        v-if="hasPhotos"
        :dragging-distance="20"
        :fixed-height="isFullScreen ? '100%' : height"
        @slide="handleSlide">
        <VueperSlide
          v-for="(photo, index) in photos"
          :key="`photo${index}`"
          :image="photo.photo_url" />
      </VueperSlides>
    </transition>

    <button
      v-tooltip.left-start="isFullScreen ? 'Exit full screen' : 'Full screen'"
      v-if="hasPhotos"
      class="expand-button"
      @click="handleExpandClick">
      <i
        v-if="isFullScreen"
        class="fal fa-compress" />
      <i
        v-else
        class="fal fa-expand" />
    </button>

    <v-popover
      v-if="hasPhotos && hasPhotoAuthor(currentPhoto.author)"
      class="wiki-link-text"
      placement="auto">
      <i class="fal fa-info-circle"/>
      <template slot="popover">
        Photo by <a :href="currentPhoto.author_link">{{ currentPhoto.author }}</a>
      </template>
    </v-popover>

    <!-- <template v-slot:content>
      <figure>
        <img
          :src="photo.photo_url"
          :alt="`${name} facility`"
          :style="{ 'height': getRatio(photo) > 2 ? '180px' : height }"
        >
      </figure>
    </template> -->

    <!-- <figure>
      <img
        :src="currentPhoto.photo_url"
        :alt="`${name} facility`"
        :style="{ 'height': getRatio(currentPhoto) > 2 ? '180px' : height }"
      >
    </figure> -->

    <!-- <nav
      v-if="hasPhotos && photos.length > 1"
      class="photo-nav">
      <button @click="handlePrevClick">prev</button>
      <button @click="handleNextClick">next</button>
    </nav> -->

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
import { VueperSlides, VueperSlide } from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'

export default {
  components: {
    VueperSlides,
    VueperSlide
  },

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

  data() {
    return {
      isFullScreen: false,
      currentPhoto: null
    }
  },

  //   computed: {
  //     primaryPhoto() {
  //       let index = 0
  //       this.photos.every((d, i) => {
  //         if (d.is_primary) {
  //           index = i
  //           return false
  //         }
  //       })
  //       return this.photos[index]
  //     },
  //
  //     ratio() {
  //       return this.primaryPhoto.width / this.primaryPhoto.height
  //     }
  //   },

  created() {
    this.currentPhoto = this.photos[0]
  },

  methods: {
    hasPhotoAuthor(author) {
      return author && author !== ''
    },

    handleExpandClick() {
      this.isFullScreen = !this.isFullScreen
    },

    handleSlide(slide) {
      this.currentPhoto = this.photos[slide.currentSlide.index]
    },

    getRatio(photo) {
      return photo.width / photo.height
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';

$radius: 0.5rem;

.expand-button {
  position: absolute;
  top: 10px;
  right: 5px;
  z-index: 2;
  background: transparent;
  border: none;
  cursor: pointer;

  &:active,
  &:focus {
    border: none;
    outline: none;
  }

  i {
    color: #fff;
    font-size: 18px;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.6);
  }
}

.photobox {
  position: relative;

  &.full-screen {
    position: fixed;
    z-index: 9999;
    left: 0;
    right: 0;
    top: 0;
    bottom: -2px;
    padding: 6rem;
    background: rgb(0, 0, 0);
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.6) 100%
    );

    height: auto !important;

    @include mobile {
      padding: 4rem 1rem 1rem;
    }

    .expand-button {
      top: 2.5rem;
      right: 6rem;

      @include mobile {
        top: 20px;
        right: 15px;
      }
    }
  }
}

// figure {
//   position: relative;
//   img {
//     border-radius: $radius;
//     margin: 0 auto;
//     display: block;
//     object-fit: cover;
//     width: 100%;
//   }
//
//
// }

.wiki-link-text {
  position: absolute;
  bottom: 8px;
  z-index: 99;
  right: 12px;
  color: #fff;
  font-size: 20px;

  i {
    position: relative;
    top: 2px;
    text-shadow: 1px 1px 1px #999;
  }
}

::v-deep .vueperslides__track,
::v-deep .vueperslides__parallax-wrapper,
::v-deep .vueperslides__inner,
::v-deep .vueperslides,
::v-deep .vueperslides__track-inner,
::v-deep .vueperslide,
::v-deep .vueperslide__content-wrapper {
  border-radius: 10px;
}
::v-deep
  .vueperslides:not(.no-shadow):not(.vueperslides--3d)
  .vueperslides__parallax-wrapper:after {
  box-shadow: none;
}
::v-deep .vueperslides__arrows {
  opacity: 0;
}
.vueperslides {
  &:hover {
    ::v-deep .vueperslides__arrows {
      opacity: 1;
    }
  }
}
</style>
