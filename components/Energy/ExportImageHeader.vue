<template>
  <div class="export-image-header">
    <div class="annotation-btns">
      <button
        v-if="!showTitle"
        class="button is-small is-rounded is-primary is-inverted"
        @click="showTitle = true">
        Add Title
      </button>
      <button
        v-if="!showDescription"
        class="button is-small is-rounded is-primary is-inverted"
        @click="showDescription = true">
        Add Description
      </button>
    </div>

    <h3 
      v-if="showTitle"
      contenteditable="true"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="true"
      @blur="onTitleBlur">
      {{ regionLabel }}
    </h3>
    <h5
      v-if="showDescription"
      contenteditable="true"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="true"
      @blur="onDescriptionBlur"
    >[Description]</h5>
  </div>
</template>

<script>
import REGIONS from '~/constants/regions.js'
export default {
  props: {
    exporting: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      showTitle: true,
      showDescription: true,
      description: '[Description]'
    }
  },

  computed: {
    regionId() {
      return this.$route.params.region
    },
    regionLabel() {
      const id = this.regionId
      const find = REGIONS.find(region => region.id === id)
      if (id === 'nem') {
        return 'OpenNEM'
      }
      if (find) {
        return find.label
      }
      return id
    }
  },

  watch: {
    exporting(isExporting) {
      if (isExporting && this.description === '[Description]') {
        this.showDescription = false
      }
    }
  },

  methods: {
    onTitleBlur(e) {
      if (e.target.innerText.trim() === '') {
        this.showTitle = false
      }
    },
    onDescriptionBlur(e) {
      if (e.target.innerText.trim() === '') {
        this.showDescription = false
      } else {
        this.description = e.target.innerText.trim()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.export-image-header {
  position: relative;
  padding: 0 0.5rem;
  margin: 0.5rem 0 1rem;

  .annotation-btns {
    position: absolute;
    left: -130px;
    margin-top: 10px;
    width: 130px;
    text-align: right;

    button {
      padding-right: 10px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    :first-child {
      margin-bottom: 0.5rem;
    }
  }
}
h3 {
  font-weight: bold;
  font-size: 1.3rem;
  color: $opennem-link-color;
}
h5 {
  color: #000;
  font-size: 0.9rem;
}
h3,
h5 {
  transition: all 0.2s ease-in;
  padding: 0 0.1rem;
  border-radius: 4px;
  &:hover {
    background-color: rgba(255, 255, 255, 0.6);
  }
}
</style>
