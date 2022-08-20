<template>
  <div class="panel">
    <div
      v-on-clickaway="handleClickAway"
      v-for="(d, i) in mapStyleSelections"
      :key="i"
      :class="{ selected: d.value === selectedMapStyle }"
      class="panel-block"
      @click="handleStyleClick(d.value)"
    >
      <img 
        :src="getImgSrc(d.preview)" 
        :alt="getImgAltText(d.label)" >
      <span>{{ d.label }}</span>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'
import { mapStyleSelections } from '~/constants/facilities/map-styles.js'

export default {
  mixins: [clickaway],

  data() {
    return {
      mapStyleSelections
    }
  },

  computed: {
    selectedMapStyle: {
      get() {
        return this.$store.getters['facility/selectedMapStyle']
      },
      set(val) {
        this.setSelectedMapStyle(val)
      }
    }
  },

  methods: {
    ...mapMutations({
      setSelectedMapStyle: 'facility/selectedMapStyle'
    }),
    handleStyleClick(style) {
      this.$emit('done')

      setTimeout(() => {
        this.selectedMapStyle = style
      }, 200)
    },
    handleClickAway() {
      console.log('jere')
      this.$emit('done')
    },
    getImgSrc(preview) {
      return `/images/map-styles/${preview}.png`
    },
    getImgAltText(label) {
      return `${label} style`
    }
  }
}
</script>

<style lang="scss" scoped>
.panel {
  background-color: #fff;
  display: flex;

  .panel-block {
    border-bottom: none;
    display: block;
    text-align: center;
    cursor: pointer;
    border-radius: 4px;
    margin: 7px;

    &:hover {
      background-color: #efefef;
    }

    &:first-child {
      margin-right: 0;
    }

    img {
      width: 50px;
      border-radius: 6px;
      border: 2px solid #ddd;
    }
    &.selected img {
      border-color: #c74523;
    }
    span {
      display: block;
      font-size: 10px;
      font-weight: 700;
    }
  }
}
</style>
