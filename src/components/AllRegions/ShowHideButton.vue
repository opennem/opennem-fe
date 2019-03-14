<template>
  <div class="panel-toggle-btns" v-if="isExportPng">
    <button class="legend-btn button is-small is-rounded is-primary is-inverted"
      :class="{
        'on': showSummaryPanel,
        'off': !showSummaryPanel,
      }"
      @click="toggleSummaryPanel">
      <span v-if="showSummaryPanel"><font-awesome-icon class="fal" :icon="iconRemove" /></span>
      <span v-else>Show Summary</span>
    </button>
    <button class="legend-btn checkbox-btn button is-small is-rounded is-primary is-inverted"
      :class="{
        'on': showSummaryPanel,
        'off': !showSummaryPanel,
      }"
      v-if="!showSummaryPanel">
        <label class="checkbox">
          <input type="checkbox" v-model="showPercent" /> Percentage
        </label>
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import {
  faTimesCircle,
} from '@fortawesome/fontawesome-pro-light';

export default {
  name: 'export-panel-buttons',
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      showPercent: true,
    };
  },
  computed: {
    ...mapGetters({
      isExportPng: 'isExportPng',
      showSummaryPanel: 'showSummaryPanel',
      exportShowPercent: 'exportShowPercent',
    }),
    iconRemove() {
      return faTimesCircle;
    },
  },
  watch: {
    showPercent(show) {
      this.$store.dispatch('exportShowPercent', show);
    },
  },
  mounted() {
    this.showPercent = this.exportShowPercent;
  },
  beforeDestroy() {
  },
  methods: {
    toggleSummaryPanel() {
      this.$store.dispatch('setSummaryPanel', !this.showSummaryPanel);
    },
  },
};
</script>

<style lang="scss" scoped>
.panel-toggle-btns {
  position: absolute;
  top: 0;
  z-index: 9;

  button {
    float: right;
    clear: both;
    display: block;
    margin-bottom: 0.2rem;
    position: absolute;
    padding-right: 10px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;

    .fal {
      position: relative;
      top: 1px;
      font-size: 18px;
    }

    &.checkbox-btn {
      margin-left: -109px;
      margin-top: 31px;
      color: #000;
      padding-right: 8px;
    }

    &.on {
      margin-left: -41px;
      padding-right: 0;

      .fal {
        position: relative;
        left: -5px;
        top: -1px;
      }

      &:active,
      &:focus {
        outline: none;
        box-shadow: none;
      }
    }
    
  }

  .legend-btn {
    top: 320px;
    margin-left: -119px;
  }
}
</style>