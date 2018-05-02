<template>
  <div class="export-footer">
    <div class="annotation-btns">
      <button class="button is-small is-rounded is-primary is-inverted"
        v-if="!showAttribution" @click="showAttribution = true">
        Add Attribution
      </button>
    </div>

    <div>
      <span>Sources:</span>
      <strong>AEMO, BoM, OpenNEM</strong>
    </div>

    <div v-if="showAttribution">
      Shared by 
      <strong contenteditable="true" @blur="onAttributionBlur">@name</strong>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import EventBus from '@/lib/event-bus';

export default {
  name: 'export-png-footer',
  data() {
    return {
      showAttribution: true,
      attribution: '@name',
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
    }),
  },
  methods: {
    onAttributionBlur(e) {
      if (e.target.innerText.trim() === '') {
        this.showAttribution = false;
      } else {
        this.attribution = e.target.innerText.trim();
      }
    },
    beforeDownloadPng() {
      if (this.attribution === '@name') {
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

  .annotation-btns {
    position: absolute;
    margin-top: -4px;
    left: -8.8rem;
    width: 130px;
    text-align: right;
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