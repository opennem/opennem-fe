<template>
  <div class="export-header">
    <div class="annotation-btns">
      <button class="button is-small is-rounded is-primary is-inverted"
        v-if="!showTitle" @click="showTitle = true">
        Add Title
      </button>
      <button class="button is-small is-rounded is-primary is-inverted"
        v-if="!showDescription" @click="showDescription = true">
        Add Description
      </button>
    </div>

    <h3 
      contenteditable="true"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="true"
      v-if="showTitle"
      @blur="onTitleBlur">
      {{exportRegion}}
    </h3>
    <h5
      contenteditable="true"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="true"
      v-if="showDescription"
      @blur="onDescriptionBlur"
    >Description</h5>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import EventBus from '@/lib/event-bus';

export default {
  name: 'export-png-header',
  data() {
    return {
      showTitle: true,
      showDescription: true,
      description: 'Description',
    };
  },
  computed: {
    ...mapGetters({
      exportRegion: 'getExportRegion',
    }),
  },
  mounted() {
    EventBus.$on('before.download.png', this.beforeDownloadPng);
  },
  beforeDestroy() {
    EventBus.$off('before.download.png');
  },
  methods: {
    onTitleBlur(e) {
      if (e.target.innerText.trim() === '') {
        this.showTitle = false;
      }
    },
    onDescriptionBlur(e) {
      if (e.target.innerText.trim() === '') {
        this.showDescription = false;
      } else {
        this.description = e.target.innerText.trim();
      }
    },
    beforeDownloadPng() {
      if (this.description === 'Description') {
        this.showDescription = false;
      }
      EventBus.$emit('download.png');
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.export-header {
  position: relative;
  padding: 0 0.5rem;
  margin: 0 0 1rem;

  .annotation-btns {
    position: absolute;
    left: -139px;
    margin-top: 10px;
    width: 130px;
    text-align: right;

    button {
      padding-right: 10px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    :first-child {
      margin-bottom: .5rem;
    }
  }
}
h3 {
  font-weight: bold;
  font-size: 1.3rem;
  color: $opennem-primary;
}
h5 {
  color: #000;
  font-size: 0.9rem;
}
h3, h5 {
  transition: all .2s ease-in;
  padding: 0 .1rem;
  &:hover {
    background-color: #fff;
  }
}
</style>