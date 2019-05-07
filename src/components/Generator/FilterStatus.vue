<template>
  <div class="dropdown" :class="{'is-active': dropdownActive}" v-on-clickaway="onClickAway">
    <button
      class="dropdown-trigger button is-rounded is-small is-primary"
      :class="{ 'is-inverted': true }"
      @click="dropdownActive = true"
    >
      <div class="dropdown-label">
        <span>Status:</span>
        <strong>{{ selectedStatusLabel }}</strong>
      </div>
      <font-awesome-icon class="fal" :icon="iconDown" />
    </button>

    <transition name="slide-down-fade">
      <div v-if="dropdownActive" class="dropdown-menu">
        <div class="dropdown-content">
          <a
            v-for="(d, index) in statuses"
            :key="index"
            :class="{ selected: selectedStatus === d.id }"
            class="dropdown-item"
            @click="handleClick(d.id)"
          >
            {{d.label}}
          </a>
        </div>
      </div>
    </transition> 
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faAngleDown } from '@fortawesome/fontawesome-pro-light';

const statuses = [
  {
    id: 'any',
    label: 'Any',
  },
  {
    id: 'Commissioned',
    label: 'Operating',
  },
  {
    id: 'Decommissioned',
    label: 'Retired',
  },
];

export default {
  mixins: [clickaway],

  components: {
    FontAwesomeIcon,
  },

  props: {
    status: String,
  },

  data() {
    return {
      statuses,
      selectedStatus: '',
      dropdownActive: false,
    }
  },

  computed: {
    iconDown() {
      return faAngleDown;
    },
    selectedStatusLabel() {
      return this.statuses.find(s => s.id === this.status).label;
    },
  },

  watch: {
    status(newValue) {
      this.selectedStatus = newValue;
    },
  },

  mounted() {
    this.selectedStatus = this.status;
  },

  methods: {
    onClickAway() {
      this.dropdownActive = false;
    },
    handleClick(status) {
      this.dropdownActive = false;
      this.$emit('statusChanged', status);
    },
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.dropdown-label {
  margin-right: 0.5rem;
}
.dropdown-content {
  font-family: $primary-font-family;

  .dropdown-item {
    font-size: 12px;
  }
}
</style>

