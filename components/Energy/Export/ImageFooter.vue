<template>
  <div class="export-footer">
    <div class="annotation-btns">
      <button
        v-if="!showAttribution"
        class="button is-small is-rounded is-primary is-inverted"
        @click="showAttribution = true">
        Add Attribution
      </button>
    </div>

    <div>
      <span>Sources:</span>
      <strong>{{ sources }}</strong>
    </div>

    <div v-if="showAttribution">
      Shared by 
      <strong
        contenteditable="true"
        @blur="onAttributionBlur">{{ exportAttribution }}</strong>
    </div>

  </div>
</template>

<script>
export default {
  props: {
    showBomSource: {
      type: Boolean,
      default: () => false
    },
    exporting: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      showAttribution: true
    }
  },
  computed: {
    exportAttribution() {
      return this.$store.getters.exportAttribution
    },
    regionId() {
      return this.$route.params.region
    },
    sources() {
      if (this.showBomSource) {
        return 'AEMO, BoM, OpenNEM'
      }
      return 'AEMO, OpenNEM'
    }
  },
  watch: {
    exporting(isExporting) {
      if (isExporting && this.exportAttribution === '@name') {
        this.showAttribution = false
      }
    }
  },
  methods: {
    onAttributionBlur(e) {
      if (e.target.innerText.trim() === '') {
        this.showAttribution = false
      } else {
        this.$store.dispatch('exportAttribution', e.target.innerText.trim())
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.export-footer {
  position: relative;
  padding: 0.5rem 1rem;
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  border-top: 1px dashed #ccc;

  &.no-border {
    border-top: none;
    margin-top: 0;
    padding-top: 0;
  }

  .annotation-btns {
    position: absolute;
    margin-top: -4px;
    left: -130px;
    width: 130px;
    text-align: right;

    button {
      padding-right: 10px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
}
strong {
  color: $opennem-link-color;
  display: inline;

  &[contenteditable] {
    transition: all 0.2s ease-in;
    padding: 0 0.1rem;
    &:hover {
      background-color: #fff;
    }
  }
}
</style>
