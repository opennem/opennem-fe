<template>
  <div class="export-footer" :class="{ 'no-border': hideTopBorder }">
    <div class="annotation-btns">
      <button class="button is-small is-rounded is-primary is-inverted"
        v-if="!showAttribution" @click="showAttribution = true">
        Add Attribution
      </button>
    </div>

    <div>
      <span>Sources:</span>
      <strong>{{sources}}</strong>
    </div>

    <div v-if="showAttribution">
      Shared by 
      <strong contenteditable="true" @blur="onAttributionBlur">{{exportAttribution}}</strong>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import EventBus from '@/lib/event-bus';

export default {
  name: 'export-png-footer',
  props: {
    hideTopBorder: Boolean,
  },
  data() {
    return {
      showAttribution: true,
    };
  },
  mounted() {
    EventBus.$on('before.download.png', this.beforeDownloadPng);
  },
  beforeDestroy() {
    EventBus.$off('before.download.png');
  },
  computed: {
    ...mapGetters({
      exportRegion: 'getExportRegion',
      exportAttribution: 'exportAttribution',
      showTemperaturePanel: 'showTemperaturePanel',
    }),
    sources() {
      if (this.exportRegion !== 'OpenNEM' && this.showTemperaturePanel) {
        return 'AEMO, BoM, OpenNEM';
      }
      return 'AEMO, OpenNEM';
    },
  },
  methods: {
    onAttributionBlur(e) {
      if (e.target.innerText.trim() === '') {
        this.showAttribution = false;
      } else {
        this.$store.dispatch('exportAttribution', e.target.innerText.trim());
      }
    },
    beforeDownloadPng() {
      if (this.exportAttribution === '@name') {
        this.showAttribution = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

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
    left: -139px;
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
  color: $opennem-primary;
  display: inline;

  &[contenteditable] {
    transition: all .2s ease-in;
    padding: 0 .1rem;
    &:hover {
      background-color: #fff;
    }
  }
}
</style>